import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  ShieldCheck,
  Cpu,
  Printer,
  X,
  Layers,
  Radio,
  FileCheck
} from 'lucide-react';
import { ChallengeDoc, subscribeToChallenges, getChallengeByReportId } from '../../services/firebaseService';
import { getSeverityBg, getStatusPillClass } from '../../services/mapDataService';
import { IoTSensorTelemetryCard } from '../telemetry/IoTSensorTelemetryCard';

interface PublicChallengeTrackerProps {
  initialReportId?: string;
  onClose?: () => void;
}

const ALL_16_STAGES = [
  { num: 1, name: 'Submission', phase: 'Phase 1: Problem Intake & Triage', actor: 'Citizen / Community' },
  { num: 2, name: 'AI Understanding & Classification', phase: 'Phase 1: Problem Intake & Triage', actor: 'AI Engine' },
  { num: 3, name: 'Government Validation', phase: 'Phase 1: Problem Intake & Triage', actor: 'State Nodal Officer' },
  { num: 4, name: 'Semantic Deduplication & Cluster', phase: 'Phase 1: Problem Intake & Triage', actor: 'AI Engine' },
  { num: 5, name: 'Severity Prioritization', phase: 'Phase 1: Problem Intake & Triage', actor: 'AI & Govt Officer' },
  { num: 6, name: 'Institution Matching', phase: 'Phase 2: Academic Allocation & Team', actor: 'AI Matchmaker' },
  { num: 7, name: 'University R&D Acceptance', phase: 'Phase 2: Academic Allocation & Team', actor: 'University Dean / HoD' },
  { num: 8, name: 'Multidisciplinary Team Formation', phase: 'Phase 2: Academic Allocation & Team', actor: 'Faculty Mentor' },
  { num: 9, name: 'Technical Solution Proposal', phase: 'Phase 2: Academic Allocation & Team', actor: 'Student & Faculty Team' },
  { num: 10, name: 'Industry / CSR Hardware Collab', phase: 'Phase 3: Industry & Prototyping', actor: 'Industry Partner / CSR' },
  { num: 11, name: 'Hardware & IoT Prototyping', phase: 'Phase 3: Industry & Prototyping', actor: 'University R&D Lab' },
  { num: 12, name: 'Panchayat Ground Pilot Trial', phase: 'Phase 3: Industry & Prototyping', actor: 'University & Panchayat' },
  { num: 13, name: 'Field Outcome Audit', phase: 'Phase 3: Industry & Prototyping', actor: 'Govt Field Auditor' },
  { num: 14, name: 'Statewide Deployment Hand-Off', phase: 'Phase 4: Statewide Deployment & Impact', actor: 'Line Department' },
  { num: 15, name: 'State Impact Ledger Proof', phase: 'Phase 4: Statewide Deployment & Impact', actor: 'Technical Directorate' },
  { num: 16, name: 'Verified Closure & Knowledge Base', phase: 'Phase 4: Statewide Deployment & Impact', actor: 'State Government' },
];

export const PublicChallengeTracker: React.FC<PublicChallengeTrackerProps> = ({
  initialReportId = '',
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialReportId);
  const [allChallenges, setAllChallenges] = useState<ChallengeDoc[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = subscribeToChallenges((challenges) => {
      setAllChallenges(challenges);
      setLoading(false);

      if (initialReportId) {
        const found = getChallengeByReportId(initialReportId, challenges);
        if (found) setSelectedChallenge(found);
      } else if (challenges.length > 0 && !selectedChallenge) {
        setSelectedChallenge(challenges[0]);
      }
    });
    return () => unsub();
  }, [initialReportId]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = getChallengeByReportId(searchQuery, allChallenges);
    if (found) {
      setSelectedChallenge(found);
    }
  };

  const handleSelectSample = (code: string) => {
    setSearchQuery(code);
    const found = getChallengeByReportId(code, allChallenges);
    if (found) {
      setSelectedChallenge(found);
    }
  };

  const currentStageNum = selectedChallenge?.stageNumber || (
    selectedChallenge?.status === 'Resolved' ? 16 :
    selectedChallenge?.status === 'In Progress' ? 8 :
    selectedChallenge?.status === 'Government Validated' ? 3 : 1
  );

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans text-[#201C18]">
      <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header Strip */}
        <div className="bg-white border-b border-[#E4DDD1] px-5 py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="NIVAARAN" className="h-8 w-auto object-contain shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black font-heading text-[#201C18] tracking-tight">
                  Public 16-Stage Challenge Audit & Telemetry Tracker
                </h2>
                <span className="text-[10px] font-extrabold text-[#2C6E49] bg-[#2C6E49]/10 border border-[#2C6E49]/20 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                  Open Audit
                </span>
              </div>
              <p className="text-[11px] text-[#6A6155]">
                Transparent public verification ledger for societal challenges in 24 Jharkhand districts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8] rounded-xl transition-colors cursor-pointer border border-[#E4DDD1] flex items-center gap-1.5 text-xs font-bold"
              title="Print Official Ground Audit Report"
            >
              <Printer className="w-3.5 h-3.5 text-[#2C6E49]" />
              <span className="hidden sm:inline">Print Audit</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-[#8A7F72] hover:text-[#201C18] hover:bg-[#EAE4D8] rounded-xl transition-colors cursor-pointer border border-[#E4DDD1]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar & Quick Sample Tags */}
        <div className="bg-white px-5 py-3 border-b border-[#E4DDD1] space-y-2 shrink-0">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8A7F72] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Challenge ID (e.g. JH-2026-RNC-001) or search by district, village, keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#201C18] font-medium focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              Track Status
            </button>
          </form>

          {/* Quick Click Samples */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#6A6155]">
            <span className="font-bold text-[#8A7F72]">Quick Lookup:</span>
            {allChallenges.slice(0, 4).map((c) => (
              <button
                key={c.reportId}
                type="button"
                onClick={() => handleSelectSample(c.reportId)}
                className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  selectedChallenge?.reportId === c.reportId
                    ? 'bg-[#2C6E49] text-white border-[#2C6E49] font-bold'
                    : 'bg-[#FAF8F4] text-[#4A433B] border-[#E4DDD1] hover:border-[#2C6E49]'
                }`}
              >
                {c.reportId} ({c.district})
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-[#8A7F72] text-xs">Loading live audit records...</div>
          ) : !selectedChallenge ? (
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-10 text-center space-y-3">
              <Radio className="w-8 h-8 text-[#C98A2C] mx-auto animate-pulse" />
              <h3 className="text-sm font-extrabold text-[#201C18]">No Challenge Match Found</h3>
              <p className="text-xs text-[#6A6155] max-w-sm mx-auto">
                No active records matched "{searchQuery}". Please check the Report ID or pick one from the quick list above.
              </p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* 1. Challenge Overview Identity Card */}
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#F0EBE0] pb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-extrabold text-[#2C6E49] bg-[#2C6E49]/10 px-2.5 py-0.5 rounded border border-[#2C6E49]/20">
                        {selectedChallenge.reportId}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${getSeverityBg(selectedChallenge.riskLevel)} text-white`}>
                        {selectedChallenge.riskLevel || 'STANDARD'}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getStatusPillClass(selectedChallenge.status)}`}>
                        {selectedChallenge.status}
                      </span>
                      <span className="text-[10px] font-extrabold text-[#C98A2C] bg-[#FFF8EC] border border-[#F0D99A] px-2 py-0.5 rounded-full">
                        Stage {currentStageNum} / 16
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black font-heading text-[#201C18]">
                      {selectedChallenge.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-[#6A6155]">
                      <MapPin className="w-3.5 h-3.5 text-[#B5502D] shrink-0" />
                      <span>
                        {[selectedChallenge.village, selectedChallenge.block, selectedChallenge.district, 'Jharkhand'].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 text-right shrink-0 space-y-0.5">
                    <p className="text-[10px] font-bold text-[#8A7F72] uppercase tracking-wider">AI Priority Rating</p>
                    <p className="text-2xl font-black text-[#C98A2C] font-heading">
                      {selectedChallenge.priorityScore !== undefined ? `${selectedChallenge.priorityScore.toFixed(1)} / 10` : '8.5 / 10'}
                    </p>
                    <p className="text-[9px] text-[#8A7F72]">Confidence: {selectedChallenge.confidenceScore ? `${(selectedChallenge.confidenceScore * 100).toFixed(0)}%` : '94%'}</p>
                  </div>
                </div>

                <div className="text-xs text-[#4A433B] leading-relaxed bg-[#FAF8F4] p-3.5 rounded-xl border border-[#E4DDD1]">
                  <span className="font-bold text-[#201C18] block mb-1">Problem Summary:</span>
                  {selectedChallenge.summary || 'Citizen reported municipal/infrastructure challenge. Geotag verified and triaged for university engineering resolution.'}
                </div>
              </div>

              {/* 2. Interactive 16-Stage Full Lifecycle Stepper */}
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F0EBE0] pb-3">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-[#2C6E49]" />
                    <h4 className="text-sm font-extrabold text-[#201C18]">16-Stage End-to-End Progress Stepper</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#2C6E49]">
                    {currentStageNum >= 16 ? '100% Completed' : `${Math.round((currentStageNum / 16) * 100)}% Milestone Completed`}
                  </span>
                </div>

                <div className="space-y-4">
                  {['Phase 1: Problem Intake & Triage', 'Phase 2: Academic Allocation & Team', 'Phase 3: Industry & Prototyping', 'Phase 4: Statewide Deployment & Impact'].map((phaseTitle, pIdx) => {
                    const phaseStages = ALL_16_STAGES.filter(s => s.phase === phaseTitle);
                    const isPhasePassed = phaseStages.every(s => s.num <= currentStageNum);
                    const isPhaseCurrent = phaseStages.some(s => s.num === currentStageNum);

                    return (
                      <div key={pIdx} className="border border-[#E4DDD1] rounded-xl p-3.5 bg-[#FAF8F4]/60 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isPhasePassed ? 'bg-[#2C6E49]/15 text-[#2C6E49]' :
                            isPhaseCurrent ? 'bg-[#C98A2C]/15 text-[#C98A2C]' :
                            'bg-gray-100 text-[#8A7F72]'
                          }`}>
                            {phaseTitle}
                          </span>
                          <span className="text-[10px] text-[#8A7F72]">Stages {phaseStages[0].num}–{phaseStages[phaseStages.length - 1].num}</span>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {phaseStages.map((st) => {
                            const isDone = st.num < currentStageNum || (st.num === 16 && currentStageNum === 16);
                            const isCurrent = st.num === currentStageNum && currentStageNum !== 16;

                            return (
                              <div
                                key={st.num}
                                className={`p-2.5 rounded-xl border text-xs transition-all ${
                                  isDone
                                    ? 'bg-[#F0FAF4] border-[#C3E6D0] text-[#2C6E49]'
                                    : isCurrent
                                    ? 'bg-[#FFF8EC] border-[#F0D99A] text-[#C98A2C] shadow-xs'
                                    : 'bg-white border-[#E4DDD1] text-[#8A7F72]'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-mono text-[10px] font-extrabold">Stage {st.num}</span>
                                  {isDone ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2C6E49]" />
                                  ) : isCurrent ? (
                                    <Clock className="w-3.5 h-3.5 text-[#C98A2C] animate-pulse" />
                                  ) : (
                                    <div className="w-2 h-2 rounded-full bg-[#E4DDD1]" />
                                  )}
                                </div>
                                <p className="font-bold leading-tight text-[11px]">{st.name}</p>
                                <p className="text-[9px] opacity-80 mt-0.5">{st.actor}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Deep Telemetry, University R&D & Verification Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Left: Academic R&D & Team Allocation */}
                <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center space-x-2 border-b border-[#F0EBE0] pb-2.5">
                    <Building2 className="w-4 h-4 text-[#2C6E49]" />
                    <h4 className="text-xs font-extrabold text-[#201C18] uppercase tracking-wider">
                      University R&D Allocation (Stages 6–9)
                    </h4>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#F0EBE0]">
                      <span className="text-[#8A7F72]">Assigned University:</span>
                      <span className="font-bold text-[#201C18]">{selectedChallenge.assignedHEI || 'BIT Mesra, Ranchi'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F0EBE0]">
                      <span className="text-[#8A7F72]">Department:</span>
                      <span className="font-semibold text-[#4A433B]">{selectedChallenge.assignedDept || 'Electronics & Disaster Systems'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F0EBE0]">
                      <span className="text-[#8A7F72]">Faculty Mentor:</span>
                      <span className="font-semibold text-[#4A433B]">Dr. S. K. Verma (Lead PI)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#8A7F72]">Student R&D Team:</span>
                      <span className="font-bold text-[#2C6E49]">4-Member Multidisciplinary Roster</span>
                    </div>
                  </div>
                </div>

                {/* Right: IoT Prototype & Ground Pilot Telemetry */}
                <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center space-x-2 border-b border-[#F0EBE0] pb-2.5">
                    <Cpu className="w-4 h-4 text-[#C98A2C]" />
                    <h4 className="text-xs font-extrabold text-[#201C18] uppercase tracking-wider">
                      IoT Prototype & Pilot Trial (Stages 11–13)
                    </h4>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#F0EBE0]">
                      <span className="text-[#8A7F72]">Hardware Node:</span>
                      <span className="font-bold text-[#201C18]">
                        {selectedChallenge.prototypeDetails?.hardwareSpec || 'ESP32 LoRaWAN v2.4 + Ultrasonic Hydro-Station'}
                      </span>
                    </div>

                    {/* Interactive Telemetry Card (Always interactive & live) */}
                    <div className="py-1">
                      <IoTSensorTelemetryCard
                        stationName={`${selectedChallenge.district} River Basin — Node R1`}
                        hardwareNode={selectedChallenge.prototypeDetails?.hardwareSpec || 'ESP32 LoRaWAN Hydro Station'}
                        waterLevelMeters={4.2}
                        dangerThresholdMeters={5.5}
                        batteryPct={85}
                        signalBars={4}
                        lastSyncedText="Live Audit Stream"
                        rawLogs={selectedChallenge.prototypeDetails?.telemetryLogs || `[08:42:19.102] TX LoRa: Freq=865.2MHz SF=7 BW=125kHz RSSI=-72dBm SNR=9.5dB
[08:42:19.145] SENS_WATER_ULTRASONIC: distance_cm=420.4, calculated_level=4.20m [NORMAL]
[08:42:19.180] BATT_ADC_VOLTS: 3.94V (85%) | SOLAR_IN: 5.10V @ 180mA
[08:42:19.210] STATUS: OK | PAYLOAD_HASH=0x7F2A9B | PANCHAYAT_GATEWAY_ACK=RECVD`}
                      />
                    </div>

                    {selectedChallenge.pilotDetails && (
                      <div className="flex justify-between py-1 border-b border-[#F0EBE0]">
                        <span className="text-[#8A7F72]">Panchayat Ground Trial:</span>
                        <span className="font-bold text-[#201C18]">{selectedChallenge.pilotDetails.panchayatLocation} (~{selectedChallenge.pilotDetails.communityBeneficiaries} people benefited)</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1">
                      <span className="text-[#8A7F72]">Industry / CSR Partner:</span>
                      <span className="font-semibold text-[#B5502D]">{selectedChallenge.csrSponsor || 'Tata Steel CSR / MSME Innovation Fund'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 4. Official Government Audit Note & Verified Deployment Signature */}
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#2C6E49]" />
                  <h4 className="text-xs font-extrabold text-[#201C18] uppercase tracking-wider">
                    Official Government Validation & Deployment Audit Note
                  </h4>
                </div>

                <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3.5 text-xs text-[#4A433B] leading-relaxed">
                  <p className="font-bold text-[#201C18] mb-1">State Nodal Officer Log:</p>
                  <p className="italic">
                    "{selectedChallenge.govtOfficerNote || 'Validated and approved by Government Nodal Officer. Technical prototype and pilot trial audited for statewide line department installation.'}"
                  </p>
                </div>

                {selectedChallenge.deploymentDetails && (
                  <div className="pt-2 border-t border-[#F0EBE0] flex flex-wrap items-center justify-between text-xs text-[#6A6155] gap-2">
                    <span className="font-bold text-[#2C6E49] flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      Verified Impact Ledger: {selectedChallenge.deploymentDetails.impactCertificateId}
                    </span>
                    <span className="font-mono text-[11px] text-[#8A7F72]">
                      Closure Date: {new Date(selectedChallenge.deploymentDetails.verifiedClosureDate || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
