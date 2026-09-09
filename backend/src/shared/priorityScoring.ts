/**
 * NIVAARAN — Shared Priority Scoring (4-Pillar × 25 = 100)
 *
 * Canonical 4×25 scoring formula used by BOTH:
 *  • backend  AIProvider.scorePriority() — receives real citizen numerics + research context
 *  • frontend aiTriageEngine.calculatePriorityLayer2() — receives text/category heuristics
 *
 * Null-safety contract (T5.1):
 *  When a citizen omits affectedPopulation, economicValue, or estimatedResolutionCost,
 *  the scoring formula applies a disclosed confidence penalty instead of manufacturing
 *  fake defaults (500 / 50000 / 300000).
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';

export interface PriorityFactors {
  populationImpact:          { score: number; max: 25; reason: string };
  economicLifeSaving:        { score: number; max: 25; reason: string };
  resolutionCostFeasibility: { score: number; max: 25; reason: string };
  hazardUrgency:             { score: number; max: 25; reason: string };
}

export interface ScoringInput {
  /** Citizen-reported affected population count (null = not provided). */
  affectedPopulation?: number | null;
  /** Community upvotes / endorsements (default 0). */
  upvotes?: number;
  /** Estimated economic value of the asset/area at risk (₹, null = not provided). */
  economicValue?: number | null;
  /** Estimated cost to resolve (₹, null = not provided). */
  estimatedResolutionCost?: number | null;
  /** Citizen-reported or AI-derived urgency score (0–10 scale, null = not provided). */
  hazardUrgency?: number | null;
  /** Text used for keyword/category heuristic fallbacks (title + description). */
  text?: string;
  /** AI-extracted or citizen-provided category code (e.g. "water_resources"). */
  categoryCode?: string;
  /** Research context from the research stage (optional). */
  researchConfidence?: number;
  activeAlert?: boolean;
  recurringHazard?: boolean;
  corroborationCount?: number;
}

export interface ScoringResult {
  factors: PriorityFactors;
  totalScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  bonusesApplied: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 85) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'STANDARD';
}

// ── Core Scoring ───────────────────────────────────────────────────────────

/**
 * Shared 4×25 priority scoring formula.
 *
 * Pillar 1 — Population Impact Radius         (max 25)
 * Pillar 2 — Economic & Life-Saving Impact     (max 25)
 * Pillar 3 — Resolution Cost & Feasibility ROI (max 25)
 * Pillar 4 — Hazard Urgency & Cascading Risk   (max 25)
 *
 * Research bonuses: +3 for activeAlert, +2 for recurringHazard, +1 per
 * corroboration (capped at +4).
 */
export function scorePriority(input: ScoringInput): ScoringResult {
  const {
    affectedPopulation = null,
    upvotes = 0,
    economicValue = null,
    estimatedResolutionCost = null,
    hazardUrgency = null,
    text = '',
    categoryCode = '',
    researchConfidence,
    activeAlert,
    recurringHazard,
    corroborationCount = 0,
  } = input;

  const lowerText = text.toLowerCase();
  let missingNumerics = 0;

  // ── Pillar 1: Population Impact Radius (max 25) ──────────────────────────
  let popScore = 16;
  let popReason = 'Default civic infrastructure impact assessment';

  if (affectedPopulation != null) {
    // Use real citizen-provided number
    if (affectedPopulation >= 10000) { popScore = 25; popReason = `CRITICAL MASS: ${affectedPopulation.toLocaleString()} people directly affected`; }
    else if (affectedPopulation >= 5000) { popScore = 22; popReason = `HIGH IMPACT: ${affectedPopulation.toLocaleString()} people in impact zone`; }
    else if (affectedPopulation >= 1000) { popScore = 19; popReason = `MODERATE IMPACT: ${affectedPopulation.toLocaleString()} people affected`; }
    else if (affectedPopulation >= 100) { popScore = 17; popReason = `LOCALIZED IMPACT: ${affectedPopulation.toLocaleString()} people affected`; }
    else { popScore = 14; popReason = `LIMITED IMPACT: ${affectedPopulation.toLocaleString()} people affected`; }
  } else {
    // Category/text heuristics as fallback
    if (categoryCode === 'forestry_wildlife' || lowerText.includes('elephant') || lowerText.includes('wildlife')) {
      popScore = 25; popReason = 'CRITICAL PUBLIC SAFETY: Wild animal encounter in populated area';
    } else if (categoryCode === 'water_resources' || lowerText.includes('drinking water')) {
      popScore = 24; popReason = 'HIGH PUBLIC HEALTH THREAT: Water supply contamination';
    } else if (categoryCode === 'disaster_mgmt' || lowerText.includes('flood')) {
      popScore = 25; popReason = 'CRITICAL DISASTER HAZARD: Active flooding in community';
    } else if (lowerText.includes('school') || lowerText.includes('hospital')) {
      popScore = 23; popReason = 'VULNERABLE INSTITUTION: School/hospital occupants impacted';
    } else if (categoryCode === 'environment_climate' || lowerText.includes('pollution')) {
      popScore = 24; popReason = 'HIGH POPULATION IMPACT: District-wide pollution zone';
    } else {
      missingNumerics++;
    }
  }

  // Upvote reinforcement (+1–2 within max 25)
  if (upvotes > 1) {
    popScore = Math.min(25, popScore + Math.min(2, Math.floor(upvotes * 0.5)));
  }

  // ── Pillar 2: Economic & Life-Saving Impact (max 25) ─────────────────────
  let econScore = 16;
  let econReason = 'Economic asset preservation and public welfare';

  if (economicValue != null) {
    if (economicValue >= 5000000) { econScore = 25; econReason = `CRITICAL ASSET: ₹${(economicValue / 100000).toFixed(1)}L economic value at risk`; }
    else if (economicValue >= 1000000) { econScore = 22; econReason = `HIGH-VALUE ASSET: ₹${(economicValue / 100000).toFixed(1)}L economic value at risk`; }
    else if (economicValue >= 200000) { econScore = 19; econReason = `MODERATE ASSET: ₹${(economicValue / 100000).toFixed(1)}L economic value at risk`; }
    else { econScore = 15; econReason = `LOCALIZED ASSET: ₹${(economicValue / 1000).toFixed(1)}K economic value at risk`; }
  } else {
    // Text/category fallback
    if (lowerText.includes('hospital') || lowerText.includes('medical') || lowerText.includes('life')) {
      econScore = 25; econReason = 'DIRECT LIFE SAFETY: Emergency medical/healthcare continuity';
    } else if (categoryCode === 'energy_electricity') {
      econScore = 25; econReason = 'POWER GRID SAFETY: High-voltage transmission hazard';
    } else if (categoryCode === 'urban_infrastructure' || categoryCode === 'roads_bridges_civic') {
      econScore = 24; econReason = 'CRITICAL TRANSPORTATION: Arterial road/bridge lifeline';
    } else if (categoryCode === 'environment_climate') {
      econScore = 22; econReason = 'INDUSTRIAL UTILITY: Manufacturing plant emission zone';
    } else if (categoryCode === 'forestry_wildlife') {
      econScore = 23; econReason = 'AGRICULTURAL LIVELIHOOD: Crop raiding / livestock loss';
    } else {
      missingNumerics++;
    }
  }

  // ── Pillar 3: Resolution Cost & Feasibility ROI (max 25) ─────────────────
  let feasScore = 19;
  let feasReason = 'Standard engineering / municipal intervention scope';

  if (estimatedResolutionCost != null) {
    // Lower cost → higher feasibility score
    if (estimatedResolutionCost <= 100000) { feasScore = 24; feasReason = `RAPID LOW-COST: ₹${(estimatedResolutionCost / 1000).toFixed(0)}K — HEI prototype viable`; }
    else if (estimatedResolutionCost <= 500000) { feasScore = 21; feasReason = `MODERATE COST: ₹${(estimatedResolutionCost / 100000).toFixed(1)}L — turnkey municipal scope`; }
    else if (estimatedResolutionCost <= 2000000) { feasScore = 17; feasReason = `HIGH CAPITAL: ₹${(estimatedResolutionCost / 100000).toFixed(1)}L — multi-phase project`; }
    else { feasScore = 12; feasReason = `VERY HIGH CAPITAL: ₹${(estimatedResolutionCost / 100000).toFixed(0)}L — requires state/federal allocation`; }
  } else {
    // Text heuristics
    if (lowerText.includes('drainage') || lowerText.includes('pothole') || lowerText.includes('chlorination') || lowerText.includes('sensor')) {
      feasScore = 23; feasReason = 'Rapid low-cost deployment: municipal prototype viable';
    } else if (lowerText.includes('solar') || lowerText.includes('filtration') || lowerText.includes('signage')) {
      feasScore = 21; feasReason = 'Moderate capital with rapid turnkey ROI';
    } else if (lowerText.includes('megaproject') || /\bdam\b/.test(lowerText) || lowerText.includes('bridge collapse')) {
      feasScore = 14; feasReason = 'High capital intensity: multi-crore structural works';
    } else {
      missingNumerics++;
    }
  }

  // ── Pillar 4: Hazard Urgency & Cascading Risk (max 25) ───────────────────
  let urgScore = 16;
  let urgReason = 'Moderate hazard progression velocity';

  if (hazardUrgency != null) {
    if (hazardUrgency >= 9) { urgScore = 25; urgReason = `EXTREME URGENCY (${hazardUrgency}/10): Imminent life/safety threat`; }
    else if (hazardUrgency >= 7) { urgScore = 22; urgReason = `HIGH URGENCY (${hazardUrgency}/10): Rapid deterioration risk`; }
    else if (hazardUrgency >= 5) { urgScore = 18; urgReason = `MODERATE URGENCY (${hazardUrgency}/10): Escalating hazard`; }
    else { urgScore = 13; urgReason = `LOW URGENCY (${hazardUrgency}/10): Stable condition`; }
  } else {
    // Category/text fallback
    if (categoryCode === 'forestry_wildlife' || categoryCode === 'disaster_mgmt' || categoryCode === 'energy_electricity') {
      urgScore = 25; urgReason = 'IMMEDIATE LIFE HAZARD: Active safety threat';
    } else if (categoryCode === 'water_resources' || categoryCode === 'sanitation_hygiene') {
      urgScore = 24; urgReason = 'IMMEDIATE SANITATION HAZARD: Pathogenic risk';
    } else if (categoryCode === 'environment_climate') {
      urgScore = 23; urgReason = 'ELEVATED HEALTH HAZARD: Toxic particulate accumulation';
    } else {
      missingNumerics++;
    }
  }

  // ── Base total ─────────────────────────────────────────────────────────────
  const baseTotal = Math.min(100, popScore + econScore + feasScore + urgScore);

  // ── Research bonuses (backend only — frontend passes these as 0/undefined) ─
  const bonusesApplied: string[] = [];
  let researchBonus = 0;

  if (activeAlert) { researchBonus += 3; bonusesApplied.push('activeAlert +3'); }
  if (recurringHazard) { researchBonus += 2; bonusesApplied.push('recurringHazard +2'); }
  if (corroborationCount > 0) {
    const corrBonus = Math.min(4, corroborationCount);
    researchBonus += corrBonus;
    bonusesApplied.push(`corroboration×${corroborationCount} +${corrBonus}`);
  }

  const totalScore = Math.min(100, baseTotal + researchBonus);

  // ── Confidence: research confidence − T5.1 missing-numeric penalty ────────
  // researchConfidence is the live/DB research confidence (0.60–0.92).
  // When omitted (frontend-only, no research), base at 1.0 so the shared
  // formula behaves identically to the pre-T5.2 frontend-only formula.
  // The backend wrapper supplies the real research confidence (or 0.75 when
  // research is absent) before calling this function.
  const confidence = Math.max(
    0.30,
    (typeof researchConfidence === 'number' ? researchConfidence : 1.0) - missingNumerics * 0.08,
  );

  return {
    factors: {
      populationImpact:          { score: popScore, max: 25, reason: popReason },
      economicLifeSaving:        { score: econScore, max: 25, reason: econReason },
      resolutionCostFeasibility: { score: feasScore, max: 25, reason: feasReason },
      hazardUrgency:             { score: urgScore, max: 25, reason: urgReason },
    },
    totalScore,
    riskLevel: riskLevelFromScore(totalScore),
    confidence,
    bonusesApplied,
  };
}
