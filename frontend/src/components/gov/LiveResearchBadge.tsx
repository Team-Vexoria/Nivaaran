import React from 'react';
import { Globe, Database, Megaphone, ShieldCheck, ShieldAlert, ExternalLink } from 'lucide-react';
import { ResearchResult } from '../../services/workflowTypes';

interface LiveResearchBadgeProps {
  research?: ResearchResult | null;
  className?: string;
}

/**
 * NIVAARAN — STEP 8A + 8B: Live Research Badge & Confidence / Evidence Panel (SIH 26043)
 *
 * Renders on the government portal's AI Priority Score card to show exactly which
 * real sources backed the automated score. Reads the `research` object attached by
 * the worker pipeline (Step 7C) and renders:
 *
 *   8A — top row (single horizontal badge row):
 *     1. Source-count badge       — how many of the 3 channels returned LIVE data.
 *     2. Advisory-count chip       — governmentAdvisories.length.
 *     3. Corroboration tag         — CORROBORATED (3 live) / PARTIAL (1-2) / DB ONLY (0).
 *
 *   8B — audit row:
 *     4. Honest confidence meter   — green ≥0.85 / yellow ≥0.70 / red <0.70, shown as
 *        a percentage pill + progress bar, with an explicit text label (never color alone).
 *     5. Clickable evidence links — one external link per recentIncidents[] entry that
 *        has a URL; hidden entirely when no URLs exist.
 *
 * Renders nothing when no research evidence is present — the badge never fabricates
 * verification it cannot prove.
 */

const PILL = 'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border';

// ── helpers ────────────────────────────────────────────────────────────────────

/**
 * A source tag counts as "live" when it names a real upstream feed rather than the
 * offline DB fallback. Matches the backend sourceBreakdown vocabulary:
 *   news    : 'GNews' | 'NewsAPI' | 'none'
 *   weather : 'disaster-live' | 'disaster-fallback'
 *   govt    : 'live' | 'govt-live' | 'db' | 'govt-db' | 'none'
 */
function isLiveTag(tag?: string): boolean {
  if (!tag) return false;
  const v = tag.toLowerCase();
  return v !== 'none' && !v.includes('db') && !v.includes('fallback');
}

type ConfidenceTier = 'live-verified' | 'partial' | 'fallback';

function confidenceTier(confidence: number | undefined): ConfidenceTier {
  if (confidence === undefined || confidence === null) return 'fallback';
  if (confidence >= 0.85) return 'live-verified';
  if (confidence >= 0.70) return 'partial';
  return 'fallback';
}

const CONFIDENCE_STYLE: Record<ConfidenceTier, { pill: string; bar: string; label: string }> = {
  // green — live-verified
  'live-verified': {
    pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    bar: 'bg-emerald-500',
    label: 'Live-verified',
  },
  // yellow — partial
  partial: {
    pill: 'bg-amber-50 text-amber-800 border-amber-200',
    bar: 'bg-amber-400',
    label: 'Partial',
  },
  // red — DB / fallback
  fallback: {
    pill: 'bg-red-50 text-red-700 border-red-200',
    bar: 'bg-red-400',
    label: 'DB / Fallback',
  },
};

// ── component ────────────────────────────────────────────────────────────────

export const LiveResearchBadge: React.FC<LiveResearchBadgeProps> = ({ research, className }) => {
  if (!research) return null;

  const breakdown = research.sourceBreakdown || {};
  const liveCount =
    (isLiveTag(breakdown.news) ? 1 : 0) +
    (isLiveTag(breakdown.weather) ? 1 : 0) +
    (isLiveTag(breakdown.govt) ? 1 : 0);

  const advisories = research.governmentAdvisories || research.advisories || [];
  const advisoryCount = advisories.length;

  const confidence: number | undefined =
    typeof research.confidence === 'number' ? research.confidence : undefined;
  const confidencePct = confidence !== undefined ? Math.round(confidence * 100) : undefined;
  const tier = confidenceTier(confidence);
  const tierStyle = CONFIDENCE_STYLE[tier];

  // ── 8A: top badge row ──────────────────────────────────────────────────────
  const sourceLive = liveCount > 0;
  const sourceLabel = sourceLive
    ? `${liveCount} source${liveCount === 1 ? '' : 's'} verified`
    : 'DB only';
  const sourceStyle = sourceLive
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : 'bg-slate-100 text-slate-600 border-slate-200';

  let corrLabel: string;
  let corrStyle: string;
  let CorrIcon: typeof ShieldCheck;
  if (liveCount >= 3) {
    corrLabel = 'CORROBORATED';
    corrStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    CorrIcon = ShieldCheck;
  } else if (liveCount >= 1) {
    corrLabel = 'PARTIAL';
    corrStyle = 'bg-[#FFF8EC] text-[#C98A2C] border-[#F0D99A]';
    CorrIcon = ShieldAlert;
  } else {
    corrLabel = 'DB ONLY';
    corrStyle = 'bg-slate-100 text-slate-600 border-slate-200';
    CorrIcon = Database;
  }

  // ── 8B: evidence links (recentIncidents ∪ incidents, keep only those with a real URL)
  const rawIncidents = [...(research.recentIncidents || []), ...(research.incidents || [])];
  // Deduplicate by URL (first occurrence wins), drop entries without a usable http(s) URL.
  const seenUrls = new Set<string>();
  const evidenceLinks: { title: string; source: string; url: string; snippet?: string }[] = [];
  for (const inc of rawIncidents) {
    const url = (inc.url || '').trim();
    if (!url || !/^https?:\/\//i.test(url)) continue;
    const key = url.toLowerCase();
    if (seenUrls.has(key)) continue;
    seenUrls.add(key);
    evidenceLinks.push({
      title: (inc.title || 'Source').trim() || 'Source',
      source: (inc.source || 'Unknown source').trim() || 'Unknown source',
      url,
      snippet: inc.snippet,
    });
  }

  return (
    <div className={`flex flex-col gap-2 ${className || ''}`}>
      {/* ═══ Row 1 — 8A badges ═══ */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`${PILL} ${sourceStyle}`}>
          {sourceLive ? <Globe className="w-3 h-3" /> : <Database className="w-3 h-3" />}
          {sourceLabel}
        </span>

        {advisoryCount > 0 && (
          <span className={`${PILL} bg-[#FAF8F4] text-[#6A6155] border-[#E4DDD1]`}>
            <Megaphone className="w-3 h-3 text-[#C98A2C]" />
            {advisoryCount} government {advisoryCount === 1 ? 'advisory' : 'advisories'}
          </span>
        )}

        <span className={`${PILL} ${corrStyle}`}>
          <CorrIcon className="w-3 h-3" />
          {corrLabel}
        </span>
      </div>

      {/* ═══ Row 2 — 8B confidence meter ═══ */}
      {/* Always rendered when research exists: the honest score is never hidden. */}
      {confidencePct !== undefined && (
        <div className="flex items-center gap-2">
          {/* Accessible text label — never color alone. */}
          <span
            className={`${PILL} ${tierStyle.pill}`}
            role="status"
            aria-label={`Research confidence ${confidencePct} percent — ${tierStyle.label}`}
          >
            {confidencePct}% confidence
            <span className="font-normal opacity-80">· {tierStyle.label}</span>
          </span>
          {/* Progress bar — visual reinforcement of the same value. */}
          <div
            className="flex-1 max-w-[140px] h-1.5 rounded-full bg-[#E4DDD1] overflow-hidden"
            role="progressbar"
            aria-valuenow={confidencePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Research confidence ${confidencePct}%`}
          >
            <div
              className={`h-full rounded-full transition-all ${tierStyle.bar}`}
              style={{ width: `${Math.min(100, Math.max(0, confidencePct))}%` }}
            />
          </div>
        </div>
      )}

      {/* ═══ Row 3 — 8B evidence links ═══ */}
      {/* Hidden entirely when no linkable incidents exist — no broken or empty slots. */}
      {evidenceLinks.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#8A7F72] uppercase tracking-wide">
            Source evidence
          </span>
          <ul className="space-y-1">
            {evidenceLinks.map((ev) => (
              <li key={ev.url}>
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#2C6E49] hover:text-[#1B4332] hover:underline underline-offset-2 break-all"
                >
                  <ExternalLink className="w-3 h-3 shrink-0 text-[#8A7F72]" aria-hidden="true" />
                  <span>{ev.title}</span>
                  <span className="font-normal text-[#8A7F72]">— {ev.source}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
