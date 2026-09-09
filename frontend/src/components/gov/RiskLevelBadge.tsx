import React from 'react';
import { TrendingUp, ShieldCheck, Database } from 'lucide-react';
import { ResearchResult, RiskLevel } from '../../services/workflowTypes';

/**
 * NIVAARAN — STEP 8C: Risk Level Badge & Verification Message (SIH 26043)
 *
 * Two small presentational pieces that close the audit loop on the priority card:
 *
 *   RiskLevelBadge         — the standardized triage tier (CRITICAL / HIGH / MEDIUM /
 *                            STANDARD) with the portal's shared severity colour map,
 *                            plus an "escalated by live data" indicator when live
 *                            research (an active weather alert or a recurring hazard)
 *                            is what pushed the score into its tier.
 *
 *   ResearchVerificationNote — one honest sentence naming which corpus actually
 *                            backed the score: live feeds, or government records only.
 */

// ── Risk level badge ─────────────────────────────────────────────────────────

/** Shared severity colour map (mirrors mapDataService.getSeverityBg):
 *  CRITICAL = red, HIGH = orange, MEDIUM = yellow/amber, STANDARD = green. */
const RISK_STYLE: Record<RiskLevel, string> = {
  CRITICAL: 'bg-[#B3261E] text-white border-[#B3261E]',
  HIGH:     'bg-[#B45309] text-white border-[#B45309]',
  MEDIUM:   'bg-[#C98A2C] text-white border-[#C98A2C]',
  STANDARD: 'bg-[#2C6E49] text-white border-[#2C6E49]',
};

const RISK_ORDER: RiskLevel[] = ['STANDARD', 'MEDIUM', 'HIGH', 'CRITICAL'];

interface RiskLevelBadgeProps {
  riskLevel?: RiskLevel | string | null;
  /** Live research attached to the challenge — drives the escalation indicator. */
  research?: ResearchResult | null;
  /** Explicit backend escalation flags (priority.triageMetadata), when available. */
  escalatedByWeather?: boolean;
  escalatedByRecurringHazard?: boolean;
  className?: string;
}

function normalizeRisk(value?: RiskLevel | string | null): RiskLevel {
  const v = (value || '').toString().toUpperCase();
  if (v === 'CRITICAL' || v === 'HIGH' || v === 'MEDIUM' || v === 'STANDARD') return v as RiskLevel;
  return 'STANDARD';
}

export const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({
  riskLevel,
  research,
  escalatedByWeather,
  escalatedByRecurringHazard,
  className,
}) => {
  const tier = normalizeRisk(riskLevel);

  // Escalation is only claimed when a live signal actually exists. Prefer the
  // backend's own triageMetadata flags; otherwise derive from the same research
  // fields the priority engine used (activeAlert / recurringHazardIdentified).
  const weatherEscalation =
    escalatedByWeather ?? Boolean(research?.activeAlert);
  const recurringEscalation =
    escalatedByRecurringHazard ??
    Boolean(research?.recurringHazardIdentified || research?.recurringHazard);

  // Only surface the indicator when the live signal plausibly moved the tier —
  // i.e. the challenge sits above the baseline tier and a live driver is present.
  const hasLiveDriver = weatherEscalation || recurringEscalation;
  const aboveBaseline = RISK_ORDER.indexOf(tier) >= RISK_ORDER.indexOf('HIGH');
  const showEscalation = hasLiveDriver && aboveBaseline;

  const escalationReason = weatherEscalation
    ? 'active weather alert'
    : 'recurring hazard pattern';

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className || ''}`}>
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wide ${RISK_STYLE[tier]}`}
      >
        {tier} RISK
      </span>

      {showEscalation && (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#FFF8EC] text-[#B45309] border-[#F0D99A]"
          title={`Live research (${escalationReason}) raised this challenge's priority tier.`}
        >
          <TrendingUp className="w-3 h-3" aria-hidden="true" />
          escalated by live data
        </span>
      )}
    </div>
  );
};

// ── Verification message ─────────────────────────────────────────────────────

interface ResearchVerificationNoteProps {
  research?: ResearchResult | null;
  className?: string;
}

/**
 * A source tag counts as "live" when it names a real upstream feed rather than
 * the offline DB fallback. Matches the backend sourceBreakdown vocabulary:
 *   news    : 'GNews' | 'NewsAPI' | 'none'
 *   weather : 'disaster-live' | 'disaster-fallback'
 *   govt    : 'live' | 'govt-live' | 'db' | 'govt-db' | 'none'
 */
function isLiveTag(tag?: string): boolean {
  if (!tag) return false;
  const v = tag.toLowerCase();
  return v !== 'none' && !v.includes('db') && !v.includes('fallback');
}

export const ResearchVerificationNote: React.FC<ResearchVerificationNoteProps> = ({
  research,
  className,
}) => {
  if (!research) return null;

  const breakdown = research.sourceBreakdown || {};
  const anyLive =
    isLiveTag(breakdown.news) ||
    isLiveTag(breakdown.weather) ||
    isLiveTag(breakdown.govt) ||
    isLiveTag(research.source);

  const message = anyLive
    ? 'Verified against live IMD / Open-Meteo / news sources.'
    : 'Verified against government records (live sources unavailable).';

  const Icon = anyLive ? ShieldCheck : Database;
  const tone = anyLive ? 'text-[#2C6E49]' : 'text-[#8A7F72]';

  return (
    <p className={`flex items-start gap-1.5 text-[10px] leading-snug ${tone} ${className || ''}`}>
      <Icon className="w-3 h-3 mt-px shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
};