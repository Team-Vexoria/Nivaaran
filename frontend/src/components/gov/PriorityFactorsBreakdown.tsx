import React from 'react';
import { PriorityFactors } from '../../services/workflowTypes';

interface PriorityFactorsBreakdownProps {
  factors?: PriorityFactors | null;
}

/**
 * NIVAARAN — STEP 8C: 4-Factor Score Breakdown (SIH 26043)
 *
 * Renders the four weighted factors produced by the priority engine (Step 6)
 * as labeled bars with "score / max" figures and the engine's own reasoning
 * text, so government officials can audit exactly how the AI Priority Score
 * was assembled. Renders nothing when factors are absent — no fabricated scores.
 */

const FACTOR_LABELS: { key: keyof PriorityFactors; label: string }[] = [
  { key: 'populationImpact', label: 'Population Impact' },
  { key: 'economicLifeSaving', label: 'Economic & Life Saving' },
  { key: 'resolutionCostFeasibility', label: 'Resolution Cost Feasibility' },
  { key: 'hazardUrgency', label: 'Hazard Urgency' },
];

export const PriorityFactorsBreakdown: React.FC<PriorityFactorsBreakdownProps> = ({ factors }) => {
  if (!factors) return null;

  const rows = FACTOR_LABELS.map(({ key, label }) => {
    const f = factors[key];
    if (!f || typeof f.score !== 'number' || typeof f.max !== 'number') return null;
    const pct = f.max > 0 ? Math.min(100, Math.max(0, (f.score / f.max) * 100)) : 0;
    return { key, label, f, pct };
  }).filter(Boolean) as { key: keyof PriorityFactors; label: string; f: { score: number; max: number; reason: string }; pct: number }[];

  if (rows.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <h4 className="font-black text-[#8A7F72] uppercase tracking-wider text-[10px]">4-Factor Score Breakdown</h4>
      {rows.map(({ key, label, f, pct }) => (
        <div key={key}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#201C18]">{label}</span>
            <span className="font-mono text-[10px] font-bold text-[#8A7F72]">
              {f.score} / {f.max}
            </span>
          </div>
          <div
            className="mt-1 h-1.5 rounded-full bg-[#EAE4D8] overflow-hidden"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} ${f.score} out of ${f.max}`}
          >
            <div
              className="h-full rounded-full bg-[#C98A2C]"
              style={{ width: `${pct}%` }}
            />
          </div>
          {f.reason && (
            <p className="text-[10px] text-[#6A6155] mt-0.5 leading-snug">{f.reason}</p>
          )}
        </div>
      ))}
    </div>
  );
};