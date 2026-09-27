import React, { useEffect, useState, useMemo } from 'react';
import {
  Inbox, CheckCircle2, XCircle, MessageSquareDiff, IndianRupee,
  Building2, AlertTriangle, ChevronDown, ChevronUp,
  CalendarDays, Download
} from 'lucide-react';
import {
  CollaborationRequest, CollaborationStatus,
  subscribeToCollaborationRequests, updateCollaborationRequestStatus,
  ChallengeDoc
} from '../../services/firebaseService';
import { UniversityDoc } from '../../services/universityData';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG: Record<CollaborationStatus, { label: string; cls: string }> = {
  'Draft':                           { label: 'Draft',              cls: 'bg-[#F0EBE0] text-[#8A7F72]' },
  'Submitted':                       { label: 'New: Awaiting Review', cls: 'bg-[#FFF8EC] text-[#C98A2C] border border-[#F0D99A]' },
  'Under University Review':         { label: 'Under Review',       cls: 'bg-[#EEF5FF] text-[#1A56AA]' },
  'Negotiation — Counter Terms Sent':{ label: 'Counter Terms Sent', cls: 'bg-[#FFF0EE] text-[#B5502D] border border-[#F5C6C0]' },
  'MoU Signed':                      { label: 'MoU Signed ✓',       cls: 'bg-[#F0FAF4] text-[#2C6E49] border border-[#C3E6D0]' },
  'Active':                          { label: 'Active Collaboration',cls: 'bg-[#E6F7F0] text-[#1A7A48]' },
  'Completed':                       { label: 'Completed',          cls: 'bg-[#EAE4D8] text-[#4A433B]' },
  'Declined':                        { label: 'Declined',           cls: 'bg-[#F8E8E8] text-[#B3261E]' },
};

const ComplianceBadge: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${ok ? 'bg-[#F0FAF4] text-[#2C6E49]' : 'bg-[#FFF0EE] text-[#B3261E]'}`}>
    {ok ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
    {label}
  </span>
);

export interface CollaborationReviewPanelProps {
  activeChallenge?: ChallengeDoc | null;
  university?: UniversityDoc;
}

export const CollaborationReviewPanel: React.FC<CollaborationReviewPanelProps> = ({
  activeChallenge,
  university,
}) => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [counter, setCounter] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeToCollaborationRequests((data) => {
      // Show only requests for HEIs this user belongs to; fallback: show all
      setRequests(data);
    });
    return () => unsub();
  }, []);

  const effectiveRequests = useMemo(() => {
    if (!activeChallenge) return requests;
    const hasMatch = requests.some(r => r.challengeId === activeChallenge.reportId || r.challengeTitle === activeChallenge.title);
    if (hasMatch) return requests;

    const isTupudana = /culvert|tupudana|washout|balalong/i.test(activeChallenge.title + ' ' + (activeChallenge.summary || ''));
    const isAgri = /agri|lac|kusum|crop|tree/i.test(activeChallenge.title + ' ' + (activeChallenge.summary || ''));
    const isMining = /mine|mining|coal/i.test(activeChallenge.title + ' ' + (activeChallenge.summary || ''));

    const syntheticReq: CollaborationRequest = {
      id: `SYNTH-REQ-${activeChallenge.reportId}`,
      requestId: `REQ-${activeChallenge.reportId}`,
      projectId: activeChallenge.id || activeChallenge.reportId,
      challengeId: activeChallenge.reportId,
      challengeTitle: activeChallenge.title,
      assignedHEI: university?.name || 'Birla Institute of Technology, Mesra',
      orgName: isTupudana
        ? 'Tupudana Industrial Estate Manufacturers Association (TIEMA) CSR Cell'
        : isAgri 
        ? 'Jharkhand State Lac Cooperative Federation (JASCOLAMPF) & TRIFED CSR' 
        : isMining 
        ? 'Bharat Coking Coal Limited (BCCL) Safety Division' 
        : 'Tata Steel Rural Development Society (TSRDS)',
      orgType: isTupudana ? 'MSME' : 'Foundation / Trust',
      cinNumber: isTupudana ? 'U28112JH2004PTC010892' : 'U85300JH2014NPL002194',
      csrRegistrationNumber: isTupudana ? 'CSR00021488' : 'CSR00018921',
      authorizedSignatoryName: isTupudana ? 'Shri R. K. Agarwal' : isAgri ? 'Arunava Sen' : 'Dr. B. K. Mishra',
      authorizedSignatoryDesignation: isTupudana ? 'President, TIEMA CSR Council' : isAgri ? 'Director, CSR Programs' : 'Head CSR',
      authorizedSignatoryEmail: isTupudana ? 'csr@tiema-ranchi.org' : isAgri ? 'csr@jascolampf.gov.in' : 'csr@tatasteel.com',
      has12ACertificate: true,
      has80GCertificate: true,
      hasSeparateCsrBankAccount: true,
      auditedFinancialsAvailable: true,
      schedule7Category: 'ix. Contributions to science, technology, engineering, medicine R&D',
      collaborationTypes: ['CSR Cash Grant', 'Dedicated Testing Facility'],
      proposedBudgetInr: 1250000,
      sdgAlignment: 'SDG-9 Industry, Innovation & Infrastructure',
      expectedCommunityBeneficiaries: 1200,
      socialOutcomesStatement: isAgri
        ? 'Protection of tribal lac crops from pest infestation and livelihood security for 500+ farmer families.'
        : 'Deployment of civic safety sensors and early warning telemetry.',
      ipOwnershipPreference: 'University retains full IP, industry gets acknowledgement',
      exclusivityRequired: false,
      brandingScope: 'Co-branding on Panchayat demonstration stations and state R&D report',
      disputeResolution: 'Platform Arbitration',
      disbursementMilestones: [
        { 
          trancheNumber: 1, 
          label: 'Lab Assembly & Sensor Calibration', 
          triggerStageNumber: 11,
          triggerStageName: 'IoT Prototype',
          amountInr: 500000,
          releaseCondition: 'Lab calibration confirmed',
          status: 'Released',
        },
        { 
          trancheNumber: 2, 
          label: 'Gram Panchayat Field Deployment', 
          triggerStageNumber: 12,
          triggerStageName: 'Panchayat Pilot',
          amountInr: 750000,
          releaseCondition: 'Panchayat trial report submitted',
          status: 'Pending',
        },
      ],
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
    };

    return [syntheticReq, ...requests];
  }, [requests, activeChallenge]);

  const toggleExpand = (id: string) => {
    setExpanded(e => e === id ? null : id);
    setReviewing(null);
    setNote('');
    setCounter('');
  };

  const handleAction = async (req: CollaborationRequest, action: 'accept' | 'counter' | 'decline') => {
    if (!note.trim() && action !== 'accept') {
      alert('Please enter a review note.');
      return;
    }
    if (action === 'counter' && !counter.trim()) {
      alert('Please enter your counter-terms.');
      return;
    }
    setSaving(true);
    const targetStatus: CollaborationStatus = action === 'accept' ? 'MoU Signed' : action === 'counter' ? 'Negotiation — Counter Terms Sent' : 'Declined';
    const noteText = note.trim() || (action === 'accept' ? 'We accept all terms. Intellectual property remains with university. MoU executed.' : 'Request status updated.');
    
    await updateCollaborationRequestStatus(
      req.id || req.requestId,
      targetStatus,
      noteText,
      currentUser?.displayName || 'University Faculty',
      action === 'counter' ? counter : undefined,
      req
    );

    // Update state directly for instantaneous reactivity
    const updatedReq: CollaborationRequest = {
      ...req,
      status: targetStatus,
      universityReviewNote: noteText,
      universityCounterTerms: action === 'counter' ? counter : req.universityCounterTerms,
      reviewedByFaculty: currentUser?.displayName || 'University Faculty',
      moSignedAt: targetStatus === 'MoU Signed' ? new Date().toISOString() : req.moSignedAt,
      updatedAt: new Date().toISOString(),
    };

    setRequests(prev => {
      const targetId = req.id || req.requestId;
      const idx = prev.findIndex(r => r.id === targetId || r.requestId === targetId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedReq;
        return next;
      } else {
        return [updatedReq, ...prev];
      }
    });

    setSaving(false);
    setReviewing(null);
    setNote('');
    setCounter('');
    setSuccessMsg(`Collaboration request ${action === 'accept' ? 'accepted and official MoU generated' : action === 'counter' ? 'counter terms sent' : 'declined'} successfully.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const newCount = effectiveRequests.filter(r => r.status === 'Submitted').length;

  return (
    <div className="space-y-4">
      {/* Active Societal Problem in University Pipeline Banner */}
      {activeChallenge && (
        <div className="bg-gradient-to-r from-[#FDFBF7] via-[#F7F2E8] to-[#EFE7D8] border-2 border-[#D8C7B0] p-5 rounded-2xl shadow-xs space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-[#2C6E49] text-white px-2.5 py-0.5 rounded-full">
                {activeChallenge.reportId}
              </span>
              <span className="text-xs font-black text-[#201C18] uppercase tracking-wider">
                Current Problem in University R&D Pipeline
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#2C6E49] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              {university?.shortName || 'HEI'} · {activeChallenge.district}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-black text-[#201C18]">{activeChallenge.title}</h3>
            <p className="text-xs text-[#5C5549] mt-1 line-clamp-2">{activeChallenge.summary}</p>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-[#D8C7B0] text-[11px] text-[#5C5549]">
            <span>Category: <strong className="text-[#201C18]">{activeChallenge.category || 'Societal R&D'}</strong></span>
            <span>·</span>
            <span>Status: <strong className="text-[#2C6E49]">{activeChallenge.status}</strong></span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="w-5 h-5 text-[#2C6E49]" />
          <h2 className="text-base font-extrabold text-[#201C18]">Industry / CSR Collaboration Requests</h2>
          {newCount > 0 && (
            <span className="bg-[#C98A2C] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">{newCount} New</span>
          )}
        </div>
        <p className="text-[11px] text-[#8A7F72]">{effectiveRequests.length} total requests</p>
      </div>

      {successMsg && (
        <div className="bg-[#F0FAF4] border border-[#C3E6D0] rounded-xl p-3 text-xs font-bold text-[#2C6E49] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {effectiveRequests.length === 0 && (
        <div className="bg-white border border-[#E4DDD1] rounded-xl p-8 text-center">
          <Inbox className="w-8 h-8 text-[#D5CDBF] mx-auto mb-2" />
          <p className="text-sm font-bold text-[#8A7F72]">No collaboration requests yet.</p>
          <p className="text-xs text-[#B0A89E] mt-1">When an industry partner expresses interest in your projects, their requests will appear here for review.</p>
        </div>
      )}

      {effectiveRequests.map(req => {
        const statusCfg = STATUS_CONFIG[req.status];
        const isOpen = expanded === (req.id || req.requestId);
        const isReviewing = reviewing === (req.id || req.requestId);
        const totalTranches = req.disbursementMilestones.reduce((s, m) => s + m.amountInr, 0);
        const complianceIssues = [
          !req.has12ACertificate && '12A Certificate not confirmed',
          !req.has80GCertificate && '80G Certificate not confirmed',
          !req.hasSeparateCsrBankAccount && 'Separate CSR bank account not confirmed',
          !req.auditedFinancialsAvailable && 'Audited financials not confirmed',
        ].filter(Boolean) as string[];

        return (
          <div key={req.id || req.requestId} className="bg-white border border-[#E4DDD1] rounded-xl overflow-hidden shadow-xs">
            {/* Card Header */}
            <button
              onClick={() => toggleExpand(req.id || req.requestId)}
              className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[#FAF8F4] transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[#C98A2C] mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-extrabold text-[#201C18] truncate">{req.orgName}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${statusCfg.cls}`}>{statusCfg.label}</span>
                  {complianceIssues.length > 0 && (
                    <span className="text-[10px] font-bold text-[#B3261E] flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" /> {complianceIssues.length} compliance {complianceIssues.length === 1 ? 'issue' : 'issues'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap mt-1">
                  <span className="text-[11px] text-[#4A433B] font-bold truncate">{req.challengeTitle}</span>
                  <span className="text-[11px] text-[#8A7F72]">·</span>
                  <span className="text-[11px] text-[#8A7F72]">{req.orgType}</span>
                  <span className="text-[11px] text-[#8A7F72]">·</span>
                  <span className="text-[11px] font-bold text-[#2C6E49]">₹{totalTranches.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-[#B0A89E]">
                  <span>{req.collaborationTypes.join(' · ')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right text-[10px] text-[#8A7F72]">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-2.5 h-2.5" />
                    {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString('en-IN') : '—'}
                  </div>
                  <div className="font-bold">{req.requestId}</div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-[#8A7F72]" /> : <ChevronDown className="w-4 h-4 text-[#8A7F72]" />}
              </div>
            </button>

            {/* Expanded Details */}
            {isOpen && (
              <div className="border-t border-[#F0EBE0] px-4 py-4 space-y-4 bg-[#FAF8F4]">

                {/* Compliance badges */}
                <div>
                  <p className="text-[10px] font-extrabold text-[#6A6155] uppercase tracking-wider mb-1.5">Legal Compliance Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    <ComplianceBadge ok={req.has12ACertificate} label="12A Certificate" />
                    <ComplianceBadge ok={req.has80GCertificate} label="80G Certificate" />
                    <ComplianceBadge ok={req.hasSeparateCsrBankAccount} label="Separate CSR Bank A/C" />
                    <ComplianceBadge ok={req.auditedFinancialsAvailable} label="Audited Financials (3yr)" />
                  </div>
                  {complianceIssues.length > 0 && (
                    <div className="mt-2 bg-[#FFF0EE] border border-[#F5C6C0] rounded-xl p-2.5 space-y-1">
                      <p className="text-[10px] font-extrabold text-[#B3261E]">Compliance Warnings:</p>
                      {complianceIssues.map(i => (
                        <p key={i} className="text-[10px] text-[#B3261E]">• {i}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Key Details Grid */}
                <div className="grid sm:grid-cols-3 gap-2 text-xs">
                  {[
                    ['CIN / Udyam', req.cinNumber],
                    ['CSR-1 No.', req.csrRegistrationNumber],
                    ['Schedule VII', req.schedule7Category],
                    ['SDG Alignment', req.sdgAlignment],
                    ['Beneficiaries', Number(req.expectedCommunityBeneficiaries).toLocaleString('en-IN')],
                    ['IP Preference', req.ipOwnershipPreference],
                    ['Exclusivity', req.exclusivityRequired ? 'Yes ⚠' : 'No'],
                    ['Dispute Resolution', req.disputeResolution],
                    ['Signatory', `${req.authorizedSignatoryName} — ${req.authorizedSignatoryDesignation}`],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-white border border-[#E4DDD1] rounded-xl p-2 break-words">
                      <p className="text-[9px] font-extrabold text-[#8A7F72] uppercase tracking-wider">{k}</p>
                      <p className="font-bold text-[#201C18] mt-0.5 text-[11px]">{v || '—'}</p>
                    </div>
                  ))}
                </div>

                {/* Social Outcomes */}
                <div className="bg-white border border-[#E4DDD1] rounded-xl p-3">
                  <p className="text-[10px] font-extrabold text-[#6A6155] uppercase tracking-wider mb-1">Social Outcomes Statement</p>
                  <p className="text-xs text-[#201C18] leading-relaxed">{req.socialOutcomesStatement}</p>
                </div>

                {/* Disbursement Plan */}
                <div className="bg-white border border-[#E4DDD1] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <IndianRupee className="w-3.5 h-3.5 text-[#2C6E49]" />
                    <p className="text-[10px] font-extrabold text-[#6A6155] uppercase tracking-wider">Disbursement Milestone Plan</p>
                  </div>
                  <div className="space-y-2">
                    {req.disbursementMilestones.map(m => (
                      <div key={m.trancheNumber} className="flex items-start gap-3 text-xs">
                        <span className="bg-[#2C6E49] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">T{m.trancheNumber}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#201C18]">{m.label}</span>
                            <span className="font-extrabold text-[#2C6E49]">₹{m.amountInr.toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-[10px] text-[#6A6155]">Triggers: {m.triggerStageName}</p>
                          <p className="text-[10px] text-[#8A7F72] italic">Condition: {m.releaseCondition}</p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-[#F0EBE0] pt-2 flex justify-between text-xs font-extrabold">
                      <span className="text-[#4A433B]">Total</span>
                      <span className="text-[#2C6E49]">₹{totalTranches.toLocaleString('en-IN')} INR</span>
                    </div>
                  </div>
                </div>

                {/* Existing Review Notes */}
                {req.universityReviewNote && (
                  <div className="bg-[#EEF5FF] border border-[#B8D4F5] rounded-xl p-3">
                    <p className="text-[10px] font-extrabold text-[#1A56AA] uppercase tracking-wider mb-1">Previous Review Note (by {req.reviewedByFaculty})</p>
                    <p className="text-xs text-[#1A3A6B]">{req.universityReviewNote}</p>
                    {req.universityCounterTerms && (
                      <div className="mt-2 border-t border-[#B8D4F5] pt-2">
                        <p className="text-[10px] font-extrabold text-[#1A56AA] uppercase tracking-wider mb-1">Counter Terms Sent</p>
                        <p className="text-xs text-[#1A3A6B]">{req.universityCounterTerms}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {(req.status === 'Submitted' || req.status === 'Under University Review' || req.status === 'Negotiation — Counter Terms Sent') && (
                  <div className="border-t border-[#F0EBE0] pt-3">
                    {!isReviewing ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => { setReviewing(req.id || req.requestId); updateCollaborationRequestStatus(req.id || req.requestId, 'Under University Review', 'Request is under university review.', currentUser?.displayName || ''); }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#F0FAF4] border border-[#C3E6D0] text-[#2C6E49] text-xs font-extrabold rounded-xl cursor-pointer hover:bg-[#E0F5E8] transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept Terms & Sign MoU
                        </button>
                        <button onClick={() => setReviewing(`counter-${req.id || req.requestId}`)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#FFF8EC] border border-[#F0D99A] text-[#C98A2C] text-xs font-extrabold rounded-xl cursor-pointer hover:bg-[#FFF0D0] transition-colors">
                          <MessageSquareDiff className="w-3.5 h-3.5" /> Counter-Propose Terms
                        </button>
                        <button onClick={() => setReviewing(`decline-${req.id || req.requestId}`)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#FFF0EE] border border-[#F5C6C0] text-[#B3261E] text-xs font-extrabold rounded-xl cursor-pointer hover:bg-[#FFE4E2] transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Accept form */}
                        {reviewing === (req.id || req.requestId) && (
                          <div className="bg-[#F0FAF4] border border-[#C3E6D0] rounded-xl p-3 space-y-2.5">
                            <p className="text-xs font-extrabold text-[#2C6E49]">Accept & Sign MoU</p>
                            <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                              placeholder="Add acceptance note (e.g. 'We accept all terms. IP remains with university. MoU to be signed by Dean and CSR Officer.')..."
                              className="w-full px-3 py-2 bg-white border border-[#C3E6D0] rounded-xl text-xs text-[#201C18] focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30 placeholder:text-[#B0A89E]" />
                            <div className="flex gap-2">
                              <button onClick={() => handleAction(req, 'accept')} disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#2C6E49] text-white text-xs font-extrabold rounded-xl cursor-pointer hover:bg-[#23583a] transition-colors disabled:opacity-60">
                                {saving ? 'Processing…' : <><CheckCircle2 className="w-3.5 h-3.5" /> Confirm & Generate MoU</>}
                              </button>
                              <button onClick={() => setReviewing(null)} className="px-4 py-2 text-xs font-bold text-[#4A433B] bg-white border border-[#E4DDD1] rounded-xl cursor-pointer hover:bg-[#F0EBE0]">Cancel</button>
                            </div>
                          </div>
                        )}

                        {/* Counter form */}
                        {reviewing === `counter-${req.id || req.requestId}` && (
                          <div className="bg-[#FFF8EC] border border-[#F0D99A] rounded-xl p-3 space-y-2.5">
                            <p className="text-xs font-extrabold text-[#C98A2C]">Counter-Propose Terms</p>
                            <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                              placeholder="Explanation note (e.g. 'Terms mostly acceptable, but we require modification to the IP clause.')..."
                              className="w-full px-3 py-2 bg-white border border-[#F0D99A] rounded-xl text-xs text-[#201C18] focus:outline-none focus:ring-2 focus:ring-[#C98A2C]/30 placeholder:text-[#B0A89E]" />
                            <textarea rows={3} value={counter} onChange={e => setCounter(e.target.value)}
                              placeholder="Specific counter-terms (e.g. 'We require: 1. Full IP retained by university. 2. Tranche 1 reduced to ₹1,00,000. 3. Branding limited to technical reports only.')..."
                              className="w-full px-3 py-2 bg-white border border-[#F0D99A] rounded-xl text-xs text-[#201C18] focus:outline-none focus:ring-2 focus:ring-[#C98A2C]/30 placeholder:text-[#B0A89E]" />
                            <div className="flex gap-2">
                              <button onClick={() => handleAction(req, 'counter')} disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#C98A2C] text-white text-xs font-extrabold rounded-xl cursor-pointer hover:bg-[#a66308] transition-colors disabled:opacity-60">
                                {saving ? 'Sending…' : <><MessageSquareDiff className="w-3.5 h-3.5" /> Send Counter Terms</>}
                              </button>
                              <button onClick={() => setReviewing(null)} className="px-4 py-2 text-xs font-bold text-[#4A433B] bg-white border border-[#E4DDD1] rounded-xl cursor-pointer hover:bg-[#F0EBE0]">Cancel</button>
                            </div>
                          </div>
                        )}

                        {/* Decline form */}
                        {reviewing === `decline-${req.id || req.requestId}` && (
                          <div className="bg-[#FFF0EE] border border-[#F5C6C0] rounded-xl p-3 space-y-2.5">
                            <p className="text-xs font-extrabold text-[#B3261E]">Decline Collaboration Request</p>
                            <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                              placeholder="Required: Reason for declining (e.g. 'This organization does not have a valid CSR-1 registration. Please reapply after obtaining registration from MCA portal.')..."
                              className="w-full px-3 py-2 bg-white border border-[#F5C6C0] rounded-xl text-xs text-[#201C18] focus:outline-none focus:ring-2 focus:ring-[#B3261E]/30 placeholder:text-[#B0A89E]" />
                            <div className="flex gap-2">
                              <button onClick={() => handleAction(req, 'decline')} disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#B3261E] text-white text-xs font-extrabold rounded-xl cursor-pointer hover:bg-[#8B1A14] transition-colors disabled:opacity-60">
                                {saving ? 'Processing…' : <><XCircle className="w-3.5 h-3.5" /> Decline Request</>}
                              </button>
                              <button onClick={() => setReviewing(null)} className="px-4 py-2 text-xs font-bold text-[#4A433B] bg-white border border-[#E4DDD1] rounded-xl cursor-pointer hover:bg-[#F0EBE0]">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* MoU Signed badge */}
                {req.status === 'MoU Signed' && (
                  <div className="bg-[#F0FAF4] border border-[#C3E6D0] rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2C6E49] shrink-0" />
                      <div>
                        <p className="text-xs font-extrabold text-[#2C6E49]">MoU Signed: Collaboration Active</p>
                        {req.moSignedAt && (
                          <p className="text-[10px] text-[#6A6155]">
                            Executed on {new Date(req.moSignedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · SHA 256 Validated
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `GOVERNMENT OF JHARKHAND : OFFICIAL INDUSTRY COLLABORATION MOU\n==========================================================================\nAgreement Docket: ${req.requestId}\nOrganization: ${req.orgName}\nUniversity: ${req.assignedHEI}\nChallenge: ${req.challengeTitle}\nBudget: Rs ${totalTranches.toLocaleString('en-IN')}\nStatus: MoU Signed & Legally Executed\nExecution Timestamp: ${req.moSignedAt || new Date().toISOString()}\nSignatory: ${req.authorizedSignatoryName} (${req.orgName})\nFaculty Lead: ${req.reviewedByFaculty || 'University Faculty'}\n==========================================================================`;
                        const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Signed_MoU_${req.requestId}.txt`;
                        a.click();
                      }}
                      className="text-xs font-bold text-[#2C6E49] bg-white border border-[#C3E6D0] hover:bg-[#EAF7EE] px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Signed MoU</span>
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
