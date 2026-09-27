import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Building2,
  AlertTriangle,
  Pencil,
  Info,
  GraduationCap,
  FlaskConical,
  Users,
  XCircle,
} from 'lucide-react';
import { composeStageDescription } from '../../services/stageDescriptionEngine';
import type { Challenge } from '../../services/workflowTypes';

interface StageInfo {
  num: number;
  name: string;
  actor: string;
}

interface StageDetailAccordionProps {
  stages: StageInfo[];
  currentStageNum: number;
  challenge: Challenge;
  /** If true, only one item can be open at a time (default: true) */
  singleOpen?: boolean;
  /** Compact mode for embedding inside small panels */
  compact?: boolean;
}

const PHASE_COLORS: Record<string, { label: string; done: string; current: string; pending: string }> = {
  'Phase 1: Problem Intake & Triage': {
    label: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    done: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    current: 'bg-amber-50 border-amber-300 text-amber-800',
    pending: 'bg-white border-[#E4DDD1] text-[#8A7F72]',
  },
  'Phase 2: Academic Allocation & Team': {
    label: 'bg-blue-50 text-blue-700 border-blue-200',
    done: 'bg-blue-50 border-blue-200 text-blue-700',
    current: 'bg-amber-50 border-amber-300 text-amber-800',
    pending: 'bg-white border-[#E4DDD1] text-[#8A7F72]',
  },
  'Phase 3: Industry & Prototyping': {
    label: 'bg-orange-50 text-orange-700 border-orange-200',
    done: 'bg-orange-50 border-orange-200 text-orange-700',
    current: 'bg-amber-50 border-amber-300 text-amber-800',
    pending: 'bg-white border-[#E4DDD1] text-[#8A7F72]',
  },
  'Phase 4: Statewide Deployment & Impact': {
    label: 'bg-purple-50 text-purple-700 border-purple-200',
    done: 'bg-purple-50 border-purple-200 text-purple-700',
    current: 'bg-amber-50 border-amber-300 text-amber-800',
    pending: 'bg-white border-[#E4DDD1] text-[#8A7F72]',
  },
};

function getPhaseKey(stageNum: number): string {
  if (stageNum <= 5) return 'Phase 1: Problem Intake & Triage';
  if (stageNum <= 9) return 'Phase 2: Academic Allocation & Team';
  if (stageNum <= 13) return 'Phase 3: Industry & Prototyping';
  return 'Phase 4: Statewide Deployment & Impact';
}

export const StageDetailAccordion: React.FC<StageDetailAccordionProps> = ({
  stages,
  currentStageNum,
  challenge,
  singleOpen = true,
  compact = false,
}) => {
  const [openStages, setOpenStages] = useState<Set<number>>(() => {
    // Auto-open current stage
    return new Set([currentStageNum]);
  });

  const toggle = (stageNum: number) => {
    setOpenStages(prev => {
      const next = new Set(prev);
      if (next.has(stageNum)) {
        next.delete(stageNum);
      } else {
        if (singleOpen) next.clear();
        next.add(stageNum);
      }
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {stages.map((st) => {
        const isDone = currentStageNum >= 16 || st.num < currentStageNum || (st.num === 16 && currentStageNum === 16);
        const isCurrent = currentStageNum < 16 && st.num === currentStageNum;
        const isOpen = openStages.has(st.num);
        const phaseKey = getPhaseKey(st.num);
        const colors = PHASE_COLORS[phaseKey] || PHASE_COLORS['Phase 1: Problem Intake & Triage'];

        // Only compose description if stage is relevant (done or current) or if expanding pending
        const desc = isOpen ? composeStageDescription(challenge, st.num) : null;

        return (
          <div
            key={st.num}
            className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              isDone ? colors.done : isCurrent ? colors.current : colors.pending
            } ${isCurrent ? 'shadow-sm' : ''}`}
          >
            {/* Stage Header — always visible, clickable */}
            <button
              type="button"
              onClick={() => toggle(st.num)}
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-black/5 transition-colors cursor-pointer"
            >
              {/* Status icon */}
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className={`w-4 h-4 ${compact ? 'w-3.5 h-3.5' : ''} text-emerald-600`} />
                ) : isCurrent ? (
                  <Clock className={`w-4 h-4 ${compact ? 'w-3.5 h-3.5' : ''} text-amber-600 animate-pulse`} />
                ) : (
                  <div className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} rounded-full border-2 border-current opacity-30`} />
                )}
              </div>

              {/* Stage info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`font-mono ${compact ? 'text-[9px]' : 'text-[10px]'} font-extrabold opacity-70`}>
                    S{st.num}
                  </span>
                  <span className={`font-bold ${compact ? 'text-[10px]' : 'text-[11px]'} truncate`}>
                    {st.name}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-black bg-amber-500/20 text-amber-700 px-1.5 py-0.5 rounded-full shrink-0">
                      ACTIVE
                    </span>
                  )}
                </div>
                {!compact && (
                  <p className="text-[9px] opacity-60 mt-0.5">{st.actor}</p>
                )}
              </div>

              {/* Expand/collapse chevron */}
              <div className="shrink-0 opacity-50">
                {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {/* Expanded Description Panel */}
            {isOpen && desc && (
              <div className="border-t border-current/10 px-4 pb-4 pt-3 space-y-3 animate-fadeIn">
                {/* Override note banner */}
                {desc.overrideNote && (
                  <div className="flex items-start gap-2 bg-white/70 border border-amber-300 rounded-lg px-3 py-2">
                    <Pencil className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-0.5">Officer Override Note</p>
                      <p className="text-[11px] text-[#4A433B] italic">"{desc.overrideNote}"</p>
                    </div>
                  </div>
                )}

                {/* Headline */}
                <p className="text-xs font-black text-[#201C18]">{desc.headline}</p>

                {/* Body */}
                <p className="text-[11px] text-[#5A5247] leading-relaxed">{desc.body}</p>

                {/* Bullet points */}
                {desc.bulletPoints.length > 0 && (
                  <ul className="space-y-1.5">
                    {desc.bulletPoints.map((bp, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-[#4A433B]">
                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0 mt-1.5" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* University Rationale (stages 6–16) */}
                {desc.universityRationale && (
                  <div className="bg-white/80 border border-blue-200 rounded-xl p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                      <p className="text-[11px] font-black text-blue-800">University Rationale</p>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <p className="font-bold text-[#201C18]">{desc.universityRationale.university.name}</p>
                      {desc.universityRationale.department && (
                        <p className="text-[#5A5247]">
                          <span className="font-semibold">Dept:</span> {desc.universityRationale.department.name}
                        </p>
                      )}
                    </div>

                    {/* Why selected */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Why Selected</p>
                      {desc.universityRationale.whySelected.map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-[#4A433B]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    {/* Active labs */}
                    {desc.universityRationale.department?.activeLabs && desc.universityRationale.department.activeLabs.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-[#5A5247] uppercase tracking-wider flex items-center gap-1">
                          <FlaskConical className="w-3 h-3" /> Active Labs
                        </p>
                        {desc.universityRationale.department.activeLabs.slice(0, 3).map((lab, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#4A433B]">
                            <div className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                            <span>{lab}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Faculty */}
                    {desc.universityRationale.department && (() => {
                      const faculty = desc.universityRationale!.university.faculty.filter(
                        f => f.departmentId === desc.universityRationale!.department!.id
                      );
                      if (!faculty.length) return null;
                      return (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-[#5A5247] uppercase tracking-wider flex items-center gap-1">
                            <Users className="w-3 h-3" /> Faculty Mentors
                          </p>
                          {faculty.slice(0, 2).map((f, i) => (
                            <div key={i} className="text-[11px] text-[#4A433B]">
                              <span className="font-semibold">{f.name}</span> — {f.designation}
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Why NOT others */}
                    {desc.universityRationale.whyNotOthers.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-blue-100">
                        <p className="text-[10px] font-black text-red-700 uppercase tracking-wider">Why Not Selected</p>
                        {desc.universityRationale.whyNotOthers.map((wno, i) => (
                          <div key={i} className="space-y-0.5">
                            <p className="text-[10px] font-bold text-[#4A433B]">{wno.shortName}</p>
                            {wno.reasons.map((r, j) => (
                              <div key={j} className="flex items-start gap-1.5 text-[10px] text-[#8A7F72] pl-2">
                                <XCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Missing capabilities */}
                    {desc.universityRationale.missingCapabilities.length > 0 && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                        <Info className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          {desc.universityRationale.missingCapabilities.map((m, i) => (
                            <p key={i} className="text-[10px] text-amber-800">{m}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Missing fields warning */}
                {desc.missingFields.length > 0 && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-amber-700 mb-0.5">Missing Information</p>
                      {desc.missingFields.map((f, i) => (
                        <p key={i} className="text-[10px] text-amber-800">• {f}</p>
                      ))}
                      <p className="text-[9px] text-amber-600 mt-1">Missing data reduces the priority and readiness score for this stage.</p>
                    </div>
                  </div>
                )}

                {/* Actor label */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-current/10">
                  <Building2 className="w-3 h-3 opacity-40 shrink-0" />
                  <p className="text-[9px] font-bold opacity-50 uppercase tracking-wider">
                    Responsible actor: {desc.actorLabel}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Grouped by Phase wrapper ─────────────────────────────────────────────────

type ALL_STAGE = {
  num: number;
  name: string;
  phase: string;
  actor: string;
}

interface StageDetailAccordionByPhaseProps {
  allStages: ALL_STAGE[];
  currentStageNum: number;
  challenge: Challenge;
  compact?: boolean;
}

export const StageDetailAccordionByPhase: React.FC<StageDetailAccordionByPhaseProps> = ({
  allStages,
  currentStageNum,
  challenge,
  compact = false,
}) => {
  const phases = Array.from(new Set(allStages.map(s => s.phase)));

  return (
    <div className="space-y-4">
      {phases.map(phaseTitle => {
        const phaseStages = allStages.filter(s => s.phase === phaseTitle);
        const isPhaseDone = currentStageNum >= 16 || phaseStages.every(s => s.num < currentStageNum || (s.num === 16 && currentStageNum >= 16));
        const isPhaseCurrent = currentStageNum < 16 && phaseStages.some(s => s.num === currentStageNum);

        return (
          <div key={phaseTitle} className="border border-[#E4DDD1] rounded-xl overflow-hidden bg-[#FAF8F4]/60">
            {/* Phase header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#E4DDD1]">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                isPhaseDone
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isPhaseCurrent
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-gray-50 text-[#8A7F72] border-[#E4DDD1]'
              }`}>
                {phaseTitle}
              </span>
              <span className="text-[10px] text-[#8A7F72]">
                Stages {phaseStages[0].num}–{phaseStages[phaseStages.length - 1].num}
              </span>
            </div>

            {/* Stage accordion items */}
            <div className="p-2.5 space-y-1.5">
              <StageDetailAccordion
                stages={phaseStages}
                currentStageNum={currentStageNum}
                challenge={challenge}
                singleOpen={false}
                compact={compact}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper re-export for phase groupings
export { getPhaseKey, PHASE_COLORS };
export type { StageInfo };
