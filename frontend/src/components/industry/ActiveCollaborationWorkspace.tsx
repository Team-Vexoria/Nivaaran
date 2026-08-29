import React, { useEffect, useState } from 'react';
import {
  Activity, CheckCircle2, IndianRupee, FileText,
  Cpu, MapPin, Users, Download, Handshake, Lock
} from 'lucide-react';
import {
  CollaborationRequest, subscribeToCollaborationRequests,
  confirmTrancheDisbursement, ChallengeDoc, subscribeToChallenges
} from '../../services/firebaseService';
import { useAuth } from '../../context/AuthContext';
import { IoTSensorTelemetryCard } from '../telemetry/IoTSensorTelemetryCard';

interface ActiveCollabCardProps {
  req: CollaborationRequest;
  linkedChallenge?: ChallengeDoc;
  viewerRole: 'industry' | 'university';
  onConfirmTranche: (requestId: string, trancheNum: number) => Promise<void>;
}

const ActiveCollabCard: React.FC<ActiveCollabCardProps> = ({ req, linkedChallenge, viewerRole, onConfirmTranche }) => {
  const [confirmingTranche, setConfirmingTranche] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  const stageNumber = linkedChallenge?.stageNumber ?? 0;
  const totalFunds = req.disbursementMilestones.reduce((s, m) => s + m.amountInr, 0);
  const releasedFunds = req.disbursementMilestones
    .filter(m => m.status === 'Released')
    .reduce((s, m) => s + m.amountInr, 0);
  const progressPct = totalFunds > 0 ? Math.round((releasedFunds / totalFunds) * 100) : 0;

  const handleConfirm = async (trancheNum: number) => {
    setConfirming(true);
    await onConfirmTranche(req.id || req.requestId, trancheNum);
    setConfirming(false);
    setConfirmingTranche(null);
  };

  // Generate a deterministic impact certificate ID from the request
  const certId = `NIVAARAN-CSR-CERT-${req.requestId}`;

  const isCompleted = linkedChallenge?.status === 'Resolved' || req.status === 'Completed';

  return (
    <div className="bg-white border border-[#E4DDD1] rounded-2xl overflow-hidden shadow-xs">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-[#F0FAF4] to-[#FAF8F4] border-b border-[#E4DDD1] px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Handshake className="w-4 h-4 text-[#2C6E49]" />
            <span className="text-sm font-extrabold text-[#201C18]">{req.orgName}</span>
            <span className="text-[10px] bg-[#2C6E49] text-white font-extrabold px-2 py-0.5 rounded-full">Active MoU</span>
          </div>
          <div className="text-right text-[11px]">
            <p className="font-bold text-[#4A433B]">{req.requestId}</p>
            {req.moSignedAt && <p className="text-[#8A7F72]">MoU signed {new Date(req.moSignedAt).toLocaleDateString('en-IN')}</p>}
          </div>
        </div>
        <p className="text-xs text-[#4A433B] mt-1 font-bold">{req.challengeTitle}</p>
        <p className="text-[11px] text-[#8A7F72]">{req.assignedHEI} · {req.collaborationTypes.join(', ')}</p>
      </div>

      <div className="p-4 space-y-4">

        {/* Fund Disbursement Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-[#2C6E49]" />
              <span className="text-[11px] font-extrabold text-[#4A433B] uppercase tracking-wider">Fund Disbursement Progress</span>
            </div>
            <span className="text-xs font-extrabold text-[#2C6E49]">₹{releasedFunds.toLocaleString('en-IN')} / ₹{totalFunds.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-full bg-[#F0EBE0] rounded-full h-2">
            <div className="bg-[#2C6E49] h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="grid gap-2 mt-3">
            {req.disbursementMilestones.map(m => {
              const isUnlocked = stageNumber >= m.triggerStageNumber && m.status !== 'Released';
              const isReleased = m.status === 'Released';

              return (
                <div key={m.trancheNumber} className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs transition-all ${
                  isReleased ? 'bg-[#F0FAF4] border-[#C3E6D0]' :
                  isUnlocked ? 'bg-[#FFF8EC] border-[#F0D99A]' :
                  'bg-[#FAF8F4] border-[#E4DDD1]'
                }`}>
                  <div className="shrink-0 mt-0.5">
                    {isReleased ? <CheckCircle2 className="w-3.5 h-3.5 text-[#2C6E49]" /> :
                     isUnlocked ? <Activity className="w-3.5 h-3.5 text-[#C98A2C]" /> :
                     <Lock className="w-3.5 h-3.5 text-[#B0A89E]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-extrabold text-[#201C18]">{m.label}</span>
                      <span className={`font-extrabold ${isReleased ? 'text-[#2C6E49]' : isUnlocked ? 'text-[#C98A2C]' : 'text-[#8A7F72]'}`}>
                        ₹{m.amountInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#6A6155]">Trigger: {m.triggerStageName}</p>
                    <p className="text-[10px] text-[#8A7F72] italic">Condition: {m.releaseCondition}</p>
                    {isReleased && m.releasedAt && (
                      <p className="text-[10px] font-bold text-[#2C6E49] mt-0.5">Released {new Date(m.releasedAt).toLocaleDateString('en-IN')}</p>
                    )}
                    {isUnlocked && viewerRole === 'industry' && !isReleased && (
                      <div className="mt-1.5">
                        {confirmingTranche === m.trancheNumber ? (
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-[#C98A2C]">Confirm release of ₹{m.amountInr.toLocaleString('en-IN')}?</p>
                            <button onClick={() => handleConfirm(m.trancheNumber)} disabled={confirming}
                              className="text-[10px] font-extrabold text-white bg-[#2C6E49] px-2 py-1 rounded-lg cursor-pointer hover:bg-[#23583a] disabled:opacity-60">
                              {confirming ? 'Confirming…' : 'Yes, Release'}
                            </button>
                            <button onClick={() => setConfirmingTranche(null)} className="text-[10px] font-bold text-[#4A433B] bg-[#EAE4D8] px-2 py-1 rounded-lg cursor-pointer">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmingTranche(m.trancheNumber)}
                            className="text-[10px] font-extrabold text-[#C98A2C] bg-[#FFF0D0] border border-[#F0D99A] px-3 py-1 rounded-lg cursor-pointer hover:bg-[#FFE8A8] transition-colors">
                            Confirm Tranche Disbursement
                          </button>
                        )}
                      </div>
                    )}
                    {isUnlocked && viewerRole === 'university' && (
                      <p className="text-[10px] font-bold text-[#C98A2C] mt-1">⏳ Awaiting industry confirmation to release this tranche</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Project Telemetry */}
        {linkedChallenge && (
          <div className="border-t border-[#F0EBE0] pt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Activity className="w-3.5 h-3.5 text-[#B5502D]" />
              <p className="text-[11px] font-extrabold text-[#4A433B] uppercase tracking-wider">Live Project Status — Stage {stageNumber}/16</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-2.5">
                <p className="text-[9px] font-extrabold text-[#8A7F72] uppercase tracking-wider">Current Stage</p>
                <p className="font-extrabold text-[#201C18] mt-0.5">{linkedChallenge.stageName || `Stage ${stageNumber}`}</p>
              </div>
              <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-2.5">
                <p className="text-[9px] font-extrabold text-[#8A7F72] uppercase tracking-wider">Status</p>
                <p className="font-extrabold text-[#201C18] mt-0.5">{linkedChallenge.status}</p>
              </div>
              {linkedChallenge.prototypeDetails && (
                <>
                  <div className="bg-[#F0FAF4] border border-[#C3E6D0] rounded-xl p-2.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Cpu className="w-2.5 h-2.5 text-[#2C6E49]" />
                      <p className="text-[9px] font-extrabold text-[#2C6E49] uppercase tracking-wider">Prototype Hardware</p>
                    </div>
                    <p className="font-bold text-[#201C18] text-[11px]">{linkedChallenge.prototypeDetails.hardwareSpec || '—'}</p>
                  </div>
                  <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-2.5">
                    <p className="text-[9px] font-extrabold text-[#8A7F72] uppercase tracking-wider">Testing Results</p>
                    <p className="font-bold text-[#201C18] text-[11px]">{linkedChallenge.prototypeDetails.testingResults || 'Not yet submitted'}</p>
                  </div>
                </>
              )}
              {linkedChallenge.pilotDetails && (
                <>
                  <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-2.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <MapPin className="w-2.5 h-2.5 text-[#B5502D]" />
                      <p className="text-[9px] font-extrabold text-[#8A7F72] uppercase tracking-wider">Pilot Location</p>
                    </div>
                    <p className="font-bold text-[#201C18] text-[11px]">{linkedChallenge.pilotDetails.panchayatLocation || '—'}</p>
                  </div>
                  <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-2.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Users className="w-2.5 h-2.5 text-[#2C6E49]" />
                      <p className="text-[9px] font-extrabold text-[#8A7F72] uppercase tracking-wider">Community Beneficiaries</p>
                    </div>
                    <p className="font-extrabold text-[#2C6E49] text-[11px]">{(linkedChallenge.pilotDetails.communityBeneficiaries ?? 0).toLocaleString('en-IN')}</p>
                  </div>
                </>
              )}
              {linkedChallenge.prototypeDetails && (
                <div className="sm:col-span-2 pt-1">
                  <IoTSensorTelemetryCard
                    stationName={`${linkedChallenge.district} River Basin — Node R1`}
                    hardwareNode={linkedChallenge.prototypeDetails.hardwareSpec || 'ESP32 LoRaWAN Node v2.4'}
                    waterLevelMeters={4.2}
                    dangerThresholdMeters={5.5}
                    batteryPct={85}
                    signalBars={4}
                    lastSyncedText="Live Telemetry Stream Active"
                    rawLogs={linkedChallenge.prototypeDetails.telemetryLogs || undefined}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 135 Impact Certificate — unlocked at Stage 16 */}
        {isCompleted && (
          <div className="border-t border-[#F0EBE0] pt-4">
            <div className="bg-gradient-to-br from-[#F0FAF4] to-[#FAF8F4] border border-[#C3E6D0] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2C6E49]" />
                <p className="text-xs font-extrabold text-[#2C6E49] uppercase tracking-wider">Section 135 CSR Social Impact Certificate</p>
              </div>
              <p className="text-[11px] text-[#4A433B]">
                This certificate confirms that <strong>{req.orgName}</strong> has successfully funded a state-recognized societal R&D project through the Nivaaran platform under Companies Act 2013, Section 135 and Schedule VII. This document is valid for inclusion in the Corporate Board's Annual CSR Report.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <p className="text-[9px] font-extrabold text-[#8A7F72] uppercase tracking-wider">Certificate ID</p>
                  <p className="font-extrabold text-[#201C18]">{certId}</p>
                </div>
                <div>
                  <p className="text-[9px] font-extrabold text-[#8A7F72] uppercase tracking-wider">Total CSR Expenditure</p>
                  <p className="font-extrabold text-[#2C6E49]">₹{totalFunds.toLocaleString('en-IN')} INR</p>
                </div>
                <div>
                  <p className="text-[9px] font-extrabold text-[#8A7F72] uppercase tracking-wider">Issuing Authority</p>
                  <p className="font-bold text-[#201C18]">State Disaster & Innovation Command · Govt of Jharkhand</p>
                </div>
                <div>
                  <p className="text-[9px] font-extrabold text-[#8A7F72] uppercase tracking-wider">Project</p>
                  <p className="font-bold text-[#201C18]">{req.challengeTitle}</p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#2C6E49] text-white text-xs font-extrabold rounded-xl cursor-pointer hover:bg-[#23583a] transition-colors mt-1"
              >
                <Download className="w-3.5 h-3.5" /> Download Certificate (Print to PDF)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

interface Props {
  viewerRole: 'industry' | 'university';
  filterByOrg?: string;
}

export const ActiveCollaborationWorkspace: React.FC<Props> = ({ viewerRole, filterByOrg }) => {
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);

  useEffect(() => {
    const unsub1 = subscribeToCollaborationRequests((data) => {
      const active = data.filter(r =>
        (r.status === 'MoU Signed' || r.status === 'Active' || r.status === 'Completed') &&
        (!filterByOrg || r.orgName === filterByOrg)
      );
      setRequests(active);
    });
    const unsub2 = subscribeToChallenges((data) => setChallenges(data));
    return () => { unsub1(); unsub2(); };
  }, [filterByOrg]);

  const { currentUser } = useAuth();

  const handleConfirmTranche = async (requestId: string, trancheNum: number) => {
    await confirmTrancheDisbursement(requestId, trancheNum, currentUser?.displayName || 'Industry Partner');
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white border border-[#E4DDD1] rounded-xl p-8 text-center">
        <Handshake className="w-8 h-8 text-[#D5CDBF] mx-auto mb-2" />
        <p className="text-sm font-bold text-[#8A7F72]">No active collaborations yet.</p>
        <p className="text-xs text-[#B0A89E] mt-1">
          {viewerRole === 'industry'
            ? 'Once your collaboration request is accepted by a university and an MoU is signed, the active workspace will appear here.'
            : 'Once an industry partner\'s request is accepted, active collaborations appear here for milestone verification.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#2C6E49]" />
          <h2 className="text-base font-extrabold text-[#201C18]">Active Collaborations</h2>
          <span className="bg-[#2C6E49] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">{requests.length}</span>
        </div>
      </div>
      {requests.map(req => {
        const linked = challenges.find(c =>
          c.id === req.challengeId ||
          c.reportId === req.challengeId
        );
        return (
          <ActiveCollabCard
            key={req.id || req.requestId}
            req={req}
            linkedChallenge={linked}
            viewerRole={viewerRole}
            onConfirmTranche={handleConfirmTranche}
          />
        );
      })}
    </div>
  );
};
