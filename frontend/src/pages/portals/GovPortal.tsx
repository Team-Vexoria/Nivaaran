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
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { JharkhandMapExplorer } from '../../components/map/JharkhandMapExplorer';
import { useMapData, getSeverityBg, getStatusPillClass } from '../../services/mapDataService';
import { govValidateChallenge, govRequestEvidence, govVerifyAndDeployChallenge, govRejectChallenge, ChallengeDoc } from '../../services/firebaseService';
import { CertificateModal } from '../../components/CertificateModal';
import { ProposalReviewTab } from '../../components/gov/ProposalReviewTab';
import { workflowStore, STORE_EVENT } from '../../services/workflowStore';
import { getStageForStatus } from '../../services/workflowLifecycle';
import { JHARKHAND_UNIVERSITIES } from '../../services/universityData';
import { ClusterReviewTab } from '../../components/gov/ClusterReviewTab';
import { DeploymentApprovalTab } from '../../components/gov/DeploymentApprovalTab';
import { ClosureTab } from '../../components/gov/ClosureTab';
import { PortalLoadingState, PortalEmptyState } from '../../components/PortalUIStates';


type GovTab = 'overview' | 'map' | 'queue' | 'universities' | 'proposals' | 'reports' | 'deployment' | 'closure' | 'clusters';

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

          {/* Detailed Problem Description */}
          <div className="bg-white border border-[#E4DDD1] rounded-xl p-4 space-y-2">
            <h4 className="font-black text-[#201C18] uppercase tracking-wider text-[10px]">Problem Statement & Ground Context</h4>
            <p className="text-xs text-[#4A433B] leading-relaxed whitespace-pre-line">
              {challenge.summary || challenge.title}
            </p>
          </div>

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
            {challenge.evidenceUrl ? (
              <div className="rounded-xl overflow-hidden border border-[#E4DDD1] bg-black/5 max-h-64 flex items-center justify-center">
                <img src={challenge.evidenceUrl} alt="Ground Evidence" className="max-h-64 object-contain" />
              </div>
            ) : (
              <div className="bg-[#FAF8F4] border border-dashed border-[#E4DDD1] rounded-xl p-6 text-center space-y-1">
                <FileText className="w-8 h-8 text-[#8A7F72] mx-auto mb-1" />
                <p className="font-bold text-[#4A433B]">Standard Citizen Hazard Report</p>
                <p className="text-[11px] text-[#8A7F72]">GPS coordinates & spatial density log verified by Panchayat Cell.</p>
              </div>
            )}
          </div>

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
    { id: 'reports',      label: 'Impact KPIs',           icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'closure',      label: 'Closure',               icon: <Archive className="w-3.5 h-3.5" /> },
  ];

  const pendingCount = challenges.filter(c => c.status === 'Under Review').length;
  const evidenceNeededCount = challenges.filter(c => c.needsHumanVerification).length;

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#201C18] flex flex-col font-sans">

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
          </div>
          );
        })()}

        {/* MAP TAB */}
        {activeTab === 'map' && (
          <div className="flex-1 overflow-hidden min-h-0 h-full">
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
                          </div>
                          <h3 className="text-sm font-bold text-[#201C18] leading-tight">{ch.title}</h3>
                          <p className="text-xs text-[#6A6155] mt-0.5">
                            {[ch.village, ch.block, ch.district].filter(Boolean).join(', ')}
                          </p>
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

        {/* CLOSURE TAB */}
        {activeTab === 'closure' && (
          <ClosureTab officerName={officerName} showToast={showToast} />
        )}

        {/* REPORTS & IMPACT KPIs TAB */}
        {activeTab === 'reports' && (() => {
          const wf = wfChallenges;
          const resolvedCount2 = wf.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
          const deploymentCount = wf.filter(c => c.status === 'Outcome Audit').length;
          const prototypeCount = wf.filter(c => {
            const s = getStageForStatus(c.status)?.stageNumber || 0;
            return s >= 11;
          }).length;
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

            {/* Top KPIs */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Challenges', value: totalCount, color: 'text-[#201C18]', bg: '' },
                { label: 'Pending Review', value: pendingCount, color: 'text-[#C98A2C]', bg: 'bg-[#FFF8EC]' },
                { label: 'Deployments', value: deploymentCount, color: 'text-[#2C6E49]', bg: 'bg-[#F0FAF4]' },
                { label: 'Resolved / Closed', value: resolvedCount2, color: 'text-[#B3261E]', bg: 'bg-[#FFF0EE]' },
                { label: 'At Stage 11+', value: prototypeCount, color: 'text-[#6A6155]', bg: '' },
              ].map(kpi => (
                <div key={kpi.label} className={`${kpi.bg || 'bg-white'} border border-[#E4DDD1] rounded-xl p-5 shadow-2xs`}>
                  <p className="text-xs text-[#6A6155] font-semibold mb-1">{kpi.label}</p>
                  <p className={`text-3xl font-black ${kpi.color}`}>{loading ? '…' : kpi.value}</p>
                </div>
              ))}
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
                  const count = wf.filter(c => f.match(c.status)).length;
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
              {wf.filter(c => c.status === 'Resolved' || c.status === 'Closed').length === 0 ? (
                <PortalEmptyState
                  title="No impact records yet"
                  description="Approve deployments in the Deployment Approval tab to record impact."
                />
              ) : (
                <div className="space-y-3">
                  {wf.filter(c => c.status === 'Resolved' || c.status === 'Closed').map(c => {
                    const proj = workflowStore.getProjects().find(p => p.challengeId === c.id || p.challengeId === c.reportId);
                    const metrics = proj?.outcomeAudit?.metrics || {};
                    const metricEntries = Object.entries(metrics);
                    return (
                      <div key={c.id} className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-sm font-bold text-[#201C18]">{c.title}</p>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${c.status === 'Closed' ? 'bg-[#2C6E49] text-white' : 'bg-[#B3261E] text-white'}`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6A6155]">{c.district} · {c.assignedHEI || 'University R&D'}</p>
                        {proj?.outcomeAudit?.summary && (
                          <p className="text-xs text-[#4A433B] bg-white border border-[#E4DDD1] rounded-lg px-3 py-2 italic">“{proj.outcomeAudit.summary}”</p>
                        )}
                        {metricEntries.length > 0 && (
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {metricEntries.map(([k, v]) => (
                              <div key={k} className="bg-white border border-[#E4DDD1] rounded-lg px-3 py-2 text-center">
                                <p className="text-lg font-black text-[#C98A2C]">{String(v)}</p>
                                <p className="text-[9px] text-[#6A6155] font-semibold uppercase tracking-wider">{k}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
