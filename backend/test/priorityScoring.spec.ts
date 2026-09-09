import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Pure function — the shared 4×25 formula used by frontend aiTriageEngine and backend AIProvider
import { scorePriority } from '../src/shared/priorityScoring';

/**
 * Shared Priority Scoring — T5.2 unit tests (SIH 26043)
 *
 * Verified against the actual implementation in backend/src/shared/priorityScoring.ts.
 * Arithmetic cross-checked with the frontend aiTriageEngine.ts formula (lines 149–250).
 *
 * NOTE: The 4-pillar floor is 14+15+12+13 = 54 (all low numerics) so the
 * 'STANDARD' risk level (totalScore < 50) is technically unreachable for the
 * current formula. Both frontend and backend share this property. This is
 * documented here and in priorityScoring.ts comments.
 */

// ── Risk classification ──────────────────────────────────────────────────────
describe('risk level classification', () => {
  it('>= 85 → CRITICAL with high numerics', () => {
    const r = scorePriority({ affectedPopulation: 25000, economicValue: 9000000, estimatedResolutionCost: 50000, hazardUrgency: 10 });
    assert.equal(r.totalScore, 99);
    assert.equal(r.riskLevel, 'CRITICAL');
  });

  it('>= 70 and < 85 → HIGH', () => {
    const r = scorePriority({ affectedPopulation: 6000, economicValue: 300000, estimatedResolutionCost: 300000, hazardUrgency: 8 });
    assert.equal(r.totalScore, 84);
    assert.equal(r.riskLevel, 'HIGH');
  });

  it('>= 50 and < 70 → MEDIUM', () => {
    const r = scorePriority({ affectedPopulation: 500, economicValue: 100000, estimatedResolutionCost: 1500000, hazardUrgency: 6 });
    assert.equal(r.totalScore, 67);
    assert.equal(r.riskLevel, 'MEDIUM');
  });

  it('totalScore < 50 is currently unreachable (floor is 54)', () => {
    // Lowest possible total with all low numerics: 14+15+12+13 = 54 (MEDIUM).
    // All-null defaults: 16+16+19+16 = 67 (MEDIUM).
    // If this ever fails, STANDARD may have become reachable — update UI.
    const minimal = scorePriority({ affectedPopulation: 1, economicValue: 1, estimatedResolutionCost: 99999999, hazardUrgency: 1 });
    assert.ok(minimal.totalScore >= 50, `expected floor >= 50, got ${minimal.totalScore}`);
    assert.equal(minimal.riskLevel, 'MEDIUM');
  });
});

// ── Pillar 1: population thresholds ──────────────────────────────────────────
describe('Pillar 1 — affectedPopulation thresholds', () => {
  it('>= 10000 → 25 (critical mass)', () => assert.equal(scorePriority({ affectedPopulation: 12000 }).factors.populationImpact.score, 25));
  it('>= 5000 → 22',  () => assert.equal(scorePriority({ affectedPopulation: 6000 }).factors.populationImpact.score, 22));
  it('>= 1000 → 19',  () => assert.equal(scorePriority({ affectedPopulation: 1200 }).factors.populationImpact.score, 19));
  it('>= 100 → 17',   () => assert.equal(scorePriority({ affectedPopulation: 300 }).factors.populationImpact.score, 17));
  it('< 100 → 14',    () => assert.equal(scorePriority({ affectedPopulation: 30 }).factors.populationImpact.score, 14));
});

// ── Pillar 2: economic value thresholds ──────────────────────────────────────
describe('Pillar 2 — economicValue thresholds', () => {
  it('>= 50L → 25',   () => assert.equal(scorePriority({ economicValue: 8000000 }).factors.economicLifeSaving.score, 25));
  it('>= 10L → 22',   () => assert.equal(scorePriority({ economicValue: 2500000 }).factors.economicLifeSaving.score, 22));
  it('>= 2L → 19',    () => assert.equal(scorePriority({ economicValue: 300000 }).factors.economicLifeSaving.score, 19));
  it('< 2L → 15',     () => assert.equal(scorePriority({ economicValue: 50000 }).factors.economicLifeSaving.score, 15));
});

// ── Pillar 3: resolution cost (inverse — lower cost = higher score) ──────────
describe('Pillar 3 — estimatedResolutionCost thresholds', () => {
  it('<= 1L → 24',   () => assert.equal(scorePriority({ estimatedResolutionCost: 80000 }).factors.resolutionCostFeasibility.score, 24));
  it('<= 5L → 21',   () => assert.equal(scorePriority({ estimatedResolutionCost: 300000 }).factors.resolutionCostFeasibility.score, 21));
  it('<= 20L → 17',  () => assert.equal(scorePriority({ estimatedResolutionCost: 1500000 }).factors.resolutionCostFeasibility.score, 17));
  it('> 20L → 12',   () => assert.equal(scorePriority({ estimatedResolutionCost: 5000000 }).factors.resolutionCostFeasibility.score, 12));
});

// ── Pillar 4: hazard urgency thresholds ──────────────────────────────────────
describe('Pillar 4 — hazardUrgency thresholds', () => {
  it('>= 9 → 25',  () => assert.equal(scorePriority({ hazardUrgency: 10 }).factors.hazardUrgency.score, 25));
  it('>= 7 → 22',  () => assert.equal(scorePriority({ hazardUrgency: 8 }).factors.hazardUrgency.score, 22));
  it('>= 5 → 18',  () => assert.equal(scorePriority({ hazardUrgency: 6 }).factors.hazardUrgency.score, 18));
  it('< 5 → 13',   () => assert.equal(scorePriority({ hazardUrgency: 2 }).factors.hazardUrgency.score, 13));
});

// ── Null numerics + heuristic fallbacks (T5.1 honest numerics) ────────────────
describe('null numerics — text/category heuristic fallback', () => {
  it('flood text elevates popScore to 25 via disaster_mgmt heuristic', () => {
    const r = scorePriority({ text: 'active flooding near the river bank in ranchi' });
    assert.equal(r.factors.populationImpact.score, 25);
  });

  it('school/hospital text boosts popScore to 23', () => {
    assert.equal(scorePriority({ text: 'water leak inside the school building' }).factors.populationImpact.score, 23);
  });

  it('drainage/pothole text boosts feasibility to 23', () => {
    assert.equal(scorePriority({ text: 'pothole on the main road near the drain' }).factors.resolutionCostFeasibility.score, 23);
  });

  it('urgency heuristic keys on categoryCode, not plain text (categoryCode empty → stays at 16)', () => {
    const r = scorePriority({ text: 'flooding near the river bank in ranchi' });
    // Pop heuristic fires (text includes 'flood' → 25), but urgency only checks categoryCode,
    // so with categoryCode='' it stays at the default 16 and counts as a missing field.
    assert.equal(r.factors.hazardUrgency.score, 16);
  });

  it('with disaster_mgmt categoryCode, urgency jumps to 25', () => {
    const r = scorePriority({ categoryCode: 'disaster_mgmt' });
    assert.equal(r.factors.hazardUrgency.score, 25);
  });
});

// ── Confidence penalties (T5.1 missing-field contract) ───────────────────────
describe('confidence — missing numerics penalty (−0.08/field, floor 0.30)', () => {
  it('all numerics provided → confidence 1.0', () => {
    const r = scorePriority({ affectedPopulation: 1200, economicValue: 80000, estimatedResolutionCost: 150000, hazardUrgency: 8 });
    assert.equal(r.confidence, 1.0);
  });

  it('pop + econ provided (2 missing) → confidence 0.84', () => {
    const r = scorePriority({ affectedPopulation: 5000, economicValue: 300000 });
    assert.equal(r.confidence, 0.84);
  });

  it('pop only (3 missing) → confidence 0.76', () => {
    const r = scorePriority({ affectedPopulation: 5000 });
    assert.equal(r.confidence, 0.76);
  });

  it('all empty (4 missing, all heuristic fallbacks miss) → confidence 0.68', () => {
    const r = scorePriority({});
    assert.ok(Math.abs(r.confidence - 0.68) < 0.001, `expected ~0.68, got ${r.confidence}`);
  });

  it('0.30 floor is a safety net — normal 4-pillar formula min confidence is 0.68 (4 missing)', () => {
    // missingFieldPenalty: max(0.30, 1.0 - missing*0.08). With exactly 4 nullable
    // pillars, the worst case is 1.0 - 0.32 = 0.68. The 0.30 floor only binds if
    // the formula is extended with more nullable fields. This test locks in the
    // documented contract for reviewers.
    const r = scorePriority({});
    assert.ok(r.confidence >= 0.30, `confidence ${r.confidence} must never drop below floor 0.30`);
  });
});

// ── Research bonuses (backend context) ───────────────────────────────────────
describe('research bonuses — activeAlert / recurringHazard / corroboration', () => {
  it('activeAlert +3 is applied and disclosed', () => {
    const base = scorePriority({ affectedPopulation: 1200 });
    const withAlert = scorePriority({ affectedPopulation: 1200, activeAlert: true });
    assert.equal(withAlert.totalScore, base.totalScore + 3);
    assert.ok(withAlert.bonusesApplied.includes('activeAlert +3'));
  });

  it('recurringHazard +2 is applied and disclosed', () => {
    const base = scorePriority({ affectedPopulation: 1200 });
    const withRecurring = scorePriority({ affectedPopulation: 1200, recurringHazard: true });
    assert.equal(withRecurring.totalScore, base.totalScore + 2);
    assert.ok(withRecurring.bonusesApplied.includes('recurringHazard +2'));
  });

  it('corroboration bonus is capped at +4 regardless of count', () => {
    const r = scorePriority({ affectedPopulation: 1200, corroborationCount: 12 });
    assert.ok(r.bonusesApplied.some((b) => b.startsWith('corroboration')));
    assert.ok(r.bonusesApplied.some((b) => b.endsWith('+4')), `expected cap at +4, got: ${r.bonusesApplied}`);
  });

  it('corroboration count of 1 → +1, count of 3 → +3', () => {
    const r1 = scorePriority({ affectedPopulation: 1200, corroborationCount: 1 });
    assert.ok(r1.bonusesApplied.some((b) => b.endsWith('+1')));
    const r3 = scorePriority({ affectedPopulation: 1200, corroborationCount: 3 });
    assert.ok(r3.bonusesApplied.some((b) => b.endsWith('+3')));
  });

  it('total score is capped at 100 even with all bonuses', () => {
    const r = scorePriority({
      affectedPopulation: 25000,
      economicValue: 9000000,
      estimatedResolutionCost: 50000,
      hazardUrgency: 10,
      activeAlert: true,
      recurringHazard: true,
      corroborationCount: 10,
    });
    assert.ok(r.totalScore <= 100, `expected cap at 100, got ${r.totalScore}`);
  });
});

// ── Canonical example from the plan (T6.2 verification snapshot) ──────────────
describe('canonical example — plan verification snapshot', () => {
  it('pop:1200 + econ:80k + urgency:9 + upvotes:5 + activeAlert → total 83 HIGH', () => {
    const r = scorePriority({
      affectedPopulation: 1200,
      economicValue: 80000,
      hazardUrgency: 9,
      upvotes: 5,
      activeAlert: true,
    });
    // Pop: 19 + 2 (upvotes) = 21. Econ: 15. Feas: 19 (null). Urg: 25. Base: 80. +3 bonus = 83.
    assert.equal(r.totalScore, 83);
    assert.equal(r.riskLevel, 'HIGH');

    // All 4 pillars must be present with valid reasons
    assert.deepEqual(
      Object.keys(r.factors),
      ['populationImpact', 'economicLifeSaving', 'resolutionCostFeasibility', 'hazardUrgency'],
    );
    for (const f of Object.values(r.factors)) {
      assert.ok(f.score >= 5 && f.score <= f.max, `factor score ${f.score} out of [5, ${f.max}] range`);
      assert.ok(f.reason.length > 0, 'factor must have a non-empty reason');
    }
  });
});

// ── Upvote reinforcement ─────────────────────────────────────────────────────
describe('upvote reinforcement — +1 to +2 popScore bonus', () => {
  it('upvotes 0 → no bonus', () => {
    const r = scorePriority({ affectedPopulation: 1200, upvotes: 0 });
    assert.equal(r.factors.populationImpact.score, 19);
  });

  it('upvotes 5 → +2 (floor(2.5)=2)', () => {
    const r = scorePriority({ affectedPopulation: 1200, upvotes: 5 });
    assert.equal(r.factors.populationImpact.score, 21);
  });

  it('upvotes 100 → capped at +2 within max 25', () => {
    const r = scorePriority({ affectedPopulation: 12000, upvotes: 100 });
    assert.equal(r.factors.populationImpact.score, 25);
  });
});