import React, { useState } from 'react';
import { Layers, CheckCircle2, ChevronDown, ChevronRight, X, MapPin, AlertTriangle } from 'lucide-react';
import { workflowStore, STORE_EVENT } from '../../services/workflowStore';
import { Challenge } from '../../services/workflowTypes';

interface ClusterReviewTabProps {
  officerName: string;
  showToast: (text: string, type?: 'success' | 'warning') => void;
}

export const ClusterReviewTab: React.FC<ClusterReviewTabProps> = ({ officerName, showToast }) => {
  const [challenges, setChallenges] = useState<Challenge[]>(workflowStore.getChallenges());
  const [expanded, setExpanded] = useState<string | null>(null);

  React.useEffect(() => {
    const handler = () => setChallenges(workflowStore.getChallenges());
    window.addEventListener(STORE_EVENT, handler);
    return () => window.removeEventListener(STORE_EVENT, handler);
  }, []);

  // Group by clusterId (excluding null)
  const clusters = new Map<string, Challenge[]>();
  challenges.forEach(c => {
    if (c.clusterId) {
      const list = clusters.get(c.clusterId) || [];
      list.push(c);
      clusters.set(c.clusterId, list);
    }
  });

  const clusterList = Array.from(clusters.entries());

  const handleConfirm = async (clusterId: string) => {
    const members = clusters.get(clusterId) || [];
    let ok = 0;
    for (const c of members) {
      const id = c.id || c.reportId;
      const res = await workflowStore.transitionChallenge(id, 'Clustered', officerName, 'Government Department',
        `Cluster ${clusterId} confirmed by ${officerName}. Similar challenges grouped for unified response.`);
      if (res.success) ok++;
    }
    showToast(ok > 0
      ? `✓ Cluster ${clusterId} confirmed — ${ok} challenge${ok > 1 ? 's' : ''} marked as Clustered.`
      : 'Unable to confirm cluster. Check that members are at an eligible stage.',
      ok > 0 ? 'success' : 'warning');
  };

  const handleRemove = (challenge: Challenge) => {
    const id = challenge.id || challenge.reportId;
    workflowStore.updateChallenge(id, { clusterId: undefined });
    showToast(`Removed "${challenge.title}" from its cluster.`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-lg font-black text-[#201C18] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#2C6E49]" />
          Cluster Review — Stage 4
        </h2>
        <p className="text-xs text-[#6A6155]">
          The semantic dedup engine groups similar citizen challenges. Confirm clusters to merge them into a unified response, or remove spurious matches.
        </p>
      </div>

      {clusterList.length === 0 ? (
        <div className="bg-white border border-[#E4DDD1] rounded-xl p-12 text-center">
          <Layers className="w-8 h-8 text-[#C98A2C] mx-auto mb-3" />
          <p className="text-sm font-bold text-[#4A433B]">No active clusters.</p>
          <p className="text-xs text-[#8A7F72] mt-1">
            Challenges grouped by the AI dedup engine appear here once they carry a cluster assignment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {clusterList.map(([clusterId, members]) => {
            const isExpanded = expanded === clusterId;
            const allClustered = members.every(c => c.status === 'Clustered');
            return (
              <div key={clusterId} className="bg-white border border-[#E4DDD1] rounded-2xl shadow-2xs overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : clusterId)}
                  className="w-full flex items-center justify-between gap-3 p-4 hover:bg-[#FAF8F4] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#8A7F72]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#8A7F72]" />
                    )}
                    <div>
                      <p className="text-sm font-extrabold text-[#201C18] flex items-center gap-2">
                        Cluster {clusterId}
                        <span className="text-[10px] font-bold text-[#8A7F72] bg-[#F3EDE2] px-2 py-0.5 rounded-full">
                          {members.length} challenge{members.length > 1 ? 's' : ''}
                        </span>
                      </p>
                      <p className="text-[11px] text-[#6A6155] mt-0.5">
                        {members.map(m => m.district).filter((v, i, a) => a.indexOf(v) === i).join(', ')} · Similar AI-predicted problem
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {allClustered ? (
                      <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-[#F0FAF4] text-[#2C6E49] border border-[#C3E6D0] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleConfirm(clusterId); }}
                        className="flex items-center gap-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-extrabold py-2 px-4 rounded-lg transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirm Cluster
                      </button>
                    )}
                  </div>
                </button>

                {/* Members */}
                {isExpanded && (
                  <div className="border-t border-[#E4DDD1] divide-y divide-[#F0EBE1]">
                    {members.map(m => {
                      const id = m.id || m.reportId;
                      return (
                        <div key={id} className="px-4 py-3 bg-[#FAF8F4] flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-extrabold text-[#8A7F72] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E4DDD1]">{m.reportId}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#E4DDD1]">{m.status}</span>
                              {m.citizenReportCount && m.citizenReportCount > 1 && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  🔥 {m.citizenReportCount} Citizen Reports Merged
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-[#201C18] mt-1">{m.title}</p>
                            <p className="text-[11px] text-[#6A6155] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {m.village}, {m.block}, {m.district}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemove(m)}
                            className="flex items-center gap-1 text-[10px] font-bold text-[#B3261E] hover:bg-red-50 border border-transparent hover:border-red-200 px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Remove from cluster"
                          >
                            <X className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      );
                    })}
                    <div className="px-4 py-2 text-[10px] text-[#8A7F72] flex items-center gap-1.5 bg-white">
                      <AlertTriangle className="w-3 h-3 text-[#C98A2C]" />
                      Confirming a cluster marks all members as Clustered, enabling a unified government + HEI response.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
