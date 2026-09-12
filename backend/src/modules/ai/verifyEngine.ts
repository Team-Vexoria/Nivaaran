/**
 * NIVAARAN — AI Verification, Deduplication & Categorization Engine
 * Stage 4 verification pipeline: validates reports, detects duplicates,
 * classifies into 100-domain taxonomy, then feeds factors to priority scorer.
 */
import { GOV_DOMAINS, AIProvider } from './AIProvider.js';
import { prisma } from '../../core/prisma.js';

export interface VerificationResult {
  isRealReport: boolean;
  confidence: number;
  dedupStatus: 'ORIGINAL' | 'DUPLICATE' | 'NEAR_DUPLICATE';
  duplicateOf?: string;
  category: string;
  domainCode: string;
  domainName: string;
  taxonomyMatchScore: number;
  verificationReasons: string[];
  /** Populated when Gemini Vision ran server-side on the submitted image. */
  visionResult?: { hasHazard: boolean; confidence: number; description: string; isReal?: boolean };
}

// L1 in-memory cache — id (challengeId or synthetic) → normalizedHash
const REPORT_STORE = new Map<string, string>();

// ── Boot seeding: load persisted DedupRecords into REPORT_STORE on worker start ──

/**
 * Seed the in-memory REPORT_STORE from the DedupRecord table.
 * Called once at worker startup so exact-hash dedup is restart-safe.
 */
export async function seedDedupStore(): Promise<void> {
  try {
    const rows: { hash: string; challenge_id: string }[] = await (prisma as any).$queryRawUnsafe(
      `SELECT hash, challenge_id FROM dedup_records ORDER BY created_at DESC LIMIT 20000`
    );
    for (const row of rows) {
      if (!REPORT_STORE.has(row.hash)) {
        REPORT_STORE.set(row.challenge_id, row.hash);
      }
    }
  } catch {
    // Table not yet migrated or empty — safe to ignore
  }
}

/**
 * Jaccard similarity between two strings (0.0–1.0) based on character bigrams.
 * Used for near-duplicate title comparison in the absence of Postgres trigram extension.
 */
function jaccardBigrams(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 4 || b.length < 4) return 0;
  const bigramsA = new Set<string>();
  for (let i = 0; i < a.length - 1; i++) bigramsA.add(a.slice(i, i + 2));
  const bigramsB = new Set<string>();
  for (let i = 0; i < b.length - 1; i++) bigramsB.add(b.slice(i, i + 2));
  let inter = 0;
  for (const b_ of bigramsA) if (bigramsB.has(b_)) inter++;
  const union = bigramsA.size + bigramsB.size - inter;
  return union === 0 ? 0 : inter / union;
}

function normalizeForDedup(report: any): string {
  const key = `${(report.title || '').toLowerCase().trim()}|${(report.description || '').toLowerCase().trim().slice(0, 180)}|${(report.district || '').toLowerCase()}|${(report.category || '').toLowerCase()}`;
  return key.replace(/\s+/g, ' ').trim();
}

function computeHash(str: string): string {
  // Simple deterministic hash for dedup (heuristic — not cryptographic)
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h = ((h << 5) - h) + ch;
    h |= 0;
  }
  return Math.abs(h).toString(16);
}

export async function verifyReport(report: any, existingIds?: string[]): Promise<VerificationResult> {
  const reasons: string[] = [];

  // 1. Basic verification (fake/real check via heuristics — token count, not raw chars)
  let isReal = true;
  const text = `${report.title || ''} ${report.description || ''}`;
  const lowerText = text.toLowerCase();
  const tokenCount = lowerText.split(/\s+/).filter((t: string) => t.length > 0).length;
  if (tokenCount < 8) {
    isReal = false;
    reasons.push('Report too short / insufficient detail (< 8 tokens)');
  }
  if (/\btest\s+report\b|\bdummy\b|\bfake\b|\bsample\b/i.test(lowerText)) {
    isReal = false;
    reasons.push('Contains test/fake indicators');
  }

  // 2. Server-side Vision Verification — runs Gemini on the image with a hard 3200 ms budget.
  //    Never flips isReal on timeout / network failure — only flips when the model confidently
  //    returns isReal===false with confidence >= 0.72.
  let visionResult: VerificationResult['visionResult'] = undefined;
  const imageUrl = report.evidenceImageUrl || report.imageUrl;
  if (imageUrl) {
    const VISION_TIMEOUT_MS = 3200;
    try {
      const visionPromise = AIProvider.vision!(imageUrl);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('VISION_TIMEOUT')), VISION_TIMEOUT_MS),
      );
      const vr = await Promise.race([visionPromise, timeoutPromise]);
      visionResult = vr;
      // Only reject when model is confident it is fake / no hazard (avoids false negatives)
      if (vr.isReal === false && (vr.confidence ?? 0) >= 0.72) {
        isReal = false;
        reasons.push(`Server-side vision rejected image (confidence ${vr.confidence ?? '?'}): ${vr.description || 'No hazard evidence detected'}`);
      } else if (vr.hasHazard === false && (vr.confidence ?? 0) >= 0.72) {
        isReal = false;
        reasons.push(`Server-side vision: no hazard evidence detected (confidence ${vr.confidence ?? '?'})`);
      } else {
        reasons.push(`Server-side vision verified: ${vr.description || 'Hazard evidence confirmed'}`);
      }
    } catch {
      // Timeout or network failure — do NOT reject on infrastructure failure
      visionResult = { hasHazard: true, confidence: 0.45, description: 'Vision unavailable — defaulted to allow with reduced confidence' };
      reasons.push('Server-side vision unavailable within budget — relied on frontend forensic gate');
    }
  }

  // 3. Deduplication — exact hash + near-duplicate spatial/semantic (T2.1)
  const normalized = normalizeForDedup(report);
  const hash = computeHash(normalized);
  let dedupStatus: VerificationResult['dedupStatus'] = 'ORIGINAL';
  let duplicateOf: string | undefined = undefined;

  // 3a. Exact hash match against L1 in-memory store
  for (const [id, storedHash] of REPORT_STORE.entries()) {
    if (storedHash === hash) {
      dedupStatus = 'DUPLICATE';
      duplicateOf = id;
      reasons.push(`Exact duplicate hash matches existing report ${id}`);
      break;
    }
  }

  // 3b. Authoritative DB hash lookup (catches cases where L1 is cold)
  if (dedupStatus === 'ORIGINAL') {
    try {
      const existingRecord: { hash: string; challenge_id: string } | null = await (prisma as any).dedupRecord.findUnique({
        where: { hash },
        select: { hash: true, challenge_id: true },
      });
      if (existingRecord) {
        dedupStatus = 'DUPLICATE';
        duplicateOf = existingRecord.challenge_id;
        reasons.push(`DedupRecord hash match from DB: challenge ${existingRecord.challenge_id}`);
      }
    } catch {
      // DedupRecord table not yet migrated — safe to skip
    }
  }

  // 3c. Near-duplicate: same district + Jaccard >= 0.72 + created within 14 days
  //     existingIds excludes the challenge itself when the pipeline runs post-save.
  if (dedupStatus === 'ORIGINAL') {
    const reportTitle = (report.title || '').toLowerCase().trim();
    const districtCode = (report.district_code || report.district || '').toUpperCase();
    const excludeIds = new Set(existingIds || []);
    if (districtCode && reportTitle.length >= 10) {
      try {
        const recentWindow = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const candidates = await prisma.challenge.findMany({
          where: {
            district_code: districtCode,
            created_at: { gte: recentWindow },
            deleted_at: null,
          },
          select: { id: true, title: true },
          take: 50,
          orderBy: { created_at: 'desc' },
        });
        for (const candidate of candidates) {
          // Skip challenges the caller already knows about (self, etc.)
          if (excludeIds.has(candidate.id)) continue;
          const sim = jaccardBigrams(reportTitle, (candidate.title || '').toLowerCase().trim());
          if (sim >= 0.72) {
            dedupStatus = 'NEAR_DUPLICATE';
            duplicateOf = candidate.id;
            reasons.push(`Near-duplicate (Jaccard ${sim.toFixed(2)}) with challenge ${candidate.id} in ${districtCode}`);
            break;
          }
        }
      } catch {
        // Prisma query failed — continue as ORIGINAL
      }
    }
  }

  // 4. Add to L1 cache + schedule DB persistence for ORIGINAL reports
  if (dedupStatus === 'ORIGINAL') {
    const challengeId = report.id || `rep-${Date.now()}`;
    REPORT_STORE.set(challengeId, hash);
    // Fire-and-forget: persist DedupRecord to DB (caller's transaction is responsible for Challenge create)
    // Store the hash + coords so the caller can upsert the record inside its transaction.
    (report as any).__dedupHash = hash;
    (report as any).__dedupDistrict = report.district_code || report.district || null;
    (report as any).__dedupLat = report.lat ?? null;
    (report as any).__dedupLng = report.lng ?? null;
  }

  // 5. Categorization / Taxonomy matching against 100 domains
  // Mirrors frontend aiTriageEngine.classifyCategoryNLP() but with extra category/dept bonuses.
  interface ScoredDomain { domain: typeof GOV_DOMAINS[number]; score: number; }
  const scored: ScoredDomain[] = [];
  for (const d of GOV_DOMAINS) {
    let score = 0;
    const dNameLower = d.name.toLowerCase();
    const dCodeLower = d.code.toLowerCase();
    const dCatLower = d.category.toLowerCase();
    // Problem-label hits (high signal) — +18 each
    for (const p of d.problems || []) {
      if (lowerText.includes(p.toLowerCase())) score += 18;
    }
    // Keyword hits — +10 each (capped at 40 to avoid single-domain blow-up)
    let keywordHits = 0;
    for (const kw of d.keywords || []) {
      if (lowerText.includes(kw.toLowerCase())) keywordHits++;
    }
    score += Math.min(keywordHits * 10, 40);
    // Exact name / code / category bonuses
    if (lowerText.includes(dNameLower) || dNameLower.includes(lowerText.slice(0, 12).trim())) score += 30;
    if (lowerText.includes(dCodeLower)) score += 25;
    if (lowerText.includes(dCatLower)) score += 10;
    // Dept overlap (light signal) — +6 each
    for (const dept of d.depts || []) {
      const deptTokens = dept.toLowerCase().split(/\s+/).filter((t: string) => t.length > 4);
      for (const tok of deptTokens) {
        if (lowerText.includes(tok)) { score += 6; break; }
      }
    }
    // Weight by domain importance for tie-breaking
    score += d.scoreWeight;
    scored.push({ domain: d, score });
  }
  scored.sort((a, b) => b.score - a.score);
  const bestEntry = scored[0] ?? { domain: GOV_DOMAINS[0], score: 0 };
  const bestDomain = bestEntry.domain;
  const bestScore = bestEntry.score;
  // Normalize to 0-100: max practical raw score ~90; add baseline so mediocre matches aren't zero.
  const taxonomyMatchScore = Math.min(100, Math.round(bestScore + 12));

  if (taxonomyMatchScore < 30) {
    reasons.push('Weak taxonomy match — manual review suggested');
  }

  return {
    isRealReport: isReal,
    confidence: isReal ? (0.85 + (taxonomyMatchScore / 200)) : 0.4,
    dedupStatus,
    duplicateOf,
    category: bestDomain.category,
    domainCode: bestDomain.code,
    domainName: bestDomain.name,
    taxonomyMatchScore,
    verificationReasons: reasons,
  };
}

export function getVerificationStore(): Map<string, string> {
  return REPORT_STORE;
}

// Export the dedup hash helpers so the Challenge create path (service.ts)
// persists the exact same hash inside its transaction.
export const dedupHelpers = { normalizeForDedup, computeHash, jaccardBigrams };
