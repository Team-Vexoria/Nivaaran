import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Map, 
  ListFilter, 
  BarChart3, 
  LogOut, 
  AlertCircle, 
  Building2, 
  Clock, 
  X, 
  MessageSquare, 
  AlertTriangle,
  Award,
  LayoutDashboard,
  ArrowRight,
  Flame,
  FileCheck,
  Layers,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { JharkhandMapExplorer } from '../../components/map/JharkhandMapExplorer';
import { useMapData, getSeverityBg, getStatusPillClass } from '../../services/mapDataService';
import { govValidateChallenge, govRequestEvidence, govRejectChallenge, ChallengeDoc } from '../../services/firebaseService';
import { CertificateModal } from '../../components/CertificateModal';
import { ProposalReviewTab } from '../../components/gov/ProposalReviewTab';

type GovTab = 'overview' | 'map' | 'queue' | 'universities' | 'proposals' | 'reports';

// ─── Action Modal ─────────────────────────────────────────────────────────────
interface ActionModalProps {
  type: 'validate' | 'evidence' | 'reject';
  challenge: ChallengeDoc;
  officerName: string;
  onConfirm: (note: string) => void;
  onClose: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ type, challenge, officerName, onConfirm, onClose }) => {
  const [note, setNote] = useState('');
  const isValidate = type === 'validate';
  const isReject = type === 'reject';

  const defaultNote = isValidate
    ? `Validated by ${officerName}. Site conditions confirmed. Queued for HEI capability matching.`
    : isReject
    ? `Rejected by ${officerName}. Challenge does not meet submission criteria or is a duplicate.`
    : `Evidence requested by ${officerName}. Please upload additional GPS-tagged photos or video of the affected site.`;

  const headerColor = isValidate ? 'text-[#2C6E49]' : isReject ? 'text-[#B91C1C]' : 'text-[#C98A2C]';
  const confirmBg = isValidate
    ? 'bg-[#2C6E49] hover:bg-[#23583a]'
    : isReject
    ? 'bg-[#B91C1C] hover:bg-[#991b1b]'
    : 'bg-[#C98A2C] hover:bg-[#a97224]';
  const headerText = isValidate
    ? '✓ Validate & Approve Challenge'
    : isReject
    ? '✗ Reject Challenge'
    : '⚠ Request Additional Evidence';
  const confirmLabel = isValidate ? 'Confirm Validation' : isReject ? 'Confirm Rejection' : 'Send Evidence Request';

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#E4DDD1] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">

        <div className="flex items-start justify-between">
          <div>
            <h3 className={`text-sm font-black ${headerColor}`}>{headerText}</h3>
            <p className="text-xs text-[#6A6155] mt-0.5 font-mono">{challenge.reportId}</p>
            <p className="text-xs text-[#4A433B] font-semibold mt-1 line-clamp-1">{challenge.title}</p>
          </div>
          <button onClick={onClose} className="p-1 text-[#8A7F72] hover:text-[#201C18] rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isReject && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-800 font-medium">
            ⚠ This will permanently remove the challenge from the active queue. The citizen will be notified with your reason.
          </div>
        )}

        <div>
          <label className="text-[10px] font-bold text-[#6A6155] uppercase tracking-wider block mb-1.5">
            Officer Note (visible to Citizen & University)
          </label>
          <textarea
            className="w-full border border-[#E4DDD1] rounded-xl px-3 py-2.5 text-xs text-[#201C18] bg-[#FAF8F4] focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30 resize-none"
            rows={3}
            placeholder={defaultNote}
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <p className="text-[9px] text-[#8A7F72] mt-1">
            Leave blank to use default note. This action will update the challenge status immediately.
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onConfirm(note.trim() || defaultNote)}
            className={`flex-1 py-2 text-xs font-extrabold text-white rounded-xl transition-colors cursor-pointer ${confirmBg}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#4A433B] bg-[#EAE4D8] hover:bg-[#DFD8CA] border border-[#E4DDD1] rounded-xl cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Portal ──────────────────────────────────────────────────────────────
export const GovPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<GovTab>('overview');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);
  const [actionModal, setActionModal] = useState<{ type: 'validate' | 'evidence' | 'reject'; challenge: ChallengeDoc } | null>(null);
  const [certificateModal, setCertificateModal] = useState<{ isOpen: boolean; challenge: ChallengeDoc | null }>({
    isOpen: false,
    challenge: null,
  });

  const { challenges, totalCount, criticalCount, validatedCount, resolvedCount, loading } = useMapData();

  const officerName = currentUser?.displayName || 'Government Officer';

  const showToast = (text: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openValidate = (challenge: ChallengeDoc) => setActionModal({ type: 'validate', challenge });
  const openRequestEvidence = (challenge: ChallengeDoc) => setActionModal({ type: 'evidence', challenge });
  const openReject = (challenge: ChallengeDoc) => setActionModal({ type: 'reject', challenge });

  const handleMapValidate = (challengeId: string) => {
    const ch = challenges.find(c => c.id === challengeId || c.reportId === challengeId);
    if (ch) openValidate(ch);
  };
  const handleMapRequestEvidence = (challengeId: string) => {
    const ch = challenges.find(c => c.id === challengeId || c.reportId === challengeId);
    if (ch) openRequestEvidence(ch);
  };

  const handleConfirm = async (note: string) => {
    if (!actionModal) return;
    const { type, challenge } = actionModal;
    const id = challenge.id || challenge.reportId;
    setActionModal(null);

    if (type === 'validate') {
      const succeeded = await govValidateChallenge(id, note, officerName);
      showToast(
        succeeded
          ? `✓ "${challenge.title}" validated. Status updated to Government Validated.`
          : `Unable to validate "${challenge.title}". The challenge may no longer exist or may be at an invalid stage.`,
        succeeded ? 'success' : 'warning'
      );
    } else if (type === 'reject') {
      const succeeded = await govRejectChallenge(id, note, officerName);
      showToast(
        succeeded
          ? `✗ "${challenge.title}" rejected and removed from queue.`
          : `Unable to reject "${challenge.title}". Please try again.`,
        succeeded ? 'warning' : 'warning'
      );
    } else {
      const succeeded = await govRequestEvidence(id, note, officerName);
      showToast(
        succeeded
          ? `⚠ Evidence requested for "${challenge.title}". Citizen notified.`
          : `Unable to request evidence for "${challenge.title}". The challenge may no longer exist or may be at an invalid stage.`,
        'warning'
      );
    }
  };

  const tabs: { id: GovTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',     label: 'Overview',              icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'map',          label: 'State Map',             icon: <Map className="w-3.5 h-3.5" /> },
    { id: 'queue',        label: 'Challenge Queue',       icon: <ListFilter className="w-3.5 h-3.5" /> },
    { id: 'universities', label: 'HEI Allocations',       icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'proposals',    label: 'Proposal Review',       icon: <FileCheck className="w-3.5 h-3.5" /> },
    { id: 'reports',      label: 'Reports & Analytics',   icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];


  const pendingCount = challenges.filter(c => c.status === 'Under Review').length;
  const evidenceNeededCount = challenges.filter(c => c.needsHumanVerification).length;

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#201C18] flex flex-col font-sans">

      {/* ── Action Modal ── */}
      {actionModal && (
        <ActionModal
          type={actionModal.type}
          challenge={actionModal.challenge}
          officerName={officerName}
          onConfirm={handleConfirm}
          onClose={() => setActionModal(null)}
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
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">

            {/* Official Government Command Header (Clean Light Theme) */}
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
                  <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl px-3.5 py-2 text-right">
                    <p className="text-[10px] text-[#8A7F72] uppercase font-bold">Active District Coverage</p>
                    <p className="text-sm font-extrabold text-[#201C18] font-heading">24 / 24 Connected</p>
                  </div>
                  <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl px-3.5 py-2 text-right">
                    <p className="text-[10px] text-[#8A7F72] uppercase font-bold">Officer</p>
                    <p className="text-sm font-extrabold text-[#2C6E49] font-heading">{officerName.split(' ')[0]}</p>
                  </div>
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

            {/* Main Command Grid: Left 7 cols (Queue & District Matrix), Right 5 cols (Domain Breakdown & Lifecycle) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Column (7 cols) */}
              <div className="lg:col-span-7 space-y-6">

                {/* 1. Urgent Action Items Panel */}
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
                      <p className="text-xs text-[#8A7F72] mt-1">New citizen reports will appear here automatically.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F0EBE0]">
                      {challenges.filter(c => c.status === 'Under Review').slice(0, 4).map(ch => {
                        const id = ch.id || ch.reportId;
                        return (
                          <div key={id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF8F4] transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getSeverityBg(ch.riskLevel)}`} />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#201C18] truncate">{ch.title}</p>
                                <p className="text-[11px] text-[#8A7F72]">{ch.district} · {ch.reportId}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getSeverityBg(ch.riskLevel)} text-white`}>
                                {ch.riskLevel || 'STD'}
                              </span>
                              <button
                                onClick={() => openValidate(ch)}
                                className="text-[11px] font-extrabold text-white bg-[#2C6E49] hover:bg-[#23583a] px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Validate
                              </button>
                              <button
                                onClick={() => openRequestEvidence(ch)}
                                className="text-[11px] font-extrabold text-[#C98A2C] bg-[#FFF8EC] hover:bg-[#FFF0D0] border border-[#F0D99A] px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              >
                                Evidence
                              </button>
                              <button
                                onClick={() => openReject(ch)}
                                className="text-[11px] font-extrabold text-[#B91C1C] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {pendingCount > 4 && (
                        <div className="px-5 py-2.5 text-center bg-[#FAF8F4]">
                          <button
                            onClick={() => setActiveTab('queue')}
                            className="text-xs font-bold text-[#2C6E49] hover:underline cursor-pointer"
                          >
                            + {pendingCount - 4} more challenges in queue →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. District Allocation Stream Table */}
                <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#201C18]">District Hotspots & HEI Allocation Status</h3>
                      <p className="text-[11px] text-[#8A7F72]">Real-time operational distribution across top Jharkhand districts</p>
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
                        {[
                          { name: 'Ranchi', reports: 142, risk: 'CRITICAL', hei: 'BIT Mesra' },
                          { name: 'Dhanbad', reports: 98, risk: 'CRITICAL', hei: 'IIT (ISM) Dhanbad' },
                          { name: 'East Singhbhum', reports: 86, risk: 'HIGH', hei: 'NIT Jamshedpur' },
                          { name: 'Palamu', reports: 114, risk: 'HIGH', hei: 'Birsa Agri Univ' },
                          { name: 'Hazaribagh', reports: 65, risk: 'MEDIUM', hei: 'VBU Hazaribagh' },
                        ].map((d, i) => (
                          <tr key={i} className="hover:bg-[#FAF8F4]/80 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-[#201C18]">{d.name}</td>
                            <td className="py-2.5 px-3">{d.reports}</td>
                            <td className="py-2.5 px-3">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getSeverityBg(d.risk)} text-white`}>
                                {d.risk}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-[#2C6E49]">{d.hei}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column (5 cols) */}
              <div className="lg:col-span-5 space-y-6">

                {/* 1. Category & Hazard Domain Breakdown */}
                <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0EBE0] pb-3">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-[#2C6E49]" />
                      <h3 className="text-sm font-extrabold text-[#201C18]">Hazard Domain Breakdown</h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#8A7F72]">5 Core Domains</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { domain: 'Flood, Water Logging & Drainage', count: '42%', color: 'bg-blue-600', text: 'text-blue-700' },
                      { domain: 'Mining, Subsidence & Landslides', count: '24%', color: 'bg-amber-600', text: 'text-amber-700' },
                      { domain: 'Rural Roads & Bridge Infrastructure', count: '18%', color: 'bg-emerald-600', text: 'text-emerald-700' },
                      { domain: 'Agro-Drought & Groundwater Recharge', count: '11%', color: 'bg-[#C98A2C]', text: 'text-[#C98A2C]' },
                      { domain: 'School Safety & Public Hazards', count: '5%', color: 'bg-purple-600', text: 'text-purple-700' },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#201C18] text-[11px] truncate">{item.domain}</span>
                          <span className={`font-mono font-extrabold ${item.text}`}>{item.count}</span>
                        </div>
                        <div className="w-full bg-[#FAF8F4] border border-[#E4DDD1] h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: item.count }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. 16-Stage Lifecycle Progress Summary */}
                <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#F0EBE0] pb-3">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-[#C98A2C]" />
                      <h3 className="text-sm font-extrabold text-[#201C18]">16-Stage Lifecycle Distribution</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 space-y-1">
                      <span className="text-[10px] font-bold text-[#2C6E49] bg-[#2C6E49]/10 px-2 py-0.5 rounded font-mono">Phase 1</span>
                      <p className="text-xs font-bold text-[#201C18]">Triage & Review</p>
                      <p className="text-[11px] text-[#8A7F72]">Stages 1–5</p>
                    </div>

                    <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 space-y-1">
                      <span className="text-[10px] font-bold text-[#C98A2C] bg-[#C98A2C]/10 px-2 py-0.5 rounded font-mono">Phase 2</span>
                      <p className="text-xs font-bold text-[#201C18]">HEI Matching</p>
                      <p className="text-[11px] text-[#8A7F72]">Stages 6–9</p>
                    </div>

                    <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 space-y-1">
                      <span className="text-[10px] font-bold text-[#B5502D] bg-[#B5502D]/10 px-2 py-0.5 rounded font-mono">Phase 3</span>
                      <p className="text-xs font-bold text-[#201C18]">IoT Prototype</p>
                      <p className="text-[11px] text-[#8A7F72]">Stages 10–13</p>
                    </div>

                    <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 space-y-1">
                      <span className="text-[10px] font-bold text-[#2C6E49] bg-[#2C6E49]/10 px-2 py-0.5 rounded font-mono">Phase 4</span>
                      <p className="text-xs font-bold text-[#201C18]">Deployment</p>
                      <p className="text-[11px] text-[#8A7F72]">Stages 14–16</p>
                    </div>
                  </div>
                </div>

                {/* 3. Quick Action Hub */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('map')}
                    className="p-4 bg-white border border-[#E4DDD1] hover:border-[#2C6E49] rounded-xl text-left transition-all group cursor-pointer shadow-2xs space-y-1.5"
                  >
                    <Map className="w-5 h-5 text-[#2C6E49]" />
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
        {activeTab === 'universities' && (
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
                  Institutions assigned to solve validated ground challenges through multidisciplinary student & faculty engineering teams.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-[#FAF8F4] border border-[#E4DDD1] px-3.5 py-2 rounded-xl text-right">
                  <p className="text-[10px] font-bold text-[#8A7F72] uppercase">Partner HEIs</p>
                  <p className="text-sm font-extrabold text-[#201C18]">6 Institutions</p>
                </div>
                <div className="bg-[#FAF8F4] border border-[#E4DDD1] px-3.5 py-2 rounded-xl text-right">
                  <p className="text-[10px] font-bold text-[#8A7F72] uppercase">R&D Labs</p>
                  <p className="text-sm font-extrabold text-[#2C6E49]">48+ Connected</p>
                </div>
              </div>
            </div>

            {/* University Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  name: 'BIT Mesra, Ranchi',
                  role: 'Centre of Excellence in Flood Telemetry & Sensor Systems',
                  domain: 'Water Logging, IoT Sensors, Early Warning Hardware',
                  assigned: 4,
                  teams: 8,
                  lead: 'Dr. S. K. Verma (Dept of ECE)',
                  facilities: 'IoT Fabrication Lab, Ultrasonic Water Sensors',
                  badge: 'Lead Nodal Centre',
                },
                {
                  name: 'IIT (ISM) Dhanbad',
                  role: 'Geotechnical & Mine Safety Innovation Wing',
                  domain: 'Landslides, Subsidence, Open-Cast Pit Flooding',
                  assigned: 3,
                  teams: 6,
                  lead: 'Prof. R. Banerjee (Dept of Mining)',
                  facilities: 'Ground Radar, Displacement Telemetry',
                  badge: 'Premier R&D Lab',
                },
                {
                  name: 'NIT Jamshedpur',
                  role: 'Hydraulic Modeling & Spatial River Basin Lab',
                  domain: 'River Overflow, Culvert Blockage, GIS Spatial Flow',
                  assigned: 3,
                  teams: 5,
                  lead: 'Dr. A. K. Choudhary (Civil Engg)',
                  facilities: 'Hydraulic Basin Simulator, Drone GIS',
                  badge: 'Spatial GIS Node',
                },
                {
                  name: 'Birsa Agricultural University',
                  role: 'Agro-Water & Drought Mitigation Research Unit',
                  domain: 'Groundwater Depletion, Check-Dam Telemetry',
                  assigned: 2,
                  teams: 4,
                  lead: 'Dr. M. Soren (Soil & Water Engg)',
                  facilities: 'Soil Moisture Testbed, Rainwater Loggers',
                  badge: 'Agritech Centre',
                },
                {
                  name: 'IIIT Ranchi',
                  role: 'Low-Cost Edge AI & Embedded Telemetry Cell',
                  domain: 'Edge AI Camera Triage, Low-Bandwidth LoRa Mesh',
                  assigned: 2,
                  teams: 4,
                  lead: 'Dr. P. Roy (Computer Science)',
                  facilities: 'Embedded AI Kits, LoRaWAN Gateway',
                  badge: 'Edge AI Node',
                },
                {
                  name: 'Ranchi University',
                  role: 'Civic Field Surveys & Ground Impact Cell',
                  domain: 'Socio-Economic Audit, Citizen Verification',
                  assigned: 2,
                  teams: 3,
                  lead: 'Dr. K. Kumari (Social Science)',
                  facilities: 'Field Survey Kit, Multilingual Audit App',
                  badge: 'Impact Audit Cell',
                },
              ].map((hei, idx) => (
                <div key={idx} className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4 hover:border-[#2C6E49] transition-all">
                  <div className="flex items-start justify-between gap-2 border-b border-[#FAF8F4] pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold text-[#C98A2C] bg-[#FFF8EC] border border-[#F0D99A] px-2 py-0.5 rounded-full">
                        {hei.badge}
                      </span>
                      <h3 className="text-base font-extrabold text-[#201C18] font-heading mt-1">{hei.name}</h3>
                      <p className="text-[11px] text-[#8A7F72]">{hei.role}</p>
                    </div>
                    <Building2 className="w-5 h-5 text-[#2C6E49] shrink-0 mt-1" />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">Specialization:</span>
                      <p className="text-[#201C18] font-semibold">{hei.domain}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">Faculty Lead:</span>
                      <p className="text-[#4A433B]">{hei.lead}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">Lab Facilities:</span>
                      <p className="text-[#6A6155] text-[11px]">{hei.facilities}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F0EBE0] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2C6E49]">{hei.assigned} Active Projects</span>
                    <span className="text-[#8A7F72] font-mono">{hei.teams} Student Teams</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* MAP TAB */}
        {activeTab === 'map' && (
          <div className="flex-1 overflow-hidden min-h-0" style={{ height: 'calc(100vh - 96px)' }}>
            <JharkhandMapExplorer
              govtMode={true}
              embedded={true}
              onValidate={handleMapValidate}
              onRequestEvidence={handleMapRequestEvidence}
            />
          </div>
        )}

        {/* QUEUE TAB */}
        {activeTab === 'queue' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-black text-[#201C18]">Challenge Triage Queue</h2>
                <p className="text-xs text-[#6A6155]">
                  Review AI-triaged challenges. Validate to advance to Stage 3, or request more evidence from citizen.
                </p>
              </div>
              <span className="text-xs font-bold text-[#B3261E] bg-[#FFF0EE] border border-[#F5C6C0] px-2.5 py-1 rounded-full">
                {pendingCount} Pending Review
              </span>
            </div>

            {loading ? (
              <div className="text-center py-16 text-[#8A7F72] text-sm">Loading live challenge data…</div>
            ) : challenges.length === 0 ? (
              <div className="bg-white border border-[#E4DDD1] rounded-xl p-12 text-center">
                <AlertCircle className="w-8 h-8 text-[#C98A2C] mx-auto mb-3" />
                <p className="text-sm font-bold text-[#4A433B]">No challenge reports yet.</p>
                <p className="text-xs text-[#8A7F72] mt-1">Reports submitted via the Citizen Portal appear here in real-time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {challenges.map(ch => {
                  const id = ch.id || ch.reportId;
                  const isPending = ch.status === 'Under Review';
                  const needsEvidence = ch.needsHumanVerification;

                  return (
                    <div
                      key={id}
                      className={`bg-white border rounded-xl p-4 space-y-3 transition-shadow hover:shadow-sm ${
                        isPending ? 'border-[#E4DDD1]' : 'border-[#DCD9D4]'
                      }`}
                    >
                      {/* Row 1: ID + badges + AI score */}
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
                          <p className="text-sm font-extrabold text-[#C98A2C]">
                            {ch.priorityScore !== undefined ? `${ch.priorityScore.toFixed(1)}/10` : '—'}
                          </p>
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
                            onClick={() => openValidate(ch)}
                            className="flex items-center gap-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-extrabold py-2 px-4 rounded-lg transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Validate & Approve
                          </button>
                          <button
                            onClick={() => openRequestEvidence(ch)}
                            className="flex items-center gap-1.5 bg-[#EAE4D8] hover:bg-[#DFD8CA] text-[#4A433B] text-xs font-extrabold py-2 px-4 rounded-lg border border-[#E4DDD1] transition-colors cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-[#C98A2C]" />
                            Request Evidence
                          </button>
                          <button
                            onClick={() => openReject(ch)}
                            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-extrabold py-2 px-4 rounded-lg border border-red-200 transition-colors cursor-pointer"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Validated — show HEI assignment status */}
                      {ch.status === 'Government Validated' && !ch.assignedHEI && (
                        <div className="flex items-center gap-2 bg-[#F0FAF4] border border-[#C3E6D0] rounded-lg px-3 py-2 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2C6E49] shrink-0" />
                          <span className="text-[#2C6E49] font-semibold">Validated. This challenge is visible to matched universities for acceptance.</span>
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

        {/* REPORTS & ANALYTICS TAB */}
        {activeTab === 'reports' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#201C18]">State Analytics & Impact Ledger</h2>
              <p className="text-xs text-[#6A6155]">Live data from 24 Jharkhand districts, university R&D deployments, and civic hazard telemetry.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Challenges', value: totalCount, color: 'text-[#201C18]', bg: '' },
                { label: 'Pending Review', value: pendingCount, color: 'text-[#C98A2C]', bg: 'bg-[#FFF8EC]' },
                { label: 'Critical Alerts', value: criticalCount, color: 'text-[#B3261E]', bg: 'bg-[#FFF0EE]' },
                { label: 'Govt. Validated', value: validatedCount, color: 'text-[#2C6E49]', bg: 'bg-[#F0FAF4]' },
                { label: 'Resolved', value: resolvedCount, color: 'text-[#6A6155]', bg: '' },
              ].map(kpi => (
                <div key={kpi.label} className={`${kpi.bg || 'bg-white'} border border-[#E4DDD1] rounded-xl p-5 shadow-2xs`}>
                  <p className="text-xs text-[#6A6155] font-semibold mb-1">{kpi.label}</p>
                  <p className={`text-3xl font-black ${kpi.color}`}>{loading ? '…' : kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-[#E4DDD1] rounded-xl p-6 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2C6E49]" />
                <p className="text-sm font-bold text-[#201C18]">Executive Summary</p>
              </div>
              <p className="text-xs text-[#6A6155] leading-relaxed">
                The NIVAARAN platform currently tracks <strong className="text-[#201C18]">{totalCount}</strong> citizen-reported 
                societal challenges across 24 Jharkhand districts. 
                <strong className="text-[#B3261E]"> {criticalCount}</strong> are flagged as Critical severity by the AI triage engine, 
                requiring immediate government attention.{' '}
                <strong className="text-[#C98A2C]">{pendingCount}</strong> are pending government officer review.{' '}
                <strong className="text-[#2C6E49]"> {validatedCount}</strong> challenges have been government-validated and are 
                visible to matched university R&D labs for acceptance.{' '}
                <strong className="text-[#6A6155]">{resolvedCount}</strong> have been resolved with verified community impact.
              </p>
            </div>
          </div>
        )}
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
