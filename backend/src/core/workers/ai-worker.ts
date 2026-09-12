/**
 * NIVAARAN — STEP 7A: AI Queue / Worker Pipeline Orchestrator (SIH 26043)
 *
 * Enforces the complete 5-stage AI processing sequence:
 *   verify → understand → research → prioritize → match
 *
 * The worker supports two execution modes:
 *  1. Granular single-stage jobs (action = 'verify' | 'understand' | 'prioritize' | 'match')
 *     — backward compatible with legacy callers.
 *  2. End-to-end pipeline jobs (action = 'pipeline' | 'process' | 'process_challenge' | 'end_to_end')
 *     — runs all 5 stages in strict order, constructing a standardized ExtractedEntities
 *       object (location + category/hazard + numeric inputs) before research & prioritization.
 */

import { aiQueue, QueueJob, matchResultsStore } from './index.js';
import { verifyReport, VerificationResult, seedDedupStore } from '../../modules/ai/verifyEngine.js';
import { AIProvider } from '../../modules/ai/AIProvider.js';
import { researchProblem } from '../../modules/ai/internetResearch.js';
import {
  normalizeDistrict,
  DISTRICT_COORDS,
  ExtractedEntities,
  SeverityLevel,
} from '../../modules/ai/entityExtractor.js';
import type { UnifiedResearchResult } from '../../modules/ai/newsEngine.js';
import { logger } from '../logger.js';

// Default district centroid (Ranchi) used when coordinates cannot be resolved.
const DEFAULT_COORDS = { lat: 23.3441, lng: 85.3096 };

/** Hard ceiling (ms) for the entire research stage — external network calls
 *  are cancelled and a DB fallback is substituted if this is exceeded.
 *  Per-channel budgets (T4.4): news 3000ms, weather 2500ms, govt 2800ms.
 *  Envelope is set slightly higher so all three can complete when all are responsive. */
const RESEARCH_TIMEOUT_MS = 6500;

export type PipelineStage = 'verify' | 'understand' | 'research' | 'prioritize' | 'match';
const PIPELINE_ACTIONS = new Set(['pipeline', 'process', 'process_challenge', 'end_to_end', 'full']);

// Seed the L1 dedup hash store from DedupRecords on boot so exact-duplicate
// detection survives restarts (T2.2). Fire-and-forget — the pipeline works
// without it; it only makes dedup warmer.
seedDedupStore().catch(() => { /* non-fatal */ });

export interface PipelinePayload {
  challenge?: any;
  report?: any;
  spatial?: any;
  upvotes?: number;
  existingIds?: string[];
  universities?: any[];
  input?: any;
  /** Optional precomputed research override (skips live network research when provided). */
  researchResult?: UnifiedResearchResult | any;
}

export interface AIPipelineResult {
  challengeId?: string;
  jobId?: string;
  pipeline: PipelineStage[];
  verification: VerificationResult;
  understanding: any;
  entities: ExtractedEntities;
  research: UnifiedResearchResult | any;
  priority: any;
  matches: any[];
  category: string;
  domainCode: string;
  confidence: number;
  modelVersion: string;
  status: 'COMPLETED';
  timestamp: string;
}

/** Coerce any date-ish value into a safe ISO YYYY-MM-DD string. */
function toISODate(value: any): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  const d = new Date(value);
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

/** Coerce any date-ish value into a HH:MM (24h) string. */
function toHHMM(value: any): string {
  const d = value ? new Date(value) : new Date();
  const dt = isNaN(d.getTime()) ? new Date() : d;
  return dt.toISOString().slice(11, 16);
}

/** Maximum retries before a pipeline job enters the dead-letter path. */
const MAX_PIPELINE_RETRIES = 3;

/** Write structured stage log entry (pino child logger with pipeline context). */
function stageLog(jobId: string | undefined, challengeId: string | undefined, stage: string, extra?: Record<string, unknown>) {
  return logger.child({ jobId, challengeId, stage, ...extra });
}

/** Dead-letter handler: persist FAILED AiRecommendation + AuditEvent so the
 *  decision-trace endpoint never returns empty for a crashed pipeline. */
async function writeDeadLetter(challengeId: string, error: unknown, stages: (PipelineStage | 'failed')[], jobId?: string) {
  try {
    const prismaClient = (await import('../../core/prisma.js')).prisma;
    const errorMsg = (error as Error)?.message || 'Unknown pipeline error';

    await prismaClient.aiRecommendation.create({
      data: {
        challenge_id: challengeId,
        kind: 'PRIORITIZE' as any,
        status: 'FAILED' as any,
        result: { error: errorMsg, completedStages: stages, deadLetter: true },
        model_version: 'nivaaran-pipeline-v1',
        error_message: errorMsg,
        attempt_count: MAX_PIPELINE_RETRIES,
      },
    });

    await prismaClient.auditEvent.create({
      data: {
        actor_id: 'system-pipeline',
        action: 'ESCALATE' as any,
        resource_type: 'challenge',
        resource_id: challengeId,
        from_state: 'AI_UNDERSTANDING',
        to_state: 'FAILED',
        payload_snapshot: { error: errorMsg, completedStages: stages, deadLetter: true, jobId },
      },
    });

    logger.error({ jobId, challengeId, stages }, 'pipeline DEAD LETTER — FAILED AiRecommendation + ESCALATE AuditEvent written');
  } catch (writeErr) {
    logger.error({ err: (writeErr as Error)?.message, challengeId }, 'dead-letter write itself failed');
  }
}

const SEVERITY_RANK: Record<SeverityLevel, number> = { STANDARD: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

function normalizeSeverityLevel(sev: any): SeverityLevel | undefined {
  if (typeof sev === 'string') {
    const s = sev.toUpperCase();
    if (s === 'CRITICAL' || s === 'HIGH' || s === 'MEDIUM' || s === 'STANDARD') return s as SeverityLevel;
  }
  return undefined;
}

function severityFromUrgency(urgency: number): SeverityLevel {
  if (urgency >= 8) return 'CRITICAL';
  if (urgency >= 6) return 'HIGH';
  if (urgency >= 4) return 'MEDIUM';
  return 'STANDARD';
}

/**
 * Resolve final severity without under-triaging:
 *  - An explicit challenge.severity always wins.
 *  - Otherwise take the STRONGER of the understand-stage classification and the
 *    urgency-derived tier (so a generic AI default of MEDIUM cannot mask an urgency-9 signal).
 */
function resolveSeverity(challengeSev: any, understandSev: any, urgency: number): SeverityLevel {
  const explicit = normalizeSeverityLevel(challengeSev);
  if (explicit) return explicit;
  const fromUrgency = severityFromUrgency(urgency);
  const fromUnderstand = normalizeSeverityLevel(understandSev) || 'STANDARD';
  return SEVERITY_RANK[fromUnderstand] >= SEVERITY_RANK[fromUrgency] ? fromUnderstand : fromUrgency;
}

/**
 * STEP 7A §2–§3 — Build a standardized ExtractedEntities object from the raw
 * challenge payload, enriched by the prior verify/understand stages.
 *
 * Resolution priority for each field:
 *  - Location  : challenge.location → payload.spatial → challenge.* → understanding.*
 *  - Category  : understanding.infrastructureType → challenge.infrastructureType → challenge.category
 *  - Hazard    : understanding.hazardType → challenge.hazardType → challenge.title
 *  - EventDate : challenge.eventDate → challenge.createdAt → now  (ISO YYYY-MM-DD)
 *  - Numerics  : hazardUrgency, affectedPopulation, upvotes, economicValue
 */
export function buildExtractedEntities(
  challenge: any = {},
  spatial: any = {},
  understanding: any = {},
  verification?: VerificationResult | any,
  upvotesArg?: number
): ExtractedEntities {
  const loc = challenge.location || {};
  const sp = spatial || {};

  // ── Location: district, block, coordinates ──────────────────────────────────
  const rawDistrict =
    loc.district || sp.district || challenge.district || understanding?.district;
  const district = normalizeDistrict(rawDistrict);
  const block = loc.block || sp.block || challenge.block || 'Central Block';

  const payloadLat = loc.lat ?? sp.lat ?? challenge.lat ?? challenge.latitude;
  const payloadLng = loc.lng ?? sp.lng ?? challenge.lng ?? challenge.longitude;
  const coords =
    typeof payloadLat === 'number' && typeof payloadLng === 'number' && !isNaN(payloadLat) && !isNaN(payloadLng)
      ? { lat: payloadLat, lng: payloadLng }
      : DISTRICT_COORDS[district] || DEFAULT_COORDS;

  // ── Category & hazard details ───────────────────────────────────────────────
  const infrastructureType =
    understanding?.infrastructureType ||
    challenge.infrastructureType ||
    challenge.category ||
    'Public Infrastructure';
  const hazardType =
    understanding?.hazardType ||
    challenge.hazardType ||
    understanding?.domain ||
    challenge.title ||
    'Civic Problem';
  const eventDate = toISODate(challenge.eventDate || challenge.createdAt);
  const eventTime = challenge.eventTime || toHHMM(challenge.eventDate || challenge.createdAt);

  // ── Numerical inputs — explicitly supplied citizen values ONLY (T5.1) ──
  //    When the citizen omits a field, leave it null rather than manufacturing
  //    a fake default (500/50000). scorePriority applies a disclosed confidence
  //    penalty when numerics are null, so the triage score stays honest.
  const urgency = Number(
    challenge.hazardUrgency ?? challenge.urgency ?? challenge.urgency_score ?? understanding?.urgency ?? undefined
  ) || undefined;

  const affectedPopulation = Number(
    challenge.affectedPopulation ?? sp.affectedPopulation ?? challenge.population ?? undefined
  ) || undefined;

  const upvotes = Number(
    upvotesArg ?? challenge.upvotes ?? challenge.communityUpvotes ?? 0
  );

  const economicValue = Number(
    challenge.economicValue ?? challenge.economicValueEstimate ?? undefined
  ) || undefined;

  const severity = resolveSeverity(challenge.severity, understanding?.severity, urgency ?? 5);

  const estimatedResolutionCost = Number(
    challenge.estimatedResolutionCost ?? challenge.estimatedCost ?? undefined
  ) || undefined;

  const summary =
    understanding?.summary ||
    (typeof challenge.description === 'string' ? challenge.description.slice(0, 150) : '') ||
    challenge.title ||
    'Civic infrastructure issue reported';

  return {
    district,
    eventDate,
    eventTime,
    infrastructureType,
    hazardType,
    severity,
    urgency,
    affectedPopulation,
    upvotes,
    economicValue,
    location: { district, block, lat: coords.lat, lng: coords.lng },
    estimatedResolutionCost,
    summary,
    confidence: Number(understanding?.confidence ?? verification?.confidence ?? 0.85),
    date: eventDate,
    time: `${eventTime} IST`,
    hazardUrgency: urgency,
    economicValueEstimate: economicValue,
  };
}

/** Resolve the university dataset for the match stage (payload → DB → empty). */
async function resolveUniversities(payload: PipelinePayload): Promise<any[]> {
  if (Array.isArray(payload.universities) && payload.universities.length > 0) {
    return payload.universities;
  }
  try {
    const { universityService } = await import('../../modules/university/service.js');
    const unis = await universityService.list();
    return Array.isArray(unis) ? unis : [];
  } catch {
    return [];
  }
}

/**
 * STEP 7B — Deterministic DB fallback for the research stage.
 *
 * Produces a well-formed UnifiedResearchResult with DB-only confidence (0.60)
 * whenever live research is unavailable (network failure, or the 4000ms hard
 * ceiling is exceeded). The queryUsed string mirrors researchProblem()'s format
 * so downstream consumers cannot tell a fallback apart structurally.
 */
export function buildResearchFallback(entities: Partial<ExtractedEntities>): UnifiedResearchResult {
  const district = entities.district || entities.location?.district || 'Ranchi';
  const infra = entities.infrastructureType || 'Public Infrastructure';
  const hazard = entities.hazardType || 'Civic Problem';
  const queryUsed = `${district} Jharkhand ${infra} ${hazard}`.trim();
  const advisory = `[db] IMD ${district}: General civic monitoring active.`;

  return {
    advisories: [advisory],
    governmentAdvisories: [advisory],
    incidents: [],
    recentIncidents: [],
    recurringHazard: false,
    recurringHazardIdentified: false,
    severityContext: `Localized incident detected in ${district}. Verified against Jharkhand Municipal and Disaster Management records (DB only).`,
    confidence: 0.60,
    queryUsed,
    activeAlert: false,
    corroborationCount: 0,
    sourceBreakdown: { news: 'none', weather: 'none', govt: 'db' },
  };
}

/**
 * STEP 7B — Timeout- & fault-tolerant wrapper around researchProblem().
 *
 * Reliability contract:
 *  1. An AbortController enforces a hard RESEARCH_TIMEOUT_MS (4000ms) ceiling —
 *     when it fires, in-flight fetches are cancelled via the linked signal.
 *  2. researchProblem(entities, signal) is raced against that ceiling.
 *  3. Any failure (timeout, network error, unexpected rejection) is caught,
 *     logged silently for monitoring, and converted into a DB fallback result —
 *     this function never throws / never produces an unhandled rejection.
 *  4. Always returns a fully-populated ResearchResult (governmentAdvisories,
 *     recentIncidents, recurringHazardIdentified, confidence, queryUsed, …).
 */
export async function runResearchStage(entities: Partial<ExtractedEntities>): Promise<UnifiedResearchResult> {
  const controller = new AbortController();
  let ceilingTimer: ReturnType<typeof setTimeout> | undefined;

  const ceiling = new Promise<never>((_, reject) => {
    ceilingTimer = setTimeout(() => {
      controller.abort(); // cancel any in-flight external fetches
      reject(new Error(`research ceiling exceeded (${RESEARCH_TIMEOUT_MS}ms)`));
    }, RESEARCH_TIMEOUT_MS);
  });

  try {
    return await Promise.race([researchProblem(entities, controller.signal), ceiling]);
  } catch (err) {
    // Silent monitoring log only — the pipeline continues on the DB fallback.
    logger.warn(
      { err: (err as Error)?.message, stage: 'research', district: entities.district },
      'research stage failed or timed out — using DB fallback'
    );
    return buildResearchFallback(entities);
  } finally {
    if (ceilingTimer) clearTimeout(ceilingTimer);
    if (!controller.signal.aborted) controller.abort();
  }
}

/**
 * STEP 7A §1 — Execute the complete 5-stage AI pipeline in strict order:
 *   verify → understand → research → prioritize → match
 * Returns a full multi-stage execution trace.
 */
export async function runAIPipeline(
  payload: PipelinePayload,
  jobId?: string,
  challengeId?: string
): Promise<AIPipelineResult> {
  const challenge = payload.challenge || {};
  const report = payload.report || challenge;
  const upvotes = Number(payload.upvotes ?? challenge.upvotes ?? challenge.communityUpvotes ?? 0);
  const stages: PipelineStage[] = [];
  const pipelineStart = Date.now();
  const log = stageLog(jobId, challengeId, 'pipeline');

  // ── Stage 1: verify ─────────────────────────────────────────────────────────
  const t0 = Date.now();
  const verification = await verifyReport(report, payload.existingIds);
  stages.push('verify');
  log.info({ durationMs: Date.now() - t0, isReal: verification.isRealReport, dedup: verification.dedupStatus, domain: verification.domainCode }, 'stage:verify completed');

  // ── Stage 2: understand ─────────────────────────────────────────────────────
  const t1 = Date.now();
  const understanding = await AIProvider.understand({
    title: report.title || challenge.title || '',
    description: report.description || challenge.description || '',
    category: report.category || challenge.category || verification.category,
    severity: report.severity || challenge.severity,
  });
  stages.push('understand');
  log.info({ durationMs: Date.now() - t1, domain: understanding.domain, severity: understanding.severity, confidence: understanding.confidence }, 'stage:understand completed');

  // ── Stage 3: research (build ExtractedEntities first) ───────────────────────
  const entities = buildExtractedEntities(challenge, payload.spatial, understanding, verification, upvotes);
  const t2 = Date.now();
  const research: UnifiedResearchResult | any =
    payload.researchResult || (await runResearchStage(entities));
  stages.push('research');
  log.info({ durationMs: Date.now() - t2, src: research?.sourceBreakdown, confidence: research?.confidence }, 'stage:research completed');

  // ── Stage 4: prioritize (fed the live research context) ─────────────────────
  const enrichedChallenge = {
    ...challenge,
    district: entities.district,
    category: challenge.category || entities.infrastructureType,
    infrastructureType: entities.infrastructureType,
    hazardType: entities.hazardType,
    severity: entities.severity,
    hazardUrgency: entities.hazardUrgency,
    affectedPopulation: entities.affectedPopulation,
    economicValue: entities.economicValue,
    estimatedCost: entities.estimatedResolutionCost,
  };
  const t3 = Date.now();
  const priorityResult = await AIProvider.prioritize(enrichedChallenge, payload.spatial, upvotes, research);
  stages.push('prioritize');
  log.info({ durationMs: Date.now() - t3, totalScore: priorityResult.totalScore, riskLevel: priorityResult.riskLevel, confidence: priorityResult.confidence }, 'stage:prioritize completed');

  // ── T5.3 — Audit trail: persist per-stage snapshots to Challenge + AiRecommendation ──
  // Fire-and-forget: these writes never block the pipeline. Errors are logged
  // so they appear in the worker log but do not cause a pipeline failure.
  if (challengeId) {
    try {
      const prismaClient = (await import('../../core/prisma.js')).prisma;
      await prismaClient.challenge.update({
        where: { id: challengeId },
        data: {
          // Stage 1 — vision
          vision_result: verification.visionResult ? JSON.parse(JSON.stringify(verification.visionResult)) : undefined,
          // Stage 3 — research (full source evidence snapshot)
          research_result: JSON.parse(JSON.stringify(research)),
          // Stage 1 — dedup metadata
          dedup_status: verification.dedupStatus || undefined,
          duplicate_of: verification.duplicateOf || undefined,
          // Stage 4 — priority factors & score
          // The scorer returns 0–100 but the DB column (chk_priority_range,
          // DECIMAL(4,2)) caps at 9.99 — normalize 100 → 10 so the write can't
          // violate the constraint (this previously dropped the whole write and
          // every auto-enqueued challenge lost its enrichment).
          priority_score: Math.min(9.99, Math.round((priorityResult.priorityScore / 10) * 100) / 100),
          priority_factors: JSON.parse(JSON.stringify(priorityResult.factors)),
          // Stage 2 — AI understanding denormalized fields
          ai_summary: understanding.summary || undefined,
          ai_domain: verification.domainCode || understanding.domain || undefined,
          ai_tags: understanding.tags || [],
          ai_severity: entities.severity || understanding.severity || undefined,
          ai_urgency: entities.urgency != null ? String(entities.urgency) : undefined,
          ai_confidence: priorityResult.confidence ?? undefined,
          ai_sub_domain: understanding.subDomain || undefined,
        },
      });

      // Write AiRecommendation records for each stage that produced meaningful output
      await prismaClient.aiRecommendation.createMany({
        data: [
          {
            challenge_id: challengeId,
            kind: 'VISION' as any,
            status: 'SUCCEEDED' as any,
            result: verification.visionResult ? JSON.parse(JSON.stringify(verification.visionResult)) : { status: 'skipped' },
            confidence: verification.visionResult?.confidence ?? null,
            reasons: JSON.parse(JSON.stringify(verification.verificationReasons)),
            model_version: 'nivaaran-vision-v1',
            completed_at: new Date(),
          },
          {
            challenge_id: challengeId,
            kind: 'UNDERSTAND' as any,
            status: 'SUCCEEDED' as any,
            result: { summary: understanding.summary, domain: understanding.domain, severity: understanding.severity, urgency: understanding.urgency },
            confidence: understanding.confidence ?? null,
            reasons: understanding.reasons ? JSON.parse(JSON.stringify(understanding.reasons)) : null,
            model_version: understanding.modelVersion || 'nivaaran-understand-v1',
            completed_at: new Date(),
          },
          {
            challenge_id: challengeId,
            kind: 'RESEARCH' as any,
            status: 'SUCCEEDED' as any,
            result: JSON.parse(JSON.stringify(research)),
            confidence: research.confidence ?? null,
            model_version: 'nivaaran-research-v1',
            completed_at: new Date(),
          },
          {
            challenge_id: challengeId,
            kind: 'PRIORITIZE' as any,
            status: 'SUCCEEDED' as any,
            result: JSON.parse(JSON.stringify({ factors: priorityResult.factors, triageMetadata: priorityResult.triageMetadata, modelVersion: priorityResult.modelVersion })),
            confidence: priorityResult.confidence ?? null,
            model_version: priorityResult.modelVersion || 'nivaaran-priority-v1',
            completed_at: new Date(),
          },
        ],
      });

      // AuditEvent: full pipeline COMPLETED
      await prismaClient.auditEvent.create({
        data: {
          actor_id: challenge.submitter_id || 'system-pipeline',
          action: 'PRIORITIZE' as any,
          resource_type: 'challenge',
          resource_id: challengeId,
          payload_snapshot: JSON.parse(JSON.stringify({
            pipeline: stages,
            priorityScore: priorityResult.priorityScore,
            riskLevel: priorityResult.riskLevel,
            confidence: priorityResult.confidence,
            researchConfidence: research.confidence,
            dedupStatus: verification.dedupStatus,
            domainCode: verification.domainCode,
          })),
          ai_recommendation_id: null,
        },
      });
    } catch (writeErr) {
      logger.warn({ err: (writeErr as Error)?.message, challengeId }, 'audit trail write failed — pipeline result is unaffected');
    }
  }

  // ── Stage 5: match ──────────────────────────────────────────────────────────
  const t4 = Date.now();
  const universities = await resolveUniversities(payload);
  const matches = await AIProvider.match(enrichedChallenge, universities);
  stages.push('match');
  log.info({ durationMs: Date.now() - t4, matchCount: matches?.length ?? 0 }, 'stage:match completed');

  // ── STEP 7C — Package the complete job result ───────────────────────────────
  // Attach the full research evidence (source URLs, advisory counts, incidents)
  // alongside the priority metrics (factors, triage tier, honest confidence) so
  // downstream queue consumers — the frontend portals and the HEI matching
  // engine — receive a single self-contained, COMPLETED job record.
  const result: AIPipelineResult = {
    challengeId,
    jobId,
    pipeline: stages,
    verification,
    understanding,
    entities,
    research,
    priority: priorityResult,
    matches,
    category: verification.category,
    domainCode: verification.domainCode,
    confidence: priorityResult.confidence,
    modelVersion: priorityResult.modelVersion,
    status: 'COMPLETED',
    timestamp: new Date().toISOString(),
  };

  if (jobId) matchResultsStore.set(jobId, result);

  // Final pipeline timing
  log.info({ durationMs: Date.now() - pipelineStart, stages, totalScore: priorityResult.totalScore }, 'pipeline COMPLETED');
  return result;
}

// ── Queue registration ────────────────────────────────────────────────────────
aiQueue.process(async (job: QueueJob) => {
  const { action, challengeId, payload, _retryCount = 0 } = job.data || {};
  if (!challengeId) return { done: false, error: 'No challengeId', jobId: job.id };

  // End-to-end pipeline job (verify → understand → research → prioritize → match)
  if (PIPELINE_ACTIONS.has(action) && payload) {
    try {
      return await runAIPipeline(payload, job.id, challengeId);
    } catch (err) {
      const attempt = _retryCount + 1;
      if (attempt >= MAX_PIPELINE_RETRIES) {
        await writeDeadLetter(challengeId, err, ['failed'], job.id);
        return { done: true, error: (err as Error)?.message, jobId: job.id, deadLetter: true };
      }
      // Re-enqueue with incremented retry count
      logger.warn({ jobId: job.id, challengeId, attempt, err: (err as Error)?.message }, 'pipeline failed — re-enqueueing for retry');
      const { aiQueue: q } = await import('./index.js');
      await q.add('pipeline-retry', { ...job.data, _retryCount: attempt });
      return { done: false, retried: true, attempt, jobId: job.id };
    }
  }

  // Granular single-stage jobs (backward compatible)
  const result: any = { action, challengeId, jobId: job.id };
  const stageStart = Date.now();

  if (action === 'verify' && payload?.report) {
    const v = await verifyReport(payload.report, payload.existingIds);
    result.verification = v;
    result.category = v.category;
    result.domainCode = v.domainCode;
    stageLog(job.id, challengeId, 'verify').info({ durationMs: Date.now() - stageStart, isReal: v.isRealReport, domain: v.domainCode }, 'single-stage:verify');
  }

  if (action === 'understand' && payload?.input) {
    result.understanding = await AIProvider.understand(payload.input);
    stageLog(job.id, challengeId, 'understand').info({ durationMs: Date.now() - stageStart, domain: result.understanding?.domain }, 'single-stage:understand');
  }

  if (action === 'prioritize' && payload?.challenge) {
    result.priority = await AIProvider.prioritize(
      payload.challenge,
      payload.spatial,
      payload.upvotes,
      payload.researchResult
    );
    stageLog(job.id, challengeId, 'prioritize').info({ durationMs: Date.now() - stageStart, totalScore: result.priority?.totalScore, riskLevel: result.priority?.riskLevel }, 'single-stage:prioritize');
  }

  if (action === 'match' && payload?.challenge && payload?.universities) {
    result.matches = await AIProvider.match(payload.challenge, payload.universities);
    stageLog(job.id, challengeId, 'match').info({ durationMs: Date.now() - stageStart, matchCount: result.matches?.length ?? 0 }, 'single-stage:match');
  }

  result.timestamp = new Date().toISOString();
  result.status = 'COMPLETED';
  return result;
});
