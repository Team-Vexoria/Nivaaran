import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Map as MapIcon,
  ListFilter,
  LogOut,
  AlertCircle,
  Building2,
  Clock,
  X,
  MessageSquare,
  AlertTriangle,
  LayoutDashboard,
  ArrowRight,
  Flame,
  FileCheck,
  Layers,
  Cpu,
  Eye,
  MapPin,
  User,
  FileText,
  Download,
  Check,
  Pencil,
  Rocket,
  Archive,
  TrendingUp,
  CheckCheck,
  ShieldCheck,
  Award,
  Users,
  Handshake,
  Sparkles,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { JharkhandMapExplorer } from '../../components/map/JharkhandMapExplorer';
import { useMapData, getSeverityBg, getStatusPillClass } from '../../services/mapDataService';
import { govValidateChallenge, govRequestEvidence, govVerifyAndDeployChallenge, govRejectChallenge, ChallengeDoc } from '../../services/firebaseService';
import { extractIncidentMetadata } from '../../services/dataExtractionService';
import { CertificateModal } from '../../components/CertificateModal';
import { ProposalReviewTab } from '../../components/gov/ProposalReviewTab';
import { ChartKpiCard } from '../../components/charts/ChartKpiCard';
import { StatusDonutChart } from '../../components/charts/StatusDonutChart';
import { PriorityHistogram } from '../../components/charts/PriorityHistogram';
import { DailyTrendLine } from '../../components/charts/DailyTrendLine';
import { DomainBarChart } from '../../components/charts/DomainBarChart';
import { DistrictPriorityMap } from '../../components/charts/DistrictPriorityMap';
import { AIPerformanceCard } from '../../components/charts/AIPerformanceCard';
import { useAnalytics } from '../../hooks/useAnalytics';
import { workflowStore, STORE_EVENT } from '../../services/workflowStore';
import { JHARKHAND_UNIVERSITIES } from '../../services/universityData';
import { ClusterReviewTab } from '../../components/gov/ClusterReviewTab';
import { DeploymentApprovalTab } from '../../components/gov/DeploymentApprovalTab';
import { ClosureTab } from '../../components/gov/ClosureTab';
import { LiveResearchBadge } from '../../components/gov/LiveResearchBadge';
import { PriorityFactorsBreakdown } from '../../components/gov/PriorityFactorsBreakdown';
import { RiskLevelBadge, ResearchVerificationNote } from '../../components/gov/RiskLevelBadge';
import { PortalLoadingState, PortalEmptyState } from '../../components/PortalUIStates';
import { LiveEmergencyAlertBanner } from '../../components/LiveEmergencyAlertBanner';
import { NotificationBellDropdown } from '../../components/notifications/NotificationBellDropdown';
import { InnovationOutcomesTracker } from '../../components/analytics/InnovationOutcomesTracker';
import { CrossPortalMessagingHub } from '../../components/communication/CrossPortalMessagingHub';

type GovTab = 'overview' | 'map' | 'queue' | 'universities' | 'proposals' | 'reports' | 'deployment' | 'closure' | 'clusters' | 'messages' | 'outcomes';

interface HEIData {
  id: string;
  name: string;
  role: string;
  domain: string;
  assigned: number;
  teams: number;
  lead: string;
  email: string;
  phone: string;
  facilities: string;
  badge: string;
  district: string;
}

// ─── Challenge Inspection & Action Modal ──────────────────────────────────────
interface ChallengeDetailModalProps {
  challenge: ChallengeDoc;
  officerName: string;
  onConfirmAction: (type: 'validate' | 'evidence' | 'deploy' | 'reject', note: string) => void;
  onClose: () => void;
}

const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({
  challenge,
  officerName,
  onConfirmAction,
  onClose,
}) => {
  const [selectedAction, setSelectedAction] = useState<'validate' | 'evidence' | 'deploy' | 'reject'>('validate');
  const [officerNote, setOfficerNote] = useState('');

  const isPending = challenge.status === 'Under Review';
  const isDeployable = challenge.status === 'In Progress' || (challenge.stageNumber && challenge.stageNumber >= 11);

  const defaultValidateNote = `Validated by ${officerName}. Ground report & evidence verified. Matched for academic lab assignment.`;
  const defaultEvidenceNote = `Evidence requested by ${officerName}. Citizen requested to provide updated clear photo/video proof with timestamp.`;
  const defaultDeployNote = `Pilot verified by ${officerName}. Field telemetry & Panchayat trial confirmed. Authorized for statewide line department rollout.`;
  const defaultRejectNote = `Rejected by ${officerName}. Does not meet government priority criteria or duplicate report.`;

  const getNotePlaceholder = () => {
    if (selectedAction === 'deploy') return defaultDeployNote;
    if (selectedAction === 'evidence') return defaultEvidenceNote;
    if (selectedAction === 'reject') return defaultRejectNote;
    return defaultValidateNote;
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#E4DDD1] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF8F4] border-b border-[#E4DDD1] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#2C6E49]/10 rounded-xl border border-[#2C6E49]/20 flex items-center justify-center text-[#2C6E49]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#8A7F72] bg-[#EAE4D8] px-2 py-0.5 rounded">
                  {challenge.reportId}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white ${getSeverityBg(challenge.riskLevel)}`}>
                  {challenge.riskLevel || 'STANDARD'} SEVERITY
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusPillClass(challenge.status)}`}>
                  {challenge.status}
                </span>
              </div>
              <h2 className="text-base font-black text-[#201C18] mt-0.5 line-clamp-1">{challenge.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#8A7F72] hover:text-[#201C18] rounded-xl hover:bg-[#EAE4D8] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-[#201C18]">
          
          {/* Grid: Location & Citizen Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-[#8A7F72] uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#C98A2C]" /> Location & District
              </span>
              <p className="font-extrabold text-[#201C18]">
                {[challenge.village, challenge.block, challenge.district].filter(Boolean).join(', ') || challenge.district}
              </p>
              {challenge.locationCoords && (
                <p className="font-mono text-[10px] text-[#6A6155]">
                  Lat: {challenge.locationCoords.lat.toFixed(4)}, Lng: {challenge.locationCoords.lng.toFixed(4)}
                </p>
              )}
            </div>

            <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-[#8A7F72] uppercase flex items-center gap-1">
                <User className="w-3 h-3 text-[#2C6E49]" /> Citizen Reporter
              </span>
              <p className="font-extrabold text-[#201C18]">{(challenge as any).reporterName || 'Citizen Reporter'}</p>
              <p className="text-[10px] text-[#6A6155]">Verification: Spatial GPS Logged</p>
            </div>

            <div className="bg-[#FFF8EC] border border-[#F0D99A] rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-[#C98A2C] uppercase flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#C98A2C]" /> AI Priority Score
              </span>
              <p className="text-base font-black text-[#C98A2C]">
                {challenge.priorityScore !== undefined ? `${challenge.priorityScore.toFixed(1)} / 10` : '7.5 / 10'}
              </p>
              <p className="text-[10px] text-[#8A7F72]">Automated NLP & GIS Impact Rating</p>
            </div>
          </div>

          {/* AI Priority Assessment (8C layout order):
              Risk Badge → Priority Score → 4-Factor Breakdown → Live Research (8A)
              → Confidence + Links (8B) → Verification Message (8C) */}
          <div className="bg-white border border-[#E4DDD1] rounded-xl p-4 space-y-3">
            <h4 className="font-black text-[#201C18] uppercase tracking-wider text-[10px]">AI Priority Assessment</h4>

            {/* 1 · Risk level badge (+ live-data escalation indicator) */}
            <RiskLevelBadge
              riskLevel={challenge.riskLevel}
              research={(challenge as any).research}
              escalatedByWeather={(challenge as any).priority?.triageMetadata?.escalatedByWeather}
              escalatedByRecurringHazard={(challenge as any).priority?.triageMetadata?.escalatedByRecurringHazard}
            />

            {/* 2 · Priority score */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#C98A2C] leading-none">
                {challenge.priorityScore !== undefined ? challenge.priorityScore.toFixed(1) : '7.5'}
              </span>
              <span className="text-[11px] font-bold text-[#8A7F72]">/ 10 · Priority Score</span>
            </div>

            {/* 3 · 4-factor score breakdown */}
            {(challenge as any).priorityFactors && (
              <div className="border-t border-[#EAE4D8] pt-3">
                <PriorityFactorsBreakdown factors={(challenge as any).priorityFactors} />
              </div>
            )}

            {/* 4 + 5 · Live research badge (8A) + confidence meter & evidence links (8B) */}
            {(challenge as any).research && (
              <div className="border-t border-[#EAE4D8] pt-3 space-y-2">
                <span className="text-[10px] font-bold text-[#8A7F72] uppercase tracking-wider">Live Research</span>
                <LiveResearchBadge research={(challenge as any).research} />

                {/* 6 · Verification message */}
                <ResearchVerificationNote research={(challenge as any).research} />
              </div>
            )}
          </div>

          {/* Detailed Problem Description */}
          <div className="bg-white border border-[#E4DDD1] rounded-xl p-4 space-y-2">
            <h4 className="font-black text-[#201C18] uppercase tracking-wider text-[10px]">Problem Statement & Ground Context</h4>
            <p className="text-xs text-[#4A433B] leading-relaxed whitespace-pre-line">
              {challenge.summary || challenge.title}
            </p>
          </div>

          {/* Consolidated Deduplication Callout */}
          {(challenge as any).citizenReportCount && (challenge as any).citizenReportCount > 1 && (
            <div className="bg-amber-50/90 border border-amber-300/80 text-amber-950 p-3.5 rounded-xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0 border border-amber-500/25">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider block text-amber-700">HIGH COMMUNITY CONCERN • DEDUPLICATED & MERGED</span>
                  <p className="text-sm font-black text-amber-950">{(challenge as any).citizenReportCount} Citizens Reported This Incident</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-amber-500/15 text-amber-800 border border-amber-400/40 px-3 py-1.5 rounded-lg uppercase">
                High Urgency
              </span>
            </div>
          )}

          {/* AI Triage & Reasoning */}
          {challenge.aiReasoning && (
            <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4 space-y-1.5">
              <span className="text-[10px] font-bold text-[#2C6E49] uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2C6E49]" /> AI Automated Risk Audit
              </span>
              <p className="text-xs text-[#5A5247] leading-relaxed">{challenge.aiReasoning}</p>
            </div>
          )}

          {/* Visual Evidence / Photos */}
          <div className="space-y-2">
            <h4 className="font-black text-[#201C18] uppercase tracking-wider text-[10px]">Citizen Uploaded Visual Evidence</h4>
            {(challenge.evidenceUrl || (challenge.evidenceUrls && challenge.evidenceUrls[0])) ? (
              <div className="rounded-xl overflow-hidden border border-[#E4DDD1] bg-black/5 max-h-64 flex items-center justify-center">
                <img 
                  src={challenge.evidenceUrl || challenge.evidenceUrls![0]} 
                  alt="Ground Evidence" 
                  className="max-h-64 w-full object-cover" 
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
            ) : (
              <div className="bg-[#FAF8F4] border border-dashed border-[#E4DDD1] rounded-xl p-6 text-center space-y-1">
                <FileText className="w-8 h-8 text-[#8A7F72] mx-auto mb-1" />
                <p className="font-bold text-[#4A433B]">Standard Citizen Hazard Report</p>
                <p className="text-[11px] text-[#8A7F72]">GPS coordinates & spatial density log verified by Panchayat Cell.</p>
              </div>
            )}
          </div>

          {/* Stage 4: Extracted On-Ground Proof & Audit Metadata */}
          {(() => {
            const extractedMeta = (challenge as any).extractedMetadata || extractIncidentMetadata({
              reportId: challenge.reportId || challenge.id || 'INCIDENT',
              title: challenge.title || 'Civic Community Issue',
              description: challenge.summary || '',
              category: challenge.category,
              district: challenge.district || 'Ranchi',
              block: challenge.block,
              village: challenge.village,
              locationCoords: challenge.locationCoords,
              formattedAddress: challenge.formattedAddress,
              customDate: challenge.createdAt ? new Date(challenge.createdAt) : undefined,
            });

            return (
              <div className="bg-white border border-[#E4DDD1] rounded-xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E4DDD1]/70 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                      4
                    </span>
                    <span className="font-extrabold text-[#201C18] text-xs">Stage 4: Extracted On-Ground Proof & Audit Record</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified Geotag</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#FAF8F4] p-2.5 rounded-lg border border-[#E4DDD1]/80 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Captured Timestamp</span>
                    <p className="font-extrabold text-[#201C18] text-[11px]">{extractedMeta.formattedDate}, {extractedMeta.formattedTime}</p>
                    <span className="text-[9px] text-slate-500 font-medium">Season: {extractedMeta.season} ({extractedMeta.timeOfDay})</span>
                  </div>

                  <div className="bg-[#FAF8F4] p-2.5 rounded-lg border border-[#E4DDD1]/80 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">GPS Coordinates</span>
                    <p className="font-mono font-extrabold text-[#201C18] text-[11px]">{extractedMeta.gpsCoordinates.lat}°N, {extractedMeta.gpsCoordinates.lng}°E</p>
                    <a
                      href={`https://maps.google.com/?q=${extractedMeta.gpsCoordinates.lat},${extractedMeta.gpsCoordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Sat-Map View</span>
                    </a>
                  </div>
                </div>

                <div className="bg-[#FAF8F4] p-2 rounded-lg border border-[#E4DDD1]/80 flex items-center justify-between text-[10px]">
                  <span className="font-mono font-bold text-slate-600">Audit Hash: <span className="text-slate-900">{extractedMeta.evidenceProofHash}</span></span>
                  <span className="text-slate-500 font-medium">{extractedMeta.captureSource}</span>
                </div>

                {extractedMeta.detectedFeatures && extractedMeta.detectedFeatures.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Extracted Visual Features:</span>
                    <div className="flex flex-wrap gap-1">
                      {extractedMeta.detectedFeatures.map((f: string, idx: number) => (
                        <span key={idx} className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Existing Officer Notes */}
          {challenge.govtOfficerNote && (
            <div className="bg-[#FFF8EC] border border-[#F0D99A] rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-[#C98A2C] uppercase flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-[#C98A2C]" /> Previous Officer Log
              </span>
              <p className="text-xs text-[#4A433B]">{challenge.govtOfficerNote}</p>
            </div>
          )}

          {/* Decision Form Section */}
          <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl p-5 space-y-4">
            <h4 className="font-black text-[#201C18] uppercase tracking-wider text-[11px] border-b border-[#E4DDD1] pb-2">
              Government Officer Verification Action
            </h4>

            {/* Action Select Tabs */}
            <div className="flex gap-2">
              {isPending && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedAction('validate')}
                    className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedAction === 'validate'
                        ? 'bg-[#2C6E49] text-white shadow-sm'
                        : 'bg-white border border-[#E4DDD1] text-[#4A433B] hover:bg-[#EAE4D8]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Validate & Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAction('evidence')}
                    className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedAction === 'evidence'
                        ? 'bg-[#C98A2C] text-white shadow-sm'
                        : 'bg-white border border-[#E4DDD1] text-[#4A433B] hover:bg-[#EAE4D8]'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Request Evidence
                  </button>
                </>
              )}

              {isDeployable && (
                <button
                  type="button"
                  onClick={() => setSelectedAction('deploy')}
                  className={`w-full py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedAction === 'deploy'
                      ? 'bg-[#2C6E49] text-white shadow-sm'
                      : 'bg-white border border-[#E4DDD1] text-[#4A433B] hover:bg-[#EAE4D8]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authorize Statewide Deployment
                </button>
              )}
            </div>

            {/* Audit Note */}
            <div>
              <label className="text-[10px] font-bold text-[#6A6155] uppercase tracking-wider block mb-1">
                Official Audit & Directive Note:
              </label>
              <textarea
                className="w-full border border-[#E4DDD1] rounded-xl px-3 py-2.5 text-xs text-[#201C18] bg-white focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30 resize-none"
                rows={3}
                placeholder={getNotePlaceholder()}
                value={officerNote}
                onChange={e => setOfficerNote(e.target.value)}
              />
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF8F4] border-t border-[#E4DDD1] flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#4A433B] bg-[#EAE4D8] hover:bg-[#DFD8CA] border border-[#E4DDD1] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmAction(selectedAction, officerNote.trim() || getNotePlaceholder());
              onClose();
            }}
            className="px-6 py-2 text-xs font-extrabold text-white bg-[#2C6E49] hover:bg-[#23583a] rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Record Directive</span>
          </button>
        </div>

      </div>
    </div>
  );
};

// ─── HEI Detail Modal ─────────────────────────────────────────────────────────
interface HEIDetailModalProps {
  hei: HEIData;
  challenges: ChallengeDoc[];
  onClose: () => void;
}

const HEIDetailModal: React.FC<HEIDetailModalProps> = ({ hei, challenges, onClose }) => {
  const assignedChallenges = challenges.filter(c => c.assignedHEI === hei.name || c.district === hei.district);

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#E4DDD1] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF8F4] border-b border-[#E4DDD1] flex items-start justify-between shrink-0">
          <div>
            <span className="text-[10px] font-extrabold text-[#C98A2C] bg-[#FFF8EC] border border-[#F0D99A] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {hei.badge}
            </span>
            <h2 className="text-xl font-black text-[#201C18] mt-1 font-heading">{hei.name}</h2>
            <p className="text-xs text-[#6A6155] mt-0.5">{hei.role}</p>
          </div>
          <button onClick={onClose} className="p-2 text-[#8A7F72] hover:text-[#201C18] rounded-xl hover:bg-[#EAE4D8]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-[#201C18]">
          
          {/* Key Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3">
              <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">Faculty Nodal Lead</span>
              <p className="font-extrabold text-[#201C18] mt-0.5">{hei.lead}</p>
            </div>

            <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3">
              <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">Direct Contact</span>
              <p className="font-mono text-[#2C6E49] font-bold mt-0.5 truncate">{hei.email}</p>
              <p className="font-mono text-[#6A6155] text-[10px]">{hei.phone}</p>
            </div>

            <div className="bg-[#F0FAF4] border border-[#C3E6D0] rounded-xl p-3 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-[#2C6E49] uppercase block">R&D Capacity</span>
              <p className="text-base font-black text-[#2C6E49]">{hei.teams} Active Student Teams</p>
              <p className="text-[10px] text-[#6A6155]">{hei.assigned} Active Projects</p>
            </div>
          </div>

          {/* Domain Specialization & Facilities */}
          <div className="space-y-3">
            <div className="bg-white border border-[#E4DDD1] rounded-xl p-4 space-y-1">
              <h4 className="font-black text-[#201C18] uppercase tracking-wider text-[10px]">Hazard Domain Focus</h4>
              <p className="text-xs text-[#4A433B] font-semibold">{hei.domain}</p>
            </div>

            <div className="bg-white border border-[#E4DDD1] rounded-xl p-4 space-y-1">
              <h4 className="font-black text-[#201C18] uppercase tracking-wider text-[10px]">Specialized Lab Equipment & Testbeds</h4>
              <p className="text-xs text-[#6A6155] leading-relaxed">{hei.facilities}</p>
            </div>
          </div>

          {/* Allocated Challenges List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-2">
              <h4 className="font-black text-[#201C18] uppercase tracking-wider text-[10px]">
                Active Allocated R&D Projects ({assignedChallenges.length})
              </h4>
              <span className="text-[10px] font-bold text-[#2C6E49]">Live State Synchronization</span>
            </div>

            {assignedChallenges.length === 0 ? (
              <p className="text-center text-[#8A7F72] py-4 bg-[#FAF8F4] rounded-xl border border-[#E4DDD1]">
                No challenges currently allocated to this institute.
              </p>
            ) : (
              <div className="space-y-2">
                {assignedChallenges.slice(0, 5).map(ch => (
                  <div key={ch.id || ch.reportId} className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-[#201C18] truncate">{ch.title}</p>
                      <p className="text-[10px] text-[#8A7F72] font-mono">{ch.reportId} · {ch.district}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${getStatusPillClass(ch.status)}`}>
                      {ch.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF8F4] border-t border-[#E4DDD1] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#2C6E49] hover:bg-[#23583a] rounded-xl transition-colors cursor-pointer"
          >
            Close HEI Profile
          </button>
        </div>

      </div>
    </div>
  );
};

// ─── Main Portal Component ───────────────────────────────────────────────────
export const GovPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<GovTab>('overview');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);
  // Modals state
  const [inspectModalChallenge, setInspectModalChallenge] = useState<ChallengeDoc | null>(null);
  const [selectedHEIModal, setSelectedHEIModal] = useState<HEIData | null>(null);
  const [certificateModal, setCertificateModal] = useState<{ isOpen: boolean; challenge: ChallengeDoc | null }>({
    isOpen: false,
    challenge: null,
  });

  // Priority override editor state
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null);
  const [priorityEditValue, setPriorityEditValue] = useState<string>('');

  const { challenges, totalCount, criticalCount, validatedCount, resolvedCount, loading } = useMapData();
  const { data: analyticsData } = useAnalytics();

  // Live workflow store data for Impact KPIs tab
  const [wfChallenges, setWfChallenges] = useState(workflowStore.getChallenges());

  React.useEffect(() => {
    const handler = () => setWfChallenges(workflowStore.getChallenges());
    window.addEventListener(STORE_EVENT, handler);
    return () => window.removeEventListener(STORE_EVENT, handler);
  }, []);

  const officerName = currentUser?.displayName || 'Government Officer';

  // ── Live computed stats from workflowStore ──────────────────────────────────────
  const districtStats = useMemo(() => {
    const wf = workflowStore.getChallenges();
    const byDistrict = new Map<string, { total: number; risks: string[]; hei: string }>();
    wf.forEach(c => {
      const d = c.district || 'Unknown';
      const existing = byDistrict.get(d) || { total: 0, risks: [], hei: '' };
      existing.total += 1;
      if (c.riskLevel) existing.risks.push(c.riskLevel);
      if (c.assignedHEI && !existing.hei) existing.hei = c.assignedHEI;
      byDistrict.set(d, existing);
    });
    return Array.from(byDistrict.entries())
      .map(([district, data]) => ({
        district,
        total: data.total,
        maxRisk: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].find(r => data.risks.includes(r)) || 'STD',
        hei: data.hei || '',
      }))
      .sort((a, b) => b.total - a.total);
  }, [wfChallenges]);

  const hazardBreakdown = useMemo(() => {
    const wf = workflowStore.getChallenges();
    const total = wf.length || 1;
    const byCategory = new Map<string, number>();
    wf.forEach(c => {
      const cat = c.category || 'Other';
      byCategory.set(cat, (byCategory.get(cat) || 0) + 1);
    });
    return Array.from(byCategory.entries())
      .map(([domain, count]) => ({
        domain,
        count: `${Math.round((count / total) * 100)}%`,
        value: count / total,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [wfChallenges]);

  const showToast = (text: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmInspectionAction = async (type: 'validate' | 'evidence' | 'deploy' | 'reject', note: string) => {
    if (!inspectModalChallenge) return;
    const ch = inspectModalChallenge;
    const id = ch.id || ch.reportId;
    setInspectModalChallenge(null);

    if (type === 'deploy') {
      const succeeded = await govVerifyAndDeployChallenge(id, note, officerName);
      showToast(
        succeeded
          ? `✓ "${ch.title}" authorized for statewide deployment! Status updated to Resolved.`
          : `Unable to authorize deployment for "${ch.title}".`,
        succeeded ? 'success' : 'warning'
      );
    } else if (type === 'validate') {
      const succeeded = await govValidateChallenge(id, note, officerName);
      showToast(
        succeeded
          ? `✓ "${ch.title}" validated & queued for HEI capability matching.`
          : `Unable to validate "${ch.title}".`,
        succeeded ? 'success' : 'warning'
      );
    } else if (type === 'reject') {
      const succeeded = await govRejectChallenge(id, note, officerName);
      showToast(
        succeeded
          ? `✗ "${ch.title}" rejected and removed from queue.`
          : `Unable to reject "${ch.title}". Please try again.`,
        succeeded ? 'warning' : 'warning'
      );
    } else {
      const succeeded = await govRequestEvidence(id, note, officerName);
      showToast(
        succeeded
          ? `⚠ Additional evidence requested for "${ch.title}". Citizen notified.`
          : `Unable to request evidence for "${ch.title}".`,
        'warning'
      );
    }
  };

  const handleExportStateReport = () => {
    showToast('✓ Official Jharkhand State Hazard Analytics Report (PDF) downloaded to your system.', 'success');
  };

  const tabs: { id: GovTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',     label: 'Overview',              icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'map',          label: 'State Map',             icon: <MapIcon className="w-3.5 h-3.5" /> },
    { id: 'queue',        label: 'Challenge Queue',       icon: <ListFilter className="w-3.5 h-3.5" /> },
    { id: 'clusters',     label: 'Cluster Review',        icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'universities', label: 'HEI Allocations',       icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'proposals',    label: 'Proposal Review',       icon: <FileCheck className="w-3.5 h-3.5" /> },
    { id: 'deployment',   label: 'Deployment Approval',   icon: <Rocket className="w-3.5 h-3.5" /> },
    { id: 'outcomes',     label: 'Innovation & IP',       icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'messages',     label: 'Stakeholder Comms',     icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'reports',      label: 'Impact KPIs',           icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'closure',      label: 'Closure',               icon: <Archive className="w-3.5 h-3.5" /> },
  ];

  const pendingCount = challenges.filter(c => c.status === 'Under Review').length;
  const evidenceNeededCount = challenges.filter(c => c.needsHumanVerification).length;

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#201C18] flex flex-col font-sans">

      {/* Real-time Emergency Disaster Alert Banner */}
      <LiveEmergencyAlertBanner />

      {/* ── Inspection / Decision Modal ── */}
      {inspectModalChallenge && (
        <ChallengeDetailModal
          challenge={inspectModalChallenge}
          officerName={officerName}
          onConfirmAction={handleConfirmInspectionAction}
          onClose={() => setInspectModalChallenge(null)}
        />
      )}

      {/* ── HEI Detail Modal ── */}
      {selectedHEIModal && (
        <HEIDetailModal
          hei={selectedHEIModal}
          challenges={challenges}
          onClose={() => setSelectedHEIModal(null)}
        />
      )}

      {/* ── Certificate Generator Modal ── */}
      {certificateModal.isOpen && certificateModal.challenge && (
        <CertificateModal
          isOpen={certificateModal.isOpen}
          onClose={() => setCertificateModal({ isOpen: false, challenge: null })}
          recipientName={certificateModal.challenge.assignedHEI || `${certificateModal.challenge.district} Innovation Team`}
          institutionName={certificateModal.challenge.assignedHEI || `Government of Jharkhand · ${certificateModal.challenge.district}`}
          projectTitle={certificateModal.challenge.title}
          voucherCode={`JH-GOV-${certificateModal.challenge.reportId || 'CERT-2026'}`}
          role="Societal Challenge Innovator & Lead Researcher"
        />
      )}

      {/* ── Top Navbar ── */}
      <header className="bg-[#FAF8F4] text-[#201C18] border-b border-[#E4DDD1] shadow-2xs px-4 sm:px-6 py-2.5 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

          <div className="flex items-center space-x-2 shrink-0">
            <img src="/logo.png" alt="NIVAARAN" className="h-8 w-auto object-contain shrink-0" />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black text-[#201C18] tracking-tight leading-none">NIVAARAN</span>
                <span className="text-[10px] font-extrabold bg-[#EAE4D8] text-[#C98A2C] px-2 py-0.5 rounded-full border border-[#E4DDD1]">
                  Gov Portal
                </span>
              </div>
              <p className="text-[10px] text-[#5A5247] font-semibold">Dept of Higher & Technical Education, Jharkhand</p>
            </div>
          </div>

          {/* Live KPI strip */}
          <div className="hidden md:flex items-center gap-4">
            {[
              { label: 'Total', value: totalCount, color: 'text-[#201C18]' },
              { label: 'Critical', value: criticalCount, color: 'text-[#B3261E]' },
              { label: 'Pending Review', value: pendingCount, color: 'text-[#C98A2C]' },
              { label: 'Validated', value: validatedCount, color: 'text-[#2C6E49]' },
              { label: 'Resolved', value: resolvedCount, color: 'text-[#6A6155]' },
            ].map((kpi, i, arr) => (
              <React.Fragment key={kpi.label}>
                <div className="text-center">
                  <p className={`text-base font-black ${kpi.color}`}>{loading ? '…' : kpi.value}</p>
                  <p className="text-[9px] uppercase text-[#8A7F72] font-semibold">{kpi.label}</p>
                </div>
                {i < arr.length - 1 && <div className="h-5 w-px bg-[#E4DDD1]" />}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {evidenceNeededCount > 0 && (
              <span className="text-[10px] font-bold text-[#C98A2C] bg-[#FFF8EC] border border-[#F0D99A] px-2 py-1 rounded-lg">
                {evidenceNeededCount} awaiting evidence
              </span>
            )}
            <NotificationBellDropdown userRole="gov" userDistrict="Ranchi" />
            <span className="text-[10px] text-[#5A5247] font-semibold hidden sm:block">{officerName}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-[11px] font-extrabold text-white bg-[#B5502D] hover:bg-[#9c4323] px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto flex items-center gap-1 border-t border-[#E4DDD1] pt-2 mt-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#2C6E49] text-white'
                  : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.id === 'queue' && pendingCount > 0 && (
                <span className="ml-1 bg-[#B3261E] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ── Tab Content ── */}
      <main className="flex-1 flex flex-col min-h-0">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">

            {/* Command Header */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-extrabold text-[#2C6E49] bg-[#2C6E49]/10 px-2.5 py-0.5 rounded-full border border-[#2C6E49]/25 uppercase tracking-wider">
                      State Disaster & Innovation Command
                    </span>
                    <span className="text-[11px] font-bold text-[#8A7F72] hidden sm:inline">·</span>
                    <span className="text-[11px] font-bold text-[#5A5247] hidden sm:inline">Govt of Jharkhand</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-heading text-[#201C18]">
                    Societal Challenge & Disaster Response Hub
                  </h2>
                  <p className="text-xs text-[#6A6155] max-w-2xl leading-relaxed">
                    Live multi-district operational telemetry, automated AI triage verification, and inter-university R&D assignment ledger for 24 Jharkhand districts.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={handleExportStateReport}
                    className="bg-[#2C6E49] text-white hover:bg-[#23583a] border border-[#2C6E49] rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download State Summary Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E4DDD1] rounded-xl p-5 shadow-2xs space-y-1">
                <p className="text-[10px] font-bold text-[#8A7F72] uppercase tracking-wider">Total Challenges</p>
                <p className="text-3xl font-black text-[#201C18] font-heading">{loading ? '…' : totalCount}</p>
                <p className="text-[11px] text-[#6A6155]">Across 24 districts</p>
              </div>

              <div className="bg-[#FFF0EE] border border-[#F5C6C0] rounded-xl p-5 shadow-2xs space-y-1">
                <p className="text-[10px] font-bold text-[#B3261E] uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#B3261E]" /> Critical Alerts
                </p>
                <p className="text-3xl font-black text-[#B3261E] font-heading">{loading ? '…' : criticalCount}</p>
                <p className="text-[11px] text-[#8A7F72]">Immediate triage required</p>
              </div>

              <div className="bg-[#FFF8EC] border border-[#F0D99A] rounded-xl p-5 shadow-2xs space-y-1">
                <p className="text-[10px] font-bold text-[#C98A2C] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#C98A2C]" /> Pending Review
                </p>
                <p className="text-3xl font-black text-[#C98A2C] font-heading">{loading ? '…' : pendingCount}</p>
                <p className="text-[11px] text-[#8A7F72]">Awaiting officer validation</p>
              </div>

              <div className="bg-[#F0FAF4] border border-[#C3E6D0] rounded-xl p-5 shadow-2xs space-y-1">
                <p className="text-[10px] font-bold text-[#2C6E49] uppercase tracking-wider flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-[#2C6E49]" /> Validated
                </p>
                <p className="text-3xl font-black text-[#2C6E49] font-heading">{loading ? '…' : validatedCount}</p>
                <p className="text-[11px] text-[#8A7F72]">Queued for HEI matching</p>
              </div>
            </div>

            {/* Aggregate Social Impact and CSR Investment Ledger */}
            <div className="bg-gradient-to-r from-[#F0FAF4] via-white to-[#FFF8EC] border border-[#C3E6D0] rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DDD1] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-[#2C6E49] text-white rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-[#201C18]">Aggregate Social Impact and CSR Investment</h3>
                    <p className="text-[11px] text-[#6A6155]">Cross project outcomes verified across rural panchayats and municipal wards</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold bg-[#2C6E49]/10 text-[#2C6E49] px-2.5 py-1 rounded-full border border-[#2C6E49]/20">
                    Schedule VII Compliant
                  </span>
                  <span className="text-[10px] font-extrabold bg-[#C98A2C]/10 text-[#C98A2C] px-2.5 py-1 rounded-full border border-[#C98A2C]/20">
                    Audit Certified
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/80 backdrop-blur-xs border border-[#E4DDD1] rounded-xl p-3.5">
                  <p className="text-[10px] font-bold text-[#8A7F72] uppercase tracking-wider">Citizens Benefited</p>
                  <p className="text-2xl font-black text-[#2C6E49] font-heading mt-0.5">142,500+</p>
                  <p className="text-[10px] text-[#5A5247] mt-0.5">Across 82 rural panchayats</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xs border border-[#E4DDD1] rounded-xl p-3.5">
                  <p className="text-[10px] font-bold text-[#8A7F72] uppercase tracking-wider">Public Funds Saved</p>
                  <p className="text-2xl font-black text-[#201C18] font-heading mt-0.5">₹4.85 Cr</p>
                  <p className="text-[10px] text-[#2C6E49] font-semibold mt-0.5">Cost avoidance via indigenous R&D</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xs border border-[#E4DDD1] rounded-xl p-3.5">
                  <p className="text-[10px] font-bold text-[#8A7F72] uppercase tracking-wider">Active Sensor Telemetry</p>
                  <p className="text-2xl font-black text-[#C98A2C] font-heading mt-0.5">82 Nodes</p>
                  <p className="text-[10px] text-[#5A5247] mt-0.5">Live river water and air sensors</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xs border border-[#E4DDD1] rounded-xl p-3.5">
                  <p className="text-[10px] font-bold text-[#8A7F72] uppercase tracking-wider">Committed CSR Funds</p>
                  <p className="text-2xl font-black text-[#B5502D] font-heading mt-0.5">₹1.85 Cr</p>
                  <p className="text-[10px] text-[#5A5247] mt-0.5">12 corporate partners committed</p>
                </div>
              </div>

              {/* Corporate Partner Strip */}
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5A5247]">
                <div className="flex items-center space-x-2">
                  <Handshake className="w-4 h-4 text-[#2C6E49] shrink-0" />
                  <span className="font-bold text-[#201C18]">Key Corporate and Industry Partners:</span>
                  <span className="text-[#6A6155]">Tata Steel Foundation, Coal India CSR, Adani Green Energy, NTPC Vidyut, Usha Martin</span>
                </div>
                <button
                  onClick={() => setActiveTab('outcomes')}
                  className="text-[11px] font-black text-[#2C6E49] hover:underline cursor-pointer flex items-center gap-1"
                >
                  View Innovation and IP Outcomes Registry →
                </button>
              </div>
            </div>

            {/* Main Command Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6">

                {/* Triage Queue */}
                <div className="bg-white border border-[#E4DDD1] rounded-2xl shadow-2xs overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EBE0] bg-[#FAF8F4]">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-[#C98A2C]" />
                      <h3 className="text-sm font-extrabold text-[#201C18]">Urgent Triage & Validation Queue</h3>
                      {pendingCount > 0 && (
                        <span className="text-[10px] font-black text-white bg-[#B3261E] px-2 py-0.5 rounded-full">{pendingCount}</span>
                      )}
                    </div>
                    <button
                      onClick={() => setActiveTab('queue')}
                      className="text-xs font-extrabold text-[#2C6E49] hover:text-[#23583a] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      View All in Queue <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {loading ? (
                    <div className="px-5 py-8 text-center text-[#8A7F72] text-xs">Loading live challenges…</div>
                  ) : challenges.filter(c => c.status === 'Under Review').length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <CheckCircle2 className="w-6 h-6 text-[#2C6E49] mx-auto mb-2" />
                      <p className="text-sm font-bold text-[#4A433B]">All clear — no challenges pending review.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F0EBE0]">
                      {challenges.filter(c => c.status === 'Under Review').slice(0, 4).map(ch => {
                        return (
                          <div key={ch.id || ch.reportId} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF8F4] transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              {(ch.evidenceUrl || (ch.evidenceUrls && ch.evidenceUrls[0])) && (
                                <img
                                  src={ch.evidenceUrl || (ch.evidenceUrls && ch.evidenceUrls[0])}
                                  alt={ch.title}
                                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                  className="w-11 h-11 rounded-lg object-cover border border-[#E4DDD1] shrink-0 shadow-2xs"
                                />
                              )}
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getSeverityBg(ch.riskLevel)}`} />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#201C18] truncate">{ch.title}</p>
                                <p className="text-[11px] text-[#8A7F72]">{ch.district} · {ch.reportId}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => setInspectModalChallenge(ch)}
                                className="text-[11px] font-extrabold text-white bg-[#2C6E49] hover:bg-[#23583a] px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" /> Inspect & Validate
                              </button>
                              <button
                                onClick={() => setInspectModalChallenge(ch)}
                                className="text-[11px] font-extrabold text-[#B91C1C] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* District Table */}
                <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#201C18]">District Hotspots & HEI Allocation Status</h3>
                      <p className="text-[11px] text-[#8A7F72]">Click any district row to view on interactive GIS map</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('map')}
                      className="text-xs font-bold text-[#2C6E49] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Open Map <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[#E4DDD1] text-[#8A7F72] font-bold bg-[#FAF8F4]">
                        <tr>
                          <th className="py-2.5 px-3">District</th>
                          <th className="py-2.5 px-3">Active Reports</th>
                          <th className="py-2.5 px-3">Highest Risk</th>
                          <th className="py-2.5 px-3">Assigned HEI Lab</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EBE0] text-[#4A433B]">
                        {districtStats.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-0">
                              <PortalEmptyState
                                title="No district data available yet"
                                description="Once challenges are submitted, they will appear here."
                              />
                            </td>
                          </tr>
                        ) : (
                          districtStats.map((d) => (
                            <tr 
                              key={d.district} 
                              onClick={() => setActiveTab('map')}
                              className="hover:bg-[#FAF8F4] transition-colors cursor-pointer"
                            >
                              <td className="py-2.5 px-3 font-bold text-[#201C18] flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-[#C98A2C]" />
                                <span>{d.district}</span>
                              </td>
                              <td className="py-2.5 px-3 font-bold">{d.total}</td>
                              <td className="py-2.5 px-3">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getSeverityBg(d.maxRisk)} text-white`}>
                                  {d.maxRisk || 'STD'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-[#2C6E49]">{d.hei || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 space-y-6">

                {/* 1. Category & Hazard Domain Breakdown (live from workflowStore) */}
                <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0EBE0] pb-3">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-[#2C6E49]" />
                      <h3 className="text-sm font-extrabold text-[#201C18]">Hazard Domain Breakdown</h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#8A7F72]">
                      {hazardBreakdown.length} Active Domains
                    </span>
                  </div>

                  <div className="space-y-3">
                    {hazardBreakdown.length === 0 ? (
                      <PortalEmptyState
                        title="No category data yet"
                        description="Challenges will populate this when submitted."
                      />
                    ) : (
                      hazardBreakdown.map((item, idx) => (
                        <div key={`${item.domain}-${idx}`} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#201C18] text-[11px] truncate">{item.domain}</span>
                            <span className="font-mono font-extrabold text-[#8A7F72]">{item.count}</span>
                          </div>
                          <div className="w-full bg-[#FAF8F4] border border-[#E4DDD1] h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                idx === 0 ? 'bg-[#2C6E49]' :
                                idx === 1 ? 'bg-[#C98A2C]' :
                                idx === 2 ? 'bg-[#B5502D]' :
                                idx === 3 ? 'bg-blue-600' : 'bg-purple-600'
                              }`}
                              style={{ width: `${item.value * 100}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* HEI Cards Quick Access */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('map')}
                    className="p-4 bg-white border border-[#E4DDD1] hover:border-[#2C6E49] rounded-xl text-left transition-all group cursor-pointer shadow-2xs space-y-1.5"
                  >
                    <MapIcon className="w-5 h-5 text-[#2C6E49]" />
                    <p className="text-xs font-black text-[#201C18] group-hover:text-[#2C6E49]">GIS Map</p>
                    <p className="text-[10px] text-[#8A7F72]">24 Districts Hotspots</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('universities')}
                    className="p-4 bg-white border border-[#E4DDD1] hover:border-[#C98A2C] rounded-xl text-left transition-all group cursor-pointer shadow-2xs space-y-1.5"
                  >
                    <Building2 className="w-5 h-5 text-[#C98A2C]" />
                    <p className="text-xs font-black text-[#201C18] group-hover:text-[#C98A2C]">HEI Matrix</p>
                    <p className="text-[10px] text-[#8A7F72]">BIT · IIT · NIT Teams</p>
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* HEI ALLOCATIONS TAB */}
        {activeTab === 'universities' && (() => {
          const liveUniCount = JHARKHAND_UNIVERSITIES.length;
          const liveDeptCount = JHARKHAND_UNIVERSITIES.reduce((sum, u) => sum + (u.departments?.length ?? 0), 0);
          return (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs">
              <div>
                <span className="text-[11px] font-extrabold text-[#C98A2C] bg-[#C98A2C]/10 px-2.5 py-0.5 rounded-full border border-[#C98A2C]/25 uppercase tracking-wider">
                  Academic Innovation Network
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-heading text-[#201C18] mt-1">
                  Partner Universities & Specialized R&D Hubs
                </h2>
                <p className="text-xs text-[#6A6155] mt-0.5">
                  Click any institute card to view active student R&D teams, faculty leads, and assigned ground projects.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-[#FAF8F4] border border-[#E4DDD1] px-3.5 py-2 rounded-xl text-right">
                  <p className="text-[10px] font-bold text-[#8A7F72] uppercase">Partner HEIs</p>
                  <p className="text-sm font-extrabold text-[#201C18]">{liveUniCount} Institutions</p>
                </div>
                <div className="bg-[#FAF8F4] border border-[#E4DDD1] px-3.5 py-2 rounded-xl text-right">
                  <p className="text-[10px] font-bold text-[#8A7F72] uppercase">R&D Labs</p>
                  <p className="text-sm font-extrabold text-[#2C6E49]">{liveDeptCount}+ Connected</p>
                </div>
              </div>
            </div>

            {/* University Cards Grid — driven by JHARKHAND_UNIVERSITIES + live project counts */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {JHARKHAND_UNIVERSITIES.slice(0, 6).map((uni) => {
                const uniProjects = workflowStore.getProjects().filter(
                  p => p.universityId === uni.id
                );
                const activeProjects = uniProjects.filter(p =>
                  !['Completed', 'Cancelled'].includes(p.status || '')
                ).length;
                const teamCount = uni.departments?.length ?? 0;
                const primaryDept = uni.departments?.[0] ?? 'R&D';
                const role = `${primaryDept} Research & Innovation Centre`;
                const badge = uni.type === 'Central University' ? 'Premier R&D Lab'
                  : uni.type === 'National Institute' || uni.type === 'Institute of National Importance' ? 'Technical Node'
                  : uni.type === 'State University' ? 'State R&D Cell'
                  : 'HEI Partner';

                const heiItem: HEIData = {
                  id: uni.id,
                  name: uni.name,
                  role,
                  domain: uni.departments?.slice(0, 3).join(', ') ?? 'R&D',
                  assigned: activeProjects,
                  teams: teamCount,
                  lead: 'Dr. Nodal Officer',
                  email: `contact@${uni.id}.ac.in`,
                  phone: '+91 651 220 0000',
                  facilities: 'IoT Lab, Ground Telemetry, Testing Beds',
                  badge,
                  district: uni.district
                };

                return (
                  <div 
                    key={uni.id} 
                    onClick={() => setSelectedHEIModal(heiItem)}
                    className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4 hover:border-[#2C6E49] hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-[#FAF8F4] pb-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-extrabold text-[#C98A2C] bg-[#FFF8EC] border border-[#F0D99A] px-2 py-0.5 rounded-full">
                          {badge}
                        </span>
                        <h3 className="text-base font-extrabold text-[#201C18] font-heading mt-1 group-hover:text-[#2C6E49] transition-colors">{uni.name}</h3>
                        <p className="text-[11px] text-[#8A7F72]">{role}</p>
                      </div>
                      <Building2 className="w-5 h-5 text-[#2C6E49] shrink-0 mt-1" />
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">Departments:</span>
                        <p className="text-[#201C18] font-semibold">{uni.departments?.slice(0, 3).join(', ') ?? '—'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">District:</span>
                        <p className="text-[#4A433B]">{uni.district}, Jharkhand</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F0EBE0] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2C6E49]">{activeProjects} Active Projects</span>
                      <span className="text-[#8A7F72] font-mono group-hover:text-[#201C18] font-bold">View Details →</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Per HEI Analytics and Performance Leaderboard */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EBE0] pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-[#2C6E49]" />
                    <h3 className="text-base font-extrabold text-[#201C18]">State HEI Performance and Intake Analytics Leaderboard</h3>
                  </div>
                  <p className="text-xs text-[#6A6155] mt-0.5">
                    Official comparative ranking based on civic challenge acceptance velocity, prototype delivery, and verified citizen impact ratings.
                  </p>
                </div>
                <span className="text-[10px] font-extrabold bg-[#2C6E49]/10 text-[#2C6E49] px-2.5 py-1 rounded-full border border-[#2C6E49]/20 self-start sm:self-auto">
                  Updated Live for 2026 Academic Cycle
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4DDD1] bg-[#FAF8F4] text-[#8A7F72] text-[10px] font-extrabold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Rank and Institution</th>
                      <th className="py-2.5 px-3">District Node</th>
                      <th className="py-2.5 px-3 text-center">Matched Intake</th>
                      <th className="py-2.5 px-3 text-center">Accepted</th>
                      <th className="py-2.5 px-3 text-center">Acceptance Rate</th>
                      <th className="py-2.5 px-3 text-center">Deployments</th>
                      <th className="py-2.5 px-3 text-center">Impact Score</th>
                      <th className="py-2.5 px-3">Nodal Faculty Lead</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE0] text-[#201C18]">
                    {[
                      {
                        rank: '1',
                        name: 'Birla Institute of Technology (BIT) Mesra',
                        type: 'Institute of National Importance',
                        district: 'Ranchi',
                        matched: 14,
                        accepted: 12,
                        rate: '85.7%',
                        deployed: 4,
                        score: '4.9 / 5.0',
                        lead: 'Dr. A. K. Sinha (Civil and Environmental Engineering)',
                        badgeColor: 'bg-amber-100 text-amber-800'
                      },
                      {
                        rank: '2',
                        name: 'Indian Institute of Technology (IIT ISM) Dhanbad',
                        type: 'Institute of National Importance',
                        district: 'Dhanbad',
                        matched: 12,
                        accepted: 11,
                        rate: '91.6%',
                        deployed: 5,
                        score: '4.9 / 5.0',
                        lead: 'Prof. R. N. Mukherjee (Mining and Geo Informatics)',
                        badgeColor: 'bg-emerald-100 text-emerald-800'
                      },
                      {
                        rank: '3',
                        name: 'National Institute of Technology (NIT) Jamshedpur',
                        type: 'National Institute',
                        district: 'East Singhbhum',
                        matched: 10,
                        accepted: 8,
                        rate: '80.0%',
                        deployed: 3,
                        score: '4.7 / 5.0',
                        lead: 'Dr. S. K. Mahato (Electronics and IoT Lab)',
                        badgeColor: 'bg-blue-100 text-blue-800'
                      },
                      {
                        rank: '4',
                        name: 'Birsa Agricultural University (BAU)',
                        type: 'State University',
                        district: 'Ranchi',
                        matched: 9,
                        accepted: 8,
                        rate: '88.9%',
                        deployed: 3,
                        score: '4.8 / 5.0',
                        lead: 'Dr. P. K. Singh (Agri Tech and Soil Sensors)',
                        badgeColor: 'bg-purple-100 text-purple-800'
                      },
                      {
                        rank: '5',
                        name: 'Central University of Jharkhand (CUJ)',
                        type: 'Central University',
                        district: 'Ranchi',
                        matched: 8,
                        accepted: 6,
                        rate: '75.0%',
                        deployed: 2,
                        score: '4.6 / 5.0',
                        lead: 'Dr. Manoj Kumar (Water Resource Centre)',
                        badgeColor: 'bg-stone-100 text-stone-800'
                      }
                    ].map((row) => (
                      <tr key={row.rank} className="hover:bg-[#FAF8F4] transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-[#EAE4D8] text-[#201C18] text-[10px] font-black flex items-center justify-center shrink-0">
                              #{row.rank}
                            </span>
                            <div>
                              <p className="font-extrabold text-xs text-[#201C18]">{row.name}</p>
                              <p className="text-[10px] text-[#8A7F72]">{row.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-[#5A5247]">{row.district}</td>
                        <td className="py-3 px-3 text-center font-bold text-[#201C18]">{row.matched}</td>
                        <td className="py-3 px-3 text-center font-bold text-[#2C6E49]">{row.accepted}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-extrabold text-[#2C6E49] bg-[#F0FAF4] border border-[#C3E6D0] px-2 py-0.5 rounded-md">
                            {row.rate}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-extrabold text-[#C98A2C]">{row.deployed}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center space-x-1 font-bold text-[#201C18]">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{row.score}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-[#5A5247] max-w-xs">{row.lead}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          );
        })()}

        {/* MAP TAB */}
        {activeTab === 'map' && (
          <div className="flex-1 overflow-hidden min-h-0 h-[calc(100vh-115px)] min-h-[620px] w-full flex flex-col">
            <JharkhandMapExplorer
              govtMode={true}
              embedded={true}
              onValidate={(id) => {
                const ch = challenges.find(c => c.id === id || c.reportId === id);
                if (ch) setInspectModalChallenge(ch);
              }}
              onRequestEvidence={(id) => {
                const ch = challenges.find(c => c.id === id || c.reportId === id);
                if (ch) setInspectModalChallenge(ch);
              }}
            />
          </div>
        )}

        {/* QUEUE TAB */}
        {activeTab === 'queue' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-black text-[#201C18]">Challenge Triage & Verification Queue</h2>
                <p className="text-xs text-[#6A6155]">
                  Click on any challenge to open the detailed evidence inspection view before taking an official action.
                </p>
              </div>
              <span className="text-xs font-bold text-[#B3261E] bg-[#FFF0EE] border border-[#F5C6C0] px-2.5 py-1 rounded-full">
                {pendingCount} Pending Review
              </span>
            </div>

            {loading ? (
              <PortalLoadingState />
            ) : challenges.length === 0 ? (
              <PortalEmptyState
                title="No challenge reports yet"
                description="Reports submitted via the Citizen Portal appear here in real-time."
              />
            ) : (
              <div className="space-y-3">
                {challenges.map(ch => {
                  const isPending = ch.status === 'Under Review';
                  const id = ch.id || ch.reportId;
                  const needsEvidence = ch.status === 'Evidence Requested';

                  return (
                    <div
                      key={ch.id || ch.reportId}
                      className="bg-white border border-[#E4DDD1] hover:border-[#2C6E49] rounded-xl p-4 space-y-3 transition-all shadow-2xs hover:shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-[10px] font-extrabold text-[#8A7F72] font-mono bg-[#F3EDE2] px-2 py-0.5 rounded border border-[#E4DDD1]">
                              {ch.reportId}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getSeverityBg(ch.riskLevel)} text-white`}>
                              {ch.riskLevel || 'STANDARD'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusPillClass(ch.status)}`}>
                              {ch.status}
                            </span>
                            {needsEvidence && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF8EC] text-[#C98A2C] border border-[#F0D99A]">
                                Evidence Requested
                              </span>
                            )}
                            {ch.clusterId && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                <Layers className="w-2.5 h-2.5" />
                                Clustered
                              </span>
                            )}
                            {ch.citizenReportCount && ch.citizenReportCount > 1 && (
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-emerald-300 border border-emerald-700/50 shadow-2xs flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-emerald-400" /> {ch.citizenReportCount} Citizens Reported
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3 mt-1.5">
                            {(ch.evidenceUrl || (ch.evidenceUrls && ch.evidenceUrls[0])) && (
                              <img
                                src={ch.evidenceUrl || (ch.evidenceUrls && ch.evidenceUrls[0])}
                                alt={ch.title}
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                className="w-full sm:w-44 h-28 object-cover rounded-xl border border-[#E4DDD1] shrink-0 shadow-2xs"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-bold text-[#201C18] leading-tight">{ch.title}</h3>
                              <p className="text-xs text-[#6A6155] mt-0.5">
                                {[ch.village, ch.block, ch.district].filter(Boolean).join(', ')}
                              </p>
                              {ch.summary && (
                                <p className="text-xs text-[#5A5247] mt-1.5 line-clamp-2 leading-relaxed">
                                  {ch.summary}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {editingPriorityId === id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step={0.1}
                                min={0}
                                max={10}
                                value={priorityEditValue}
                                onChange={(e) => setPriorityEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = parseFloat(priorityEditValue);
                                    if (!isNaN(val) && val >= 0 && val <= 10) {
                                      workflowStore.updateChallenge(id, { priorityScore: val });
                                      workflowStore.addTimelineEvent({
                                        id: `TL-${Date.now()}-prio-${id}`,
                                        entityType: 'challenge',
                                        entityId: id,
                                        action: 'priority_overridden',
                                        actor: officerName,
                                        actorRole: 'Government Department',
                                        description: `Priority overridden from ${ch.priorityScore?.toFixed(1) ?? '—'} to ${val.toFixed(1)}`,
                                        previousValue: ch.priorityScore?.toFixed(1),
                                        newValue: val.toFixed(1),
                                        timestamp: new Date().toISOString(),
                                      });
                                      showToast(`Priority updated to ${val.toFixed(1)}/10 for "${ch.title}"`);
                                    }
                                    setEditingPriorityId(null);
                                  }
                                  if (e.key === 'Escape') setEditingPriorityId(null);
                                }}
                                onBlur={() => setEditingPriorityId(null)}
                                autoFocus
                                className="w-16 px-1.5 py-1 text-sm font-extrabold text-[#C98A2C] bg-[#FFF8EC] border border-[#C98A2C] rounded-lg text-right focus:outline-none"
                              />
                              <span className="text-[9px] text-[#8A7F72]">/10</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingPriorityId(id);
                                setPriorityEditValue(ch.priorityScore !== undefined ? String(ch.priorityScore) : '');
                              }}
                              className="group flex items-center gap-1 cursor-pointer"
                              title="Click to override AI priority score"
                            >
                              <p className="text-sm font-extrabold text-[#C98A2C]">
                                {ch.priorityScore !== undefined ? `${ch.priorityScore.toFixed(1)}/10` : '—'}
                              </p>
                              <Pencil className="w-3 h-3 text-[#C98A2C]/40 group-hover:text-[#C98A2C] transition-colors" />
                            </button>
                          )}
                          <p className="text-[9px] text-[#8A7F72]">AI Priority Score</p>
                        </div>
                      </div>

                      {/* AI Reasoning */}
                      {ch.aiReasoning && (
                        <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg px-3 py-2 text-[11px] text-[#5A5247] leading-relaxed">
                          <span className="font-bold text-[#8A7F72] uppercase text-[9px] tracking-wider">AI Reasoning: </span>
                          {ch.aiReasoning}
                        </div>
                      )}

                      {/* Stage + HEI */}
                      <div className="flex items-center justify-between flex-wrap gap-2 text-[11px]">
                        <div className="flex items-center gap-4">
                          {ch.stageName && (
                            <div className="flex items-center gap-1 text-[#8A7F72]">
                              <Clock className="w-3 h-3" />
                              <span>{ch.stageName}</span>
                            </div>
                          )}
                          {ch.assignedHEI && (
                            <div className="flex items-center gap-1 text-[#2C6E49]">
                              <Building2 className="w-3 h-3" />
                              <span className="font-semibold">{ch.assignedHEI}</span>
                            </div>
                          )}
                        </div>

                        {/* Certificate generation button for verified/resolved challenges */}
                        <button
                          onClick={() => setCertificateModal({ isOpen: true, challenge: ch })}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#2C6E49] hover:text-[#23583a] bg-[#F0FAF4] hover:bg-[#E3F6EC] border border-[#C3E6D0] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Generate Official Certificate</span>
                        </button>
                      </div>

                      {/* Govt officer note */}
                      {ch.govtOfficerNote && (
                        <div className="flex items-start gap-1.5 text-[11px] text-[#4A433B] bg-[#EAE4D8] border border-[#E4DDD1] rounded-lg px-3 py-2">
                          <MessageSquare className="w-3 h-3 mt-0.5 shrink-0 text-[#C98A2C]" />
                          <span>{ch.govtOfficerNote}</span>
                        </div>
                      )}

                      {/* Action buttons — only for Under Review */}
                      {isPending && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => setInspectModalChallenge(ch)}
                            className="text-xs font-extrabold text-white bg-[#2C6E49] hover:bg-[#23583a] px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                          >
                            <Eye className="w-4 h-4" />
                            <span>{isPending ? 'Inspect & Decide' : 'View Inspection File'}</span>
                          </button>
                          <button
                            onClick={() => setInspectModalChallenge(ch)}
                            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-extrabold py-2 px-4 rounded-lg border border-red-200 transition-colors cursor-pointer"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PROPOSAL REVIEW TAB */}
        {activeTab === 'proposals' && (
          <ProposalReviewTab officerName={officerName} />
        )}

        {/* CLUSTER REVIEW TAB */}
        {activeTab === 'clusters' && (
          <ClusterReviewTab officerName={officerName} showToast={showToast} />
        )}

        {/* DEPLOYMENT APPROVAL TAB */}
        {activeTab === 'deployment' && (
          <DeploymentApprovalTab officerName={officerName} showToast={showToast} />
        )}

        {/* INNOVATION AND IP OUTCOMES TRACKER TAB */}
        {activeTab === 'outcomes' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
            <InnovationOutcomesTracker userRole="gov" />
          </div>
        )}

        {/* CROSS PORTAL MESSAGING HUB TAB */}
        {activeTab === 'messages' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
            <CrossPortalMessagingHub currentRole="gov" currentUserName={officerName} />
          </div>
        )}

        {/* CLOSURE TAB */}
        {activeTab === 'closure' && (
          <ClosureTab officerName={officerName} showToast={showToast} />
        )}

        {/* REPORTS & IMPACT KPIs TAB */}
        {activeTab === 'reports' && (() => {
          const statusDist = analyticsData?.statusDistribution || {};
          const submitted = (statusDist['Submitted'] || 0) + (statusDist['Under Review'] || 0);
          const validated = (statusDist['Government Validated'] || 0) + (statusDist['Clustered'] || 0) + (statusDist['Prioritized'] || 0);
          const heiMatched = (statusDist['HEI Matched'] || 0) + (statusDist['University Accepted'] || 0) + (statusDist['In Progress'] || 0) + (statusDist['Proposal Submitted'] || 0) + (statusDist['Industry Collaboration'] || 0);
          const resolvedClosed = (statusDist['Resolved'] || 0) + (statusDist['Closed'] || 0);
          return (
          <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#201C18]">State Analytics & Impact Ledger</h2>
                <p className="text-xs text-[#6A6155]">Live data from 24 Jharkhand districts, university R&D deployments, and civic hazard telemetry.</p>
              </div>
              <button
                onClick={handleExportStateReport}
                className="bg-[#2C6E49] text-white hover:bg-[#23583a] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export State Report (PDF)</span>
              </button>
            </div>

            {/* Top KPIs — driven by analytics API */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <ChartKpiCard label="Total Challenges" value={Object.values(statusDist).reduce((a,b)=>a+(b||0),0)} color="text-[#201C18]" bg="bg-white" subLabel="All reported challenges" />
              <ChartKpiCard label="Pending Review" value={statusDist['Under Review'] || 0} color="text-[#C98A2C]" bg="bg-[#FFF8EC]" subLabel="Awaiting triage" />
              <ChartKpiCard label="Deployments" value={analyticsData?.impactMetrics?.totalDeployments || 0} color="text-[#2C6E49]" bg="bg-[#F0FAF4]" subLabel="University / industry" />
              <ChartKpiCard label="Resolved / Closed" value={resolvedClosed} color="text-[#B3261E]" bg="bg-[#FFF0EE]" subLabel="Verified closure" />
              <ChartKpiCard label="Avg AI Confidence" value={`${analyticsData?.aiPerformance?.avgConfidence ? Math.round(analyticsData.aiPerformance.avgConfidence * 100) : 0}%`} color="text-[#6A6155]" bg="bg-white" subLabel="Gemini 1.5 Flash" />
            </div>

            {/* Real-time Analytics Charts (Tasks 10-16) */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E4DDD1] rounded-xl p-4 shadow-2xs">
                <p className="text-xs font-black text-[#201C18] mb-2">Challenge Status</p>
                <StatusDonutChart data={analyticsData?.statusDistribution || {}} />
              </div>
              <div className="bg-white border border-[#E4DDD1] rounded-xl p-4 shadow-2xs">
                <p className="text-xs font-black text-[#201C18] mb-2">Priority Distribution</p>
                <PriorityHistogram data={analyticsData?.priorityDistribution || []} />
              </div>
              <div className="bg-white border border-[#E4DDD1] rounded-xl p-4 shadow-2xs">
                <p className="text-xs font-black text-[#201C18] mb-2">Daily Submissions (30d)</p>
                <DailyTrendLine data={analyticsData?.dailyTrend || []} />
              </div>
              <div className="bg-white border border-[#E4DDD1] rounded-xl p-4 shadow-2xs lg:col-span-2">
                <p className="text-xs font-black text-[#201C18] mb-2">Top Domains</p>
                <DomainBarChart data={analyticsData?.domainBreakdown || []} />
              </div>
              <div className="bg-white border border-[#E4DDD1] rounded-xl p-4 shadow-2xs">
                <AIPerformanceCard data={analyticsData?.aiPerformance || { avgConfidence: 0, totalAnalyzed: 0, avgPriorityScore: 0 }} />
              </div>
            </div>

            {/* District Heatmap */}
            <div className="bg-white border border-[#E4DDD1] rounded-xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C98A2C]" />
                <p className="text-sm font-bold text-[#201C18]">District Priority Map — 24 Jharkhand Districts</p>
              </div>
              <DistrictPriorityMap data={(analyticsData?.districtHeatmap as any)?.districts || (analyticsData?.districtHeatmap as any) || []} />
            </div>

            {/* SLA Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-1">
                <span className="text-[10px] font-bold text-[#8A7F72] uppercase">Avg. AI Triage Speed</span>
                <p className="text-2xl font-black text-[#201C18]">4.2 Hours</p>
                <p className="text-[11px] text-[#2C6E49] font-bold">✓ 35% faster than state target</p>
              </div>

              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-1">
                <span className="text-[10px] font-bold text-[#8A7F72] uppercase">Avg. HEI Allocation Time</span>
                <p className="text-2xl font-black text-[#201C18]">1.8 Days</p>
                <p className="text-[11px] text-[#2C6E49] font-bold">✓ Direct lab matching active</p>
              </div>

              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-1">
                <span className="text-[10px] font-bold text-[#2C6E49]">Resolution Efficiency Rate</span>
                <p className="text-2xl font-black text-[#2C6E49]">78.4%</p>
                <p className="text-[11px] text-[#6A6155]">Verified community resolution</p>
              </div>
            </div>

            {/* Lifecycle funnel */}
            <div className="bg-white border border-[#E4DDD1] rounded-xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#2C6E49]" />
                <p className="text-sm font-bold text-[#201C18]">Lifecycle Funnel</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Submitted', match: (s: string) => s === 'Submitted' || s === 'Under Review', color: 'text-[#C98A2C]' },
                  { label: 'Validated', match: (s: string) => s === 'Government Validated' || s === 'Clustered' || s === 'Prioritized', color: 'text-[#4A433B]' },
                  { label: 'HEI Matched → Accepted', match: (s: string) => ['HEI Matched','University Accepted','In Progress','Proposal Submitted','Industry Collaboration'].includes(s), color: 'text-[#2C6E49]' },
                  { label: 'Resolved / Closed', match: (s: string) => s === 'Resolved' || s === 'Closed', color: 'text-[#B3261E]' },
                ].map(f => {
                  let count = 0;
                  if (f.label === 'Submitted') count = submitted;
                  else if (f.label === 'Validated') count = validated;
                  else if (f.label === 'HEI Matched → Accepted') count = heiMatched;
                  else if (f.label === 'Resolved / Closed') count = resolvedClosed;
                  return (
                    <div key={f.label} className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4">
                      <p className={`text-2xl font-black ${f.color}`}>{count}</p>
                      <p className="text-[10px] text-[#6A6155] font-semibold mt-0.5">{f.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Impact records for resolved/closed */}
            <div className="bg-white border border-[#E4DDD1] rounded-xl p-6 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-[#2C6E49]" />
                <p className="text-sm font-bold text-[#201C18]">Verified Impact Records</p>
              </div>
              {resolvedClosed === 0 ? (
                <PortalEmptyState
                  title="No impact records yet"
                  description="Approve deployments in the Deployment Approval tab to record impact."
                />
              ) : (
                <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4 text-xs text-[#6A6155] font-semibold">
                  <p>Verified impact records load from API deployment data.</p>
                  <p className="mt-1">Total resolved / closed challenges: <span className="text-[#2C6E49] font-black">{resolvedClosed}</span></p>
                  <p className="mt-1">Projects with outcome audit metrics are shown in the Deployment Approval tab.</p>
                </div>
              )}
            </div>
          </div>
          );
        })()}
      </main>

      {/* Toast */}
      {toastMessage && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl z-[9999] flex items-center gap-2 ${
          toastMessage.type === 'success' ? 'bg-[#2C6E49]' : 'bg-[#C98A2C]'
        }`}>
          {toastMessage.type === 'success'
            ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          }
          {toastMessage.text}
        </div>
      )}
    </div>
  );
};
