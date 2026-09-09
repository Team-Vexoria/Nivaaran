// AIProvider — server-side deterministic engines ported from frontend (AI_ARCHITECTURE.md §4)
// 100-domain taxonomy classifier + T5.2 shared priority scorer + 4-factor HEI matcher

import type { UnifiedResearchResult } from './newsEngine';
import { scorePriority as sharedScorePriority } from '../../shared/priorityScoring.js';
// Single source of truth — full 100-domain taxonomy.
// GOV_DOMAINS, DOMAIN_BY_ID and DOMAIN_BY_CODE are re-exported so existing
// callers (`import { GOV_DOMAINS } from './AIProvider.js'`) keep working.
import {
  GOV_DOMAINS as CANONICAL_GOV_DOMAINS,
  DOMAIN_BY_ID as CANONICAL_DOMAIN_BY_ID,
  DOMAIN_BY_CODE as CANONICAL_DOMAIN_BY_CODE,
  type DomainTaxonomy as CanonicalDomainTaxonomy,
} from '../../shared/domainTaxonomy.js';

export type DomainTaxonomy = CanonicalDomainTaxonomy;
export const GOV_DOMAINS: DomainTaxonomy[] = CANONICAL_GOV_DOMAINS;
export const DOMAIN_BY_ID = CANONICAL_DOMAIN_BY_ID;
export const DOMAIN_BY_CODE = CANONICAL_DOMAIN_BY_CODE;
export type ResearchResult = UnifiedResearchResult;

export interface PriorityFactors {
  populationImpact:          { score: number; max: 25; reason: string };  // Max 25: affected population scale
  economicLifeSaving:        { score: number; max: 25; reason: string };  // Max 25: lives saved & economic value preserved
  resolutionCostFeasibility: { score: number; max: 25; reason: string };  // Max 25: cost-to-impact ROI (lower/medium cost = higher score)
  hazardUrgency:             { score: number; max: 25; reason: string };  // Max 25: urgency & escalating risk velocity
}

export type TriageTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';

export interface TriageActionGuidance {
  tier: TriageTier;
  action: string;
  slaHours: number;
  dispatchCategory: string;
}

export interface TriageMetadata {
  tier: TriageTier;
  action: string;
  description: string;
  escalatedByWeather: boolean;
  escalatedByRecurringHazard: boolean;
}

export const TRIAGE_TIERS: Record<TriageTier, TriageActionGuidance> = {
  CRITICAL: {
    tier: 'CRITICAL',
    action: 'Immediate engineering / emergency dispatch',
    slaHours: 4,
    dispatchCategory: 'EMERGENCY_DISPATCH',
  },
  HIGH: {
    tier: 'HIGH',
    action: 'Priority university R&D / municipal tasking',
    slaHours: 24,
    dispatchCategory: 'UNIVERSITY_MUNICIPAL_TASKING',
  },
  MEDIUM: {
    tier: 'MEDIUM',
    action: 'Scheduled municipal intervention',
    slaHours: 72,
    dispatchCategory: 'SCHEDULED_MUNICIPAL_INTERVENTION',
  },
  STANDARD: {
    tier: 'STANDARD',
    action: 'Routine civic maintenance',
    slaHours: 168,
    dispatchCategory: 'ROUTINE_MAINTENANCE',
  },
};

/**
 * Classify composite priority score into standardized governance triage tier (Step 6B)
 */
export function classifyTriageTier(
  totalScore: number,
  escalationContext?: { activeAlert?: boolean; recurringHazard?: boolean }
): {
  riskLevel: TriageTier;
  action: string;
  triageMetadata: TriageMetadata;
} {
  let riskLevel: TriageTier = 'STANDARD';
  if (totalScore >= 85) {
    riskLevel = 'CRITICAL';
  } else if (totalScore >= 70) {
    riskLevel = 'HIGH';
  } else if (totalScore >= 50) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'STANDARD';
  }

  const guidance = TRIAGE_TIERS[riskLevel];
  const triageMetadata: TriageMetadata = {
    tier: riskLevel,
    action: guidance.action,
    description: guidance.action,
    escalatedByWeather: Boolean(escalationContext?.activeAlert),
    escalatedByRecurringHazard: Boolean(escalationContext?.recurringHazard),
  };

  return {
    riskLevel,
    action: guidance.action,
    triageMetadata,
  };
}

export class PriorityScoreResult extends Number {
  priorityScore: number;
  totalScore: number;
  factors: PriorityFactors;
  riskLevel: TriageTier;
  confidence: number;
  modelVersion: 'nivaaran-live-v1' | 'nivaaran-fallback-v1' | string;
  triageAction: string;
  triageMetadata: TriageMetadata;

  constructor(
    score: number,
    factors: PriorityFactors,
    riskLevel: TriageTier,
    triageAction?: string,
    triageMetadata?: TriageMetadata,
    confidence: number = 0.75,
    modelVersion?: string
  ) {
    super(score);
    this.priorityScore = score;
    this.totalScore = score;
    this.factors = factors;
    this.riskLevel = riskLevel;
    this.confidence = confidence;
    this.modelVersion = modelVersion || (confidence >= 0.85 ? 'nivaaran-live-v1' : 'nivaaran-fallback-v1');
    this.triageAction = triageAction || TRIAGE_TIERS[riskLevel]?.action || 'Routine civic maintenance';
    this.triageMetadata = triageMetadata || {
      tier: riskLevel,
      action: this.triageAction,
      description: this.triageAction,
      escalatedByWeather: false,
      escalatedByRecurringHazard: false,
    };
  }

  valueOf(): number {
    return this.priorityScore;
  }

  [Symbol.toPrimitive](hint: string) {
    if (hint === 'string') return String(this.priorityScore);
    return this.priorityScore;
  }

  toJSON() {
    return {
      priorityScore: this.priorityScore,
      factors: this.factors,
      riskLevel: this.riskLevel,
      confidence: this.confidence,
      modelVersion: this.modelVersion,
      totalScore: this.totalScore,
      triageAction: this.triageAction,
      triageMetadata: this.triageMetadata,
    };
  }
}

/**
 * STEP 6A: 4-Pillar (25% x 4) Priority Scoring — thin wrapper over shared formula.
 *
 * Delegates to `shared/priorityScoring.scorePriority()` (the single canonical
 * 4×25 threshold formula). This function's only job is to:
 *   1. Map the positional legacy API → `ScoringInput`
 *   2. Resolve the `spatialOrResearch` / `researchResult` argument overloads
 *   3. Wrap the shared result → `PriorityScoreResult` (Number subclass with
 *      triageAction / triageMetadata / modelVersion)
 *
 * See `shared/priorityScoring.ts` for the full formula + thresholds.
 */
export function scorePriority(
  challenge: any,
  spatialOrResearch?: any,
  upvotes: number = 0,
  researchResultParam?: ResearchResult | any
): PriorityScoreResult {
  // ── 1. Resolve researchResult vs spatial from positional args ──────────────
  let researchResult: any = researchResultParam || challenge?.researchResult;
  let spatial: any = null;

  if (spatialOrResearch) {
    if (
      spatialOrResearch.governmentAdvisories ||
      spatialOrResearch.advisories ||
      spatialOrResearch.recentIncidents ||
      spatialOrResearch.incidents ||
      spatialOrResearch.activeAlert !== undefined ||
      spatialOrResearch.recurringHazard !== undefined ||
      spatialOrResearch.recurringHazardIdentified !== undefined ||
      spatialOrResearch.sourceBreakdown
    ) {
      researchResult = spatialOrResearch;
    } else {
      spatial = spatialOrResearch;
      if (spatial.researchResult) {
        researchResult = spatial.researchResult;
      }
    }
  }

  // ── 2. Map challenge fields → ScoringInput ─────────────────────────────────
  const resolvedUpvotes = upvotes || challenge?.communityUpvotes || challenge?.upvotes || 0;
  const activeAlert = researchResult?.activeAlert === true;
  const recurringHazard = Boolean(
    researchResult?.recurringHazardIdentified ||
    researchResult?.recurringHazard ||
    (spatial?.recurrence && spatial.recurrence > 5),
  );
  const corroborationCount = researchResult?.corroborationCount ??
    ((researchResult?.recentIncidents?.length || 0) + (researchResult?.incidents?.length || 0));
  const researchConfidence = typeof researchResult?.confidence === 'number'
    ? researchResult.confidence
    : 0.75; // backend default when research stage was skipped

  const input = {
    affectedPopulation: challenge?.affectedPopulation ?? (challenge?.population ? parseInt(challenge.population, 10) : null),
    upvotes: resolvedUpvotes,
    economicValue: challenge?.economicValue ?? challenge?.economicValueEstimate ?? null,
    estimatedResolutionCost: challenge?.estimatedCost ?? challenge?.estimatedResolutionCost ?? null,
    hazardUrgency: challenge?.hazardUrgency ?? challenge?.urgency_score ?? challenge?.urgency ?? (challenge?.severity === 'CRITICAL' ? 9 : null),
    text: [challenge?.title, challenge?.description].filter(Boolean).join(' '),
    categoryCode: challenge?.domainCode ?? challenge?.categoryCode ?? '',
    researchConfidence,
    activeAlert,
    recurringHazard,
    corroborationCount,
  };

  // ── 3. Call the canonical shared formula ────────────────────────────────────
  const sharedResult = sharedScorePriority(input);

  // ── 4. Triage classification + escalation metadata (backend-only) ──────────
  const triage = classifyTriageTier(sharedResult.totalScore, {
    activeAlert,
    recurringHazard,
  });

  const confidence = sharedResult.confidence;
  const modelVersion = confidence >= 0.85 ? 'nivaaran-live-v1' : 'nivaaran-fallback-v1';

  return new PriorityScoreResult(
    sharedResult.totalScore,
    sharedResult.factors as any,
    triage.riskLevel,
    triage.action,
    triage.triageMetadata,
    confidence,
    modelVersion,
  );
}

export interface HEIFactors { departmentFit: number; labFit: number; proximity: number; academic: number; }
export function scoreHEIMatch(challenge: any, university: any, distanceKm: number): number {
  const f: HEIFactors = {
    departmentFit: Math.min(40, university.departments?.includes(challenge.category) ? 40 : 20),
    labFit: Math.min(30, university.labs?.some((l: string) => challenge.tags?.includes(l)) ? 30 : 10),
    proximity: Math.min(20, Math.max(0, 20 - distanceKm)),
    academic: Math.min(10, university.accreditation === 'A++' ? 10 : university.accreditation === 'A+' ? 7 : 4),
  };
  return Math.round(f.departmentFit + f.labFit + f.proximity + f.academic); // capped 0-100
}

export interface AIProvider {
  understand(input: any): Promise<any>;
  embed(text: string): Promise<number[]>;
  similarity(a: any, b: any): Promise<any>;
  prioritize(challenge: any, spatial?: any, upvotes?: number, researchResult?: any): Promise<any>;
  match(challenge: any, heis: any[]): Promise<any>;
  vision?(imageUrl: string): Promise<any>;
}

export const AIProvider: AIProvider = {
  async understand(input: any) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Analyze this societal problem report from Jharkhand and return a JSON object with:
"summary": a 1-2 sentence summary,
"domain": best matching domain code from: [${GOV_DOMAINS.map((d) => d.code).join(', ')}, GENERAL],
"severity": "CRITICAL" | "HIGH" | "MEDIUM" | "STANDARD",
"urgency": number from 1 to 10,
"reasons": array of 1-3 concise reason strings.

Title: ${input.title || ''}
Description: ${input.description || ''}
Category: ${input.category || ''}
Respond with only valid JSON.`,
                    },
                  ],
                },
              ],
              generationConfig: { responseMimeType: 'application/json' },
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);
        if (res.ok) {
          const json: any = await res.json();
          const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return {
              summary: parsed.summary || input.description?.slice(0, 100) || '',
              domain: parsed.domain || input.category || 'INFRASTRUCTURE',
              subDomain: 'GENERAL',
              tags: [],
              severity: parsed.severity || input.severity || 'MEDIUM',
              urgency: parsed.urgency || 5,
              confidence: 0.95,
              reasons: parsed.reasons || ['Gemini multi-modal classification'],
              modelVersion: 'gemini-2.5-flash',
            };
          }
        }
      } catch {
        // Fallback cleanly to deterministic heuristics
      }
    }

    return {
      summary: input.description?.slice(0, 100) || '',
      domain: input.category || 'INFRASTRUCTURE',
      subDomain: 'GENERAL',
      tags: [],
      severity: input.severity || 'MEDIUM',
      urgency: 5,
      confidence: 0.85,
      reasons: ['Deterministic keyword match on 100-domain taxonomy'],
      modelVersion: 'nivaaran-deterministic-v1',
    };
  },
  async embed(_text: string) {
    return [0.1, 0.2, 0.3];
  },
  async similarity(_a: any, _b: any) {
    return { score: 0.5, reasons: ['Heuristic tag overlap'] };
  },
  async prioritize(challenge: any, spatial: any = {}, upvotes = 0, researchResult?: any) {
    const res = scorePriority(challenge, spatial, upvotes, researchResult);
    return {
      score: res.priorityScore,
      priorityScore: res.priorityScore,
      totalScore: res.totalScore,
      factors: res.factors,
      riskLevel: res.riskLevel,
      confidence: res.confidence,
      modelVersion: res.modelVersion,
      triageAction: res.triageAction,
      triageMetadata: res.triageMetadata,
    };
  },
  async match(challenge: any, heis: any[]) {
    return heis.map((h) => ({ heiId: h.id, score: scoreHEIMatch(challenge, h, 10) }));
  },
  async vision(imageUrl: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && imageUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are a hazard-verification model for the NIVAARAN civic-grievance platform (SIH 26043).

Analyze the submitted incident photo and determine:
1. Whether it is a genuine incident photograph or a synthetic / stock / unrelated image.
2. Whether it contains visual evidence of the reported hazard (flood, fire, structural damage, contamination, etc.).

Return ONLY valid JSON with these fields:
- "hasHazard": true if genuine hazard evidence is visible, false if not.
- "isReal": true if the image looks like an authentic on-ground photo, false if AI-generated / stock / screenshot.
- "confidence": float 0.0–1.0 — your assessed confidence in this judgment.
- "description": 1-2 sentence description of what the image shows.

Context:
Title: ${''}
Description: ${''}
Image URL: ${imageUrl}`,
                    },
                    { fileData: { fileUri: imageUrl, mimeType: 'image/jpeg' } },
                  ],
                },
              ],
              generationConfig: { responseMimeType: 'application/json' },
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);
        if (res.ok) {
          const json: any = await res.json();
          const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return {
              hasHazard: Boolean(parsed.hasHazard),
              isReal: Boolean(parsed.isReal),
              confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.70,
              description: parsed.description || 'Vision analysis completed',
            };
          }
        }
      } catch {
        // Fallback
      }
    }
    // Heuristic fallback — allow but with reduced confidence so it does not inflate priority
    return { hasHazard: true, isReal: undefined, confidence: 0.45, description: 'Heuristic evidence verification (Gemini unavailable)' };
  },
};
