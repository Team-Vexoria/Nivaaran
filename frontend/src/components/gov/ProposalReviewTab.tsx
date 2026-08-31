import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Undo2,
  XCircle,
  Building2,
  Clock,
  IndianRupee,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  subscribeToProjects,
  govApproveProposal,
  govRequestProposalRevision,
  govRejectProposal,
  ProjectDoc,
} from '../../services/firebaseService';

interface ProposalReviewTabProps {
  officerName: string;
}

type ActionType = 'approve' | 'revision' | 'reject';
interface ReviewModalState {
  type: ActionType;
  projectId: string;
  proposalId: string;
  title: string;
}

const ACTION_META: Record<ActionType, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  approve: { label: 'Approve Proposal', color: 'bg-[#2C6E49] hover:bg-[#23583a]', icon: CheckCircle2 },
  revision: { label: 'Request Revision', color: 'bg-[#C98A2C] hover:bg-[#a97224]', icon: Undo2 },
  reject: { label: 'Reject Proposal', color: 'bg-[#B91C1C] hover:bg-[#991b1b]', icon: XCircle },
};

const STATUS_PILL: Record<string, string> = {
  'Submitted': 'bg-[#FFF8EC] text-[#C98A2C] border-[#F0D99A]',
  'Under Review': 'bg-[#EAF1FF] text-[#2B5BA8] border-[#C4D8F5]',
  'Revision Requested': 'bg-[#FFF8EC] text-[#C98A2C] border-[#F0D99A]',
  'Approved': 'bg-[#F0FAF4] text-[#2C6E49] border-[#C3E6D0]',
  'Rejected': 'bg-[#FFF0EE] text-[#B91C1C] border-[#F5C6C0]',
  'Draft': 'bg-[#F3EDE2] text-[#6A6155] border-[#E4DDD1]',
};

export const ProposalReviewTab: React.FC<ProposalReviewTabProps> = ({ officerName }) => {
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [modal, setModal] = useState<ReviewModalState | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    const unsub = subscribeToProjects(setProjects);
    return () => unsub();
  }, []);

  // All projects carrying at least one proposal
  const projectsWithProposals = projects.filter(p => p.proposals && p.proposals.length > 0);
  const pendingCount = projectsWithProposals.reduce(
    (acc, p) => acc + (p.proposals || []).filter(pr => pr.status === 'Submitted').length,
    0
  );

  // Reviewed proposals (anything no longer in "Submitted")
  const reviewed = projectsWithProposals
    .flatMap(p => (p.proposals || []).map(pr => ({ project: p, proposal: pr })))
    .filter(({ proposal }) => proposal.status !== 'Submitted')
    .sort((a, b) => (b.proposal.submittedAt || '').localeCompare(a.proposal.submittedAt || ''));

  const openModal = (type: ActionType, project: ProjectDoc, proposal: { id: string; title: string }) => {
    setModal({ type, projectId: project.id || '', proposalId: proposal.id, title: proposal.title });
    setNote('');
  };

  const confirmAction = () => {
    if (!modal) return;
    const { type, projectId, proposalId } = modal;
    let ok = false;
    if (type === 'approve') ok = govApproveProposal(projectId, proposalId, note, officerName);
    else if (type === 'revision') ok = govRequestProposalRevision(projectId, proposalId, note, officerName);
    else ok = govRejectProposal(projectId, proposalId, note, officerName);
    setModal(null);
    return ok;
  };

  const statusPill = (status: string) =>
    `text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_PILL[status] || STATUS_PILL['Draft']}`;

  const meta = modal ? ACTION_META[modal.type] : null;
  const MetaIcon = meta?.icon || CheckCircle2;

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-[#2C6E49] bg-[#2C6E49]/10 px-2.5 py-0.5 rounded-full border border-[#2C6E49]/25 uppercase tracking-wider">
              Stage 9 · Technical Proposal Review
            </span>
            {pendingCount > 0 && (
              <span className="text-[10px] font-bold text-[#B3261E] bg-[#FFF0EE] border border-[#F5C6C0] px-2 py-0.5 rounded-full">
                {pendingCount} awaiting review
              </span>
            )}
          </div>
          <h2 className="text-lg font-black text-[#201C18] mt-1">University Proposal Review Board</h2>
          <p className="text-xs text-[#6A6155] max-w-2xl leading-relaxed">
            Review technical proposals submitted by matched university R&D teams. Approve to begin prototype
            development, request revisions to refine the submission, or reject to send the team back to the
            drawing board.
          </p>
        </div>
      </div>

      {projectsWithProposals.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-[#E4DDD1] text-center space-y-3 shadow-2xs">
          <FileText className="w-10 h-10 text-[#8A7F72] mx-auto" />
          <h3 className="text-base font-bold text-[#201C18]">No Proposals Submitted Yet</h3>
          <p className="text-xs text-[#6A6155] max-w-md mx-auto">
            When a matched university accepts a challenge and assembles a team, they will submit a technical
            proposal here for your review.
          </p>
        </div>
      ) : (
        <>
          {/* ── Pending Review ── */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-[#8A7F72]">
              Pending Review
            </h3>
            {projectsWithProposals
              .flatMap(p => (p.proposals || []).map(pr => ({ project: p, proposal: pr })))
              .filter(({ proposal }) => proposal.status === 'Submitted')
              .map(({ project, proposal }) => (
                <div key={proposal.id} className="bg-white border border-[#F0D99A] rounded-xl p-5 space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[10px] font-extrabold text-[#8A7F72] font-mono bg-[#F3EDE2] px-2 py-0.5 rounded border border-[#E4DDD1]">
                          {proposal.id}
                        </span>
                        <span className={statusPill(proposal.status)}>{proposal.status}</span>
                        <span className="text-[10px] font-bold text-[#2C6E49] bg-[#F0FAF4] border border-[#C3E6D0] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Building2 className="w-2.5 h-2.5" />
                          {project.universityName}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#201C18] leading-tight">{proposal.title}</h3>
                      <p className="text-[11px] text-[#6A6155] mt-0.5">
                        {project.challengeTitle} · {project.district}
                      </p>
                    </div>
                    <button
                      onClick={() => openModal('approve', project, proposal)}
                      className="flex items-center gap-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-extrabold py-2 px-4 rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Review
                    </button>
                  </div>

                  <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg px-3 py-2 text-[11px] text-[#4A433B] leading-relaxed">
                    <span className="font-bold text-[#8A7F72] uppercase text-[9px] tracking-wider">Technical Approach: </span>
                    {proposal.approach}
                  </div>

                  <div className="flex items-center gap-4 flex-wrap text-[11px] text-[#6A6155]">
                    <span className="flex items-center gap-1 font-semibold text-[#201C18]">
                      <IndianRupee className="w-3 h-3 text-[#C98A2C]" />
                      ₹{(proposal.estimatedBudget || 0).toLocaleString('en-IN')} budgeted
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Timeline: {proposal.estimatedTimeline}
                    </span>
                    {proposal.submittedBy && (
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Submitted by {proposal.submittedBy}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* ── Reviewed ── */}
          {reviewed.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-[#8A7F72]">
                Reviewed
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {reviewed.map(({ project, proposal }) => (
                  <div key={proposal.id} className="bg-white border border-[#E4DDD1] rounded-xl p-4 space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold text-[#8A7F72] font-mono bg-[#F3EDE2] px-2 py-0.5 rounded border border-[#E4DDD1]">
                        {proposal.id}
                      </span>
                      <span className={statusPill(proposal.status)}>{proposal.status}</span>
                    </div>
                    <p className="text-xs font-bold text-[#201C18] leading-tight">{proposal.title}</p>
                    <p className="text-[11px] text-[#6A6155]">{project.universityName}</p>
                    {proposal.reviewNote && (
                      <div className="flex items-start gap-1.5 text-[11px] text-[#4A433B] bg-[#F3EDE2] border border-[#E4DDD1] rounded-lg px-3 py-2">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-[#C98A2C]" />
                        <span>{proposal.reviewNote}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Review Modal ── */}
      {modal && meta && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MetaIcon className={`w-4 h-4 ${modal.type === 'approve' ? 'text-[#2C6E49]' : modal.type === 'reject' ? 'text-[#B91C1C]' : 'text-[#C98A2C]'}`} />
              <h3 className="text-base font-black text-[#201C18]">{meta.label}</h3>
            </div>
            <p className="text-xs text-[#6A6155]">{modal.title}</p>
            {modal.type === 'approve' && (
              <p className="text-[11px] text-[#2C6E49] bg-[#F0FAF4] border border-[#C3E6D0] rounded-lg px-3 py-2 leading-relaxed">
                Approving advances the challenge to <strong>Prototype Active (Stage 11)</strong> and marks the
                proposal as approved — the team begins building the working solution.
              </p>
            )}
            {modal.type === 'revision' && (
              <p className="text-[11px] text-[#C98A2C] bg-[#FFF8EC] border border-[#F0D99A] rounded-lg px-3 py-2 leading-relaxed">
                The challenge stays at <strong>Proposal Submitted (Stage 9)</strong> and the university is asked
                to refine the technical proposal.
              </p>
            )}
            {modal.type === 'reject' && (
              <p className="text-[11px] text-[#B91C1C] bg-[#FFF0EE] border border-[#F5C6C0] rounded-lg px-3 py-2 leading-relaxed">
                Rejecting reverts the challenge to <strong>In Progress (Stage 8)</strong> so the team can rework
                its approach and resubmit.
              </p>
            )}
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={`Officer note for ${meta.label.toLowerCase()}…`}
              rows={3}
              className="w-full text-sm border border-[#E4DDD1] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal(null)}
                className="text-xs font-bold text-[#6A6155] bg-[#F3EDE2] hover:bg-[#EAE4D8] px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex items-center gap-1.5 text-white text-xs font-extrabold py-2 px-4 rounded-lg transition-colors ${meta.color} cursor-pointer`}
              >
                <MetaIcon className="w-3.5 h-3.5" />
                {meta.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
