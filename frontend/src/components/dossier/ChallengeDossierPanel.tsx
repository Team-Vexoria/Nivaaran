import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  MapPin,
  Printer,
  Building2,
  ShieldCheck,
  AlertTriangle,
  Pencil,
  FileSearch,
} from 'lucide-react';
import { StageDetailAccordionByPhase } from '../stages/StageDetailAccordion';
import { GovernmentDossierOverridePanel } from '../government/GovernmentDossierOverridePanel';
import { workflowStore } from '../../services/workflowStore';
import { getSeverityBg, getStatusPillClass } from '../../services/mapDataService';
import type { Challenge } from '../../services/workflowTypes';
import type { ChallengeDoc } from '../../services/firebaseService';

const ALL_16_STAGES = [
  { num: 1,  name: 'Submission',                        phase: 'Phase 1: Problem Intake & Triage',          actor: 'Citizen / Community' },
  { num: 2,  name: 'AI Understanding & Classification', phase: 'Phase 1: Problem Intake & Triage',          actor: 'AI Engine' },
  { num: 3,  name: 'Semantic Deduplication & Cluster',  phase: 'Phase 1: Problem Intake & Triage',          actor: 'AI Engine' },
  { num: 4,  name: 'Severity Prioritization',           phase: 'Phase 1: Problem Intake & Triage',          actor: 'AI Engine' },
  { num: 5,  name: 'Government Validation',             phase: 'Phase 1: Problem Intake & Triage',          actor: 'State Nodal Officer' },
  { num: 6,  name: 'Institution Matching',              phase: 'Phase 2: Academic Allocation & Team',       actor: 'AI Matchmaker' },
  { num: 7,  name: 'University R&D Acceptance',         phase: 'Phase 2: Academic Allocation & Team',       actor: 'University Dean / HoD' },
  { num: 8,  name: 'Multidisciplinary Team Formation',  phase: 'Phase 2: Academic Allocation & Team',       actor: 'Faculty Mentor' },
  { num: 9,  name: 'Technical Solution Proposal',       phase: 'Phase 2: Academic Allocation & Team',       actor: 'Student & Faculty Team' },
  { num: 10, name: 'Industry / CSR Hardware Collab',    phase: 'Phase 3: Industry & Prototyping',           actor: 'Industry Partner / CSR' },
  { num: 11, name: 'Hardware & IoT Prototyping',        phase: 'Phase 3: Industry & Prototyping',           actor: 'University R&D Lab' },
  { num: 12, name: 'Panchayat Ground Pilot Trial',      phase: 'Phase 3: Industry & Prototyping',           actor: 'University & Panchayat' },
  { num: 13, name: 'Field Outcome Audit',               phase: 'Phase 3: Industry & Prototyping',           actor: 'Govt Field Auditor' },
  { num: 14, name: 'Statewide Deployment Hand-Off',     phase: 'Phase 4: Statewide Deployment & Impact',   actor: 'Line Department' },
  { num: 15, name: 'State Impact Ledger Proof',         phase: 'Phase 4: Statewide Deployment & Impact',   actor: 'Technical Directorate' },
  { num: 16, name: 'Verified Closure & Knowledge Base', phase: 'Phase 4: Statewide Deployment & Impact',   actor: 'State Government' },
];

interface ChallengeDossierPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Supply either a full Challenge from workflowStore OR a ChallengeDoc from Firebase */
  challenge?: Challenge | null;
  challengeDoc?: ChallengeDoc | null;
  /** Alternatively, supply just a report ID and the panel will look it up from workflowStore */
  initialReportId?: string;
  /** If true, shows the government override panel tab */
  showOverridePanel?: boolean;
}

function normalizeChallengeDoc(doc: ChallengeDoc): Challenge {
  const d = doc as any;
  return {
    id: d.id || d.reportId || '',
    reportId: d.reportId || d.id || '',
    title: d.title || '',
    description: d.description || d.summary || '',
    district: d.district || '',
    block: d.block || '',
    village: d.village || '',
    status: d.status || 'Submitted',
    stageNumber: d.stageNumber || 1,
    stageName: d.stageName || 'Submission',
    category: d.category || '',
    aiAnalysis: d.aiAnalysis,
    priorityScore: d.priorityScore,
    confidenceScore: d.confidenceScore,
    riskLevel: d.riskLevel,
    evidenceUrls: d.evidenceUrls || [],
    assignedHEI: d.assignedHEI,
    assignedDept: d.assignedDept,
    csrSponsor: d.csrSponsor,
    govtOfficerNote: d.govtOfficerNote,
    govtValidatedBy: d.govtValidatedBy,
    govtValidatedAt: d.govtValidatedAt,
    citizenReportCount: d.citizenReportCount,
    clusterId: d.clusterId,
    submittedBy: d.submittedBy,
    createdAt: d.createdAt || new Date().toISOString(),
    updatedAt: d.updatedAt || new Date().toISOString(),
  };
}

export const ChallengeDossierPanel: React.FC<ChallengeDossierPanelProps> = ({
  isOpen,
  onClose,
  challenge: challengeProp,
  challengeDoc,
  initialReportId,
  showOverridePanel = false,
}) => {
  const [activeTab, setActiveTab] = useState<'stages' | 'overview' | 'override'>('stages');
  const [resolvedChallenge, setResolvedChallenge] = useState<Challenge | null>(null);
  const [showOverride, setShowOverride] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (challengeProp) {
      setResolvedChallenge(challengeProp);
    } else if (challengeDoc) {
      const wf = workflowStore.getChallenge(challengeDoc.id || challengeDoc.reportId || '');
      if (wf) {
        setResolvedChallenge(wf);
      } else {
        setResolvedChallenge(normalizeChallengeDoc(challengeDoc));
      }
    } else if (initialReportId) {
      // Look up by report ID from workflowStore
      const wf = workflowStore.getChallenge(initialReportId);
      if (wf) {
        setResolvedChallenge(wf);
      } else {
        // Fallback: construct a minimal Challenge with seed data
        const seed: Challenge = {
          id: initialReportId,
          reportId: initialReportId,
          title: `Challenge ${initialReportId}`,
          description: 'Challenge details loading from local store.',
          district: '',
          block: '',
          village: '',
          status: 'HEI Matched',
          stageNumber: 6,
          stageName: 'Stage 6: Institution Matching',
          category: 'Infrastructure',
          evidenceUrls: [],
          assignedHEI: 'BIT Mesra, Ranchi',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setResolvedChallenge(seed);
      }
    }
  }, [isOpen, challengeProp, challengeDoc, initialReportId]);

  if (!isOpen || !resolvedChallenge) return null;

  const currentStageNum = resolvedChallenge.stageNumber || 1;
  const progressPct = Math.round((currentStageNum / 16) * 100);

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-[#E4DDD1] px-5 py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Layers className="w-5 h-5 text-[#2C6E49] shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-extrabold text-[#2C6E49] bg-[#2C6E49]/10 px-2 py-0.5 rounded border border-[#2C6E49]/20">
                  {resolvedChallenge.reportId}
                </span>
                {resolvedChallenge.riskLevel && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getSeverityBg(resolvedChallenge.riskLevel)} text-white`}>
                    {resolvedChallenge.riskLevel}
                  </span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusPillClass(resolvedChallenge.status)}`}>
                  {resolvedChallenge.status}
                </span>
              </div>
              <h2 className="text-base font-black font-heading text-[#201C18] mt-1 truncate">
                {resolvedChallenge.title || 'Challenge Dossier'}
              </h2>
              {(resolvedChallenge.district || resolvedChallenge.village) && (
                <p className="text-[11px] text-[#6A6155] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#B5502D]" />
                  {[resolvedChallenge.village, resolvedChallenge.block, resolvedChallenge.district, 'Jharkhand'].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showOverridePanel && (
              <button
                type="button"
                onClick={() => setShowOverride(v => !v)}
                className="p-2 text-amber-600 hover:bg-amber-50 border border-amber-200 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                title="Officer Override Panel"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Override</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 text-[#4A433B] hover:bg-[#EAE4D8] border border-[#E4DDD1] rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5 text-[#2C6E49]" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#8A7F72] hover:text-[#201C18] hover:bg-[#EAE4D8] border border-[#E4DDD1] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Progress bar ────────────────────────────────────────────────────── */}
        <div className="bg-white px-5 py-2 border-b border-[#E4DDD1] shrink-0">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#8A7F72] mb-1.5">
            <span>Stage {currentStageNum} / 16</span>
            <span>{progressPct}% complete</span>
          </div>
          <div className="h-2 bg-[#E4DDD1] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
        <div className="flex border-b border-[#E4DDD1] bg-white shrink-0 text-[11px] font-bold">
          {(['stages', 'overview'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 transition-colors border-b-2 cursor-pointer capitalize ${
                activeTab === tab
                  ? 'border-[#2C6E49] text-[#2C6E49] font-black bg-[#FAF8F4]'
                  : 'border-transparent text-[#6A6155] hover:text-[#201C18]'
              }`}
            >
              {tab === 'stages' ? '16-Stage Lifecycle' : 'Challenge Overview'}
            </button>
          ))}
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Override panel sidebar */}
          {showOverride && (
            <div className="w-96 border-r border-[#E4DDD1] overflow-y-auto shrink-0">
              <GovernmentDossierOverridePanel
                challenge={resolvedChallenge}
                readOnly={!showOverridePanel}
                onClose={() => setShowOverride(false)}
              />
            </div>
          )}

          {/* Main content area */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'stages' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-[#6A6155]">
                  <FileSearch className="w-4 h-4 text-[#2C6E49]" />
                  <p>Click any stage to expand its full description, rationale, and university assignment details.</p>
                </div>
                <StageDetailAccordionByPhase
                  allStages={ALL_16_STAGES}
                  currentStageNum={currentStageNum}
                  challenge={resolvedChallenge}
                />
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Identity */}
                <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black text-[#201C18] uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2C6E49]" /> Challenge Identity
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    {[
                      ['Report ID', resolvedChallenge.reportId],
                      ['Category', resolvedChallenge.category || '—'],
                      ['Status', resolvedChallenge.status],
                      ['Stage', `${resolvedChallenge.stageNumber} / 16`],
                      ['Priority Score', resolvedChallenge.priorityScore !== undefined ? `${resolvedChallenge.priorityScore.toFixed(1)} / 10` : '—'],
                      ['Risk Level', resolvedChallenge.riskLevel || '—'],
                      ['Assigned HEI', resolvedChallenge.assignedHEI || 'Pending'],
                      ['CSR Partner', resolvedChallenge.csrSponsor || 'Not yet assigned'],
                    ].map(([label, value]) => (
                      <div key={label} className="py-1 border-b border-[#F0EBE0]">
                        <p className="text-[#8A7F72] text-[10px]">{label}</p>
                        <p className="font-bold text-[#201C18]">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                {resolvedChallenge.description && (
                  <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5">
                    <h3 className="text-xs font-black text-[#201C18] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#2C6E49]" /> Problem Description
                    </h3>
                    <p className="text-xs text-[#4A433B] leading-relaxed">{resolvedChallenge.description}</p>
                  </div>
                )}

                {/* Govt officer note */}
                {resolvedChallenge.govtOfficerNote && (
                  <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5">
                    <h3 className="text-xs font-black text-[#201C18] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#2C6E49]" /> Government Officer Note
                    </h3>
                    <p className="text-xs text-[#4A433B] leading-relaxed italic">
                      "{resolvedChallenge.govtOfficerNote}"
                    </p>
                    {resolvedChallenge.govtValidatedBy && (
                      <p className="text-[10px] text-[#8A7F72] mt-1">— {resolvedChallenge.govtValidatedBy}</p>
                    )}
                  </div>
                )}

                {/* Missing info */}
                {!resolvedChallenge.assignedHEI && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-700">University Not Yet Assigned</p>
                      <p className="text-[11px] text-amber-600 mt-0.5">
                        The AI Institution Matchmaker will automatically assign a university after government validation (Stage 5). Until then, stage descriptions for Stages 6–16 will use estimated data.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
