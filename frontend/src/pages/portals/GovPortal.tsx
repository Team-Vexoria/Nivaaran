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
  Download,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { JharkhandMapExplorer } from '../../components/map/JharkhandMapExplorer';
import { useMapData, getSeverityBg, getStatusPillClass } from '../../services/mapDataService';
import { govValidateChallenge, govRequestEvidence, ChallengeDoc } from '../../services/firebaseService';
import { CertificateModal } from '../../components/CertificateModal';

type GovTab = 'map' | 'queue' | 'reports';

// ─── Action Modal ─────────────────────────────────────────────────────────────
interface ActionModalProps {
  type: 'validate' | 'evidence';
  challenge: ChallengeDoc;
  officerName: string;
  onConfirm: (note: string) => void;
  onClose: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ type, challenge, officerName, onConfirm, onClose }) => {
  const [note, setNote] = useState('');
  const isValidate = type === 'validate';

  const defaultNote = isValidate
    ? `Validated by ${officerName}. Site conditions confirmed. Queued for HEI capability matching.`
    : `Evidence requested by ${officerName}. Please upload additional GPS-tagged photos or video of the affected site.`;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#E4DDD1] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`text-sm font-black ${isValidate ? 'text-[#2C6E49]' : 'text-[#C98A2C]'}`}>
              {isValidate ? '✓ Validate & Approve Challenge' : '⚠ Request Additional Evidence'}
            </h3>
            <p className="text-xs text-[#6A6155] mt-0.5 font-mono">{challenge.reportId}</p>
            <p className="text-xs text-[#4A433B] font-semibold mt-1 line-clamp-1">{challenge.title}</p>
          </div>
          <button onClick={onClose} className="p-1 text-[#8A7F72] hover:text-[#201C18] rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

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
            className={`flex-1 py-2 text-xs font-extrabold text-white rounded-xl transition-colors cursor-pointer ${
              isValidate ? 'bg-[#2C6E49] hover:bg-[#23583a]' : 'bg-[#C98A2C] hover:bg-[#a97224]'
            }`}
          >
            {isValidate ? 'Confirm Validation' : 'Send Evidence Request'}
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
  const [activeTab, setActiveTab] = useState<GovTab>('map');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);
  const [actionModal, setActionModal] = useState<{ type: 'validate' | 'evidence'; challenge: ChallengeDoc } | null>(null);
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
      await govValidateChallenge(id, note, officerName);
      showToast(`✓ "${challenge.title}" validated. Status updated to Government Validated.`, 'success');
    } else {
      await govRequestEvidence(id, note, officerName);
      showToast(`⚠ Evidence requested for "${challenge.title}". Citizen notified.`, 'warning');
    }
  };

  const tabs: { id: GovTab; label: string; icon: React.ReactNode }[] = [
    { id: 'map',     label: 'State Map',       icon: <Map className="w-3.5 h-3.5" /> },
    { id: 'queue',   label: 'Challenge Queue',  icon: <ListFilter className="w-3.5 h-3.5" /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
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
          challenge={{
            reportId: certificateModal.challenge.reportId,
            title: certificateModal.challenge.title,
            district: certificateModal.challenge.district,
            block: certificateModal.challenge.block,
            village: certificateModal.challenge.village,
            category: certificateModal.challenge.category,
            assignedHEI: certificateModal.challenge.assignedHEI,
            assignedDept: certificateModal.challenge.assignedDept,
            csrSponsor: certificateModal.challenge.csrSponsor,
          }}
          officerName={officerName}
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
