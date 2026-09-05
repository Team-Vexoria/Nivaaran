import React, { useState } from 'react';
import { Rocket, CheckCircle2, Building2, ClipboardCheck, MapPin } from 'lucide-react';
import { workflowStore, STORE_EVENT } from '../../services/workflowStore';
import { Challenge } from '../../services/workflowTypes';

interface DeploymentApprovalTabProps {
  officerName: string;
  showToast: (text: string, type?: 'success' | 'warning') => void;
}

export const DeploymentApprovalTab: React.FC<DeploymentApprovalTabProps> = ({ officerName, showToast }) => {
  const [challenges, setChallenges] = useState<Challenge[]>(workflowStore.getChallenges());

  React.useEffect(() => {
    const handler = () => setChallenges(workflowStore.getChallenges());
    window.addEventListener(STORE_EVENT, handler);
    return () => window.removeEventListener(STORE_EVENT, handler);
  }, []);

  const candidates = challenges.filter(c => c.status === 'Outcome Audit');
  const approved = challenges.filter(c => c.status === 'Resolved' || c.status === 'Closed');

  const handleApprove = async (challenge: Challenge) => {
    const id = challenge.id || challenge.reportId;
    const proj = workflowStore.getProjects().find(p => p.challengeId === id || p.challengeId === challenge.reportId);
    const res = await workflowStore.transitionChallenge(
      id,
      'Resolved',
      officerName,
      'Government Department',
      `Deployment approved by ${officerName}. Solution cleared for field deployment.`,
    );
    if (res.success) {
      if (proj) {
        workflowStore.updateProject(proj.id, { status: 'Completed' });
      }
      showToast(`✓ Deployment approved — "${challenge.title}" is now Resolved.`);
    } else {
      showToast(`Unable to approve deployment: ${res.reason}`, 'warning');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-lg font-black text-[#201C18] flex items-center gap-2">
          <Rocket className="w-5 h-5 text-[#2C6E49]" />
          Deployment Approval — Stage 14
        </h2>
        <p className="text-xs text-[#6A6155]">
          Review validated outcome audits and grant final field-deployment clearance. Approved solutions are marked{' '}
          <strong className="text-[#B3261E]">Resolved</strong>.
        </p>
      </div>

      {candidates.length === 0 ? (
        <div className="bg-white border border-[#E4DDD1] rounded-xl p-12 text-center">
          <ClipboardCheck className="w-8 h-8 text-[#C98A2C] mx-auto mb-3" />
          <p className="text-sm font-bold text-[#4A433B]">No challenges awaiting deployment approval.</p>
          <p className="text-xs text-[#8A7F72] mt-1">
            Challenges appear here once they reach the <strong>Outcome Audit</strong> stage (Stage 13).
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map(challenge => {
            const id = challenge.id || challenge.reportId;
            const proj = workflowStore.getProjects().find(p => p.challengeId === id || p.challengeId === challenge.reportId);
            const audit = proj?.outcomeAudit;
            const metrics = audit?.metrics || {};
            const metricEntries = Object.entries(metrics);
            return (
              <div key={id} className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-extrabold text-[#8A7F72] font-mono bg-[#F3EDE2] px-2 py-0.5 rounded border border-[#E4DDD1]">{challenge.reportId}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#B3261E] text-white">Outcome Audit Complete</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#201C18] leading-tight">{challenge.title}</h3>
                  </div>
                  <button
                    onClick={() => handleApprove(challenge)}
                    className="flex items-center gap-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-extrabold py-2 px-4 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve Deployment
                  </button>
                </div>

                <div className="flex items-center gap-4 flex-wrap text-[11px] text-[#6A6155]">
                  {proj && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-[#2C6E49]" />
                      <strong className="font-bold text-[#4A433B]">{proj.universityName}</strong>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {challenge.district}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClipboardCheck className="w-3 h-3 text-[#C98A2C]" />
                    {proj ? `${proj.facultyMentorName} (Faculty Mentor)` : 'University R&D'}
                  </span>
                </div>

                {audit?.summary && (
                  <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg px-3 py-2 text-[11px] text-[#5A5247] italic">
                    “{audit.summary}”
                  </div>
                )}

                {metricEntries.length > 0 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {metricEntries.map(([k, v]) => (
                      <div key={k} className="bg-[#F0FAF4] border border-[#C3E6D0] rounded-lg px-3 py-2 text-center">
                        <p className="text-lg font-black text-[#2C6E49]">{String(v)}</p>
                        <p className="text-[9px] text-[#5A7A66] font-semibold uppercase tracking-wider">{k}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {approved.length > 0 && (
        <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs">
          <p className="text-xs font-extrabold text-[#2C6E49] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Deployed Solutions ({approved.length})
          </p>
          <div className="space-y-2">
            {approved.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg px-3 py-2 text-xs">
                <span className="font-semibold text-[#201C18] truncate">{c.title}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                  c.status === 'Closed' ? 'bg-[#2C6E49] text-white' : 'bg-[#B3261E] text-white'
                }`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
