import React, { useState } from 'react';
import { Archive, MapPin, MessageSquare, X, ShieldCheck } from 'lucide-react';
import { workflowStore, STORE_EVENT } from '../../services/workflowStore';
import { Challenge } from '../../services/workflowTypes';

interface ClosureTabProps {
  officerName: string;
  showToast: (text: string, type?: 'success' | 'warning') => void;
}

export const ClosureTab: React.FC<ClosureTabProps> = ({ officerName, showToast }) => {
  const [challenges, setChallenges] = useState<Challenge[]>(workflowStore.getChallenges());
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState('');

  React.useEffect(() => {
    const handler = () => setChallenges(workflowStore.getChallenges());
    window.addEventListener(STORE_EVENT, handler);
    return () => window.removeEventListener(STORE_EVENT, handler);
  }, []);

  const closable = challenges.filter(c => c.status === 'Resolved');
  const archived = challenges.filter(c => c.status === 'Closed');

  const handleClose = (challenge: Challenge) => {
    const id = challenge.id || challenge.reportId;
    const res = workflowStore.transitionChallenge(
      id,
      'Closed',
      officerName,
      'Government Department',
      note.trim() || `Challenge closed and archived by ${officerName}. Impact measured.`,
    );
    if (res.success) {
      showToast(`✓ "${challenge.title}" marked as Closed and archived.`);
    } else {
      showToast(`Unable to close: ${res.reason}`, 'warning');
    }
    setNoteFor(null);
    setNote('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-lg font-black text-[#201C18] flex items-center gap-2">
          <Archive className="w-5 h-5 text-[#2C6E49]" />
          Closure & Archive — Stage 16
        </h2>
        <p className="text-xs text-[#6A6155]">
          Record lessons learned and archive fully-deployed solutions. Closed challenges are retained in the permanent impact ledger.
        </p>
      </div>

      {/* Closable (Resolved) challenges */}
      <div className="space-y-4">
        {closable.length === 0 ? (
          <div className="bg-white border border-[#E4DDD1] rounded-xl p-10 text-center">
            <ShieldCheck className="w-8 h-8 text-[#C98A2C] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#4A433B]">No Resolved challenges ready for closure.</p>
            <p className="text-xs text-[#8A7F72] mt-1">Approve deployments first in the Deployment Approval tab.</p>
          </div>
        ) : (
          closable.map(challenge => {
            const id = challenge.id || challenge.reportId;
            const proj = workflowStore.getProjects().find(p => p.challengeId === id || p.challengeId === challenge.reportId);
            return (
              <div key={id} className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-extrabold text-[#8A7F72] font-mono bg-[#F3EDE2] px-2 py-0.5 rounded border border-[#E4DDD1]">{challenge.reportId}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#B3261E] text-white">Resolved</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#201C18]">{challenge.title}</h3>
                    <p className="text-[11px] text-[#6A6155] flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {challenge.district} {proj ? `· ${proj.universityName}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => { setNoteFor(id); setNote(''); }}
                    className="flex items-center gap-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-extrabold py-2 px-4 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Mark as Closed
                  </button>
                </div>

                {noteFor === id && (
                  <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 space-y-2">
                    <label className="text-[10px] font-bold text-[#6A6155] uppercase tracking-wider block">
                      Lessons Learned / Closure Note (visible to all)
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder={`Record key learnings, measurable impact, and handover details for ${challenge.title}…`}
                      className="w-full border border-[#E4DDD1] rounded-xl px-3 py-2 text-xs text-[#201C18] bg-white focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30 resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setNoteFor(null)}
                        className="px-3 py-1.5 text-xs font-bold text-[#4A433B] bg-[#EAE4D8] hover:bg-[#DFD8CA] border border-[#E4DDD1] rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                      <button
                        onClick={() => handleClose(challenge)}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-extrabold text-white bg-[#2C6E49] hover:bg-[#23583a] rounded-lg cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" /> Confirm Closure & Archive
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Archived read-only ledger */}
      <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs">
        <p className="text-xs font-extrabold text-[#2C6E49] uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Archive className="w-3.5 h-3.5" /> Closed & Archived Ledger ({archived.length})
        </p>
        {archived.length === 0 ? (
          <p className="text-xs text-[#8A7F72]">No challenges have been closed yet.</p>
        ) : (
          <div className="space-y-2">
            {archived.map(c => (
              <div key={c.id} className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg px-3 py-2 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-[#201C18] text-xs">{c.title}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#2C6E49] text-white shrink-0">Closed</span>
                </div>
                {c.govtOfficerNote && (
                  <p className="text-[10px] text-[#5A5247] flex items-start gap-1.5">
                    <MessageSquare className="w-3 h-3 mt-0.5 shrink-0 text-[#C98A2C]" />
                    {c.govtOfficerNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
