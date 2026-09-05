import React, { useState } from 'react';
import { GraduationCap, Award, CheckCircle2, ExternalLink, Lock, ChevronRight, FlaskConical, Map, ClipboardCheck, Upload } from 'lucide-react';
import { UniversityDoc, StudentRosterItem } from '../../services/universityData';
import { 
  ChallengeDoc, ProjectDoc, 
  submitPrototypeProgress, submitPilotGroundTrial,
  submitOutcomeAudit, submitPilotReport, submitPrototypeUpdate, 
  subscribeToChallenges, subscribeToProjects 
} from '../../services/firebaseService';
import { CertificateModal } from '../CertificateModal';
import { IoTSensorTelemetryCard } from '../telemetry/IoTSensorTelemetryCard';
import { getStageForStatus } from '../../services/workflowLifecycle';
import { workflowStore } from '../../services/workflowStore';

interface StudentWorkspaceTabProps {
  university: UniversityDoc;
}

// Stage progress bar for stages 11-13
const PHASE3_STAGES = [
  { num: 11, label: 'Prototype', status: 'Prototype Active', icon: FlaskConical },
  { num: 12, label: 'Pilot',      status: 'Pilot Active',      icon: Map },
  { num: 13, label: 'Audit',      status: 'Outcome Audit',     icon: ClipboardCheck },
];

function StageProgressBar({ currentStage }: { currentStage: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Phase 3 Progress</p>
      <div className="flex items-center gap-0">
        {PHASE3_STAGES.map((s, i) => {
          const done    = currentStage >  s.num;
          const active  = currentStage === s.num;
          const locked  = currentStage <  s.num;
          const Icon    = s.icon;
          return (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  done   ? 'bg-emerald-500 border-emerald-500 text-white' :
                  active ? 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-100' :
                           'bg-slate-100 border-slate-300 text-slate-400'
                }`}>
                  {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4.5 h-4.5" />}
                </div>
                <div className="text-center">
                  <span className={`text-[10px] font-extrabold block ${
                    done || active ? 'text-emerald-800' : 'text-slate-400'
                  }`}>Stage {s.num}</span>
                  <span className={`text-[10px] font-semibold block ${
                    active ? 'text-emerald-700' : locked ? 'text-slate-400' : 'text-slate-600'
                  }`}>{s.label}</span>
                  {active && (
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded mt-0.5 inline-block">Active</span>
                  )}
                </div>
              </div>
              {i < PHASE3_STAGES.length - 1 && (
                <div className={`h-0.5 flex-1 -mt-5 transition-colors ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function LockedSection({ availableAtStage }: { availableAtStage: number }) {
  return (
    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
      <Lock className="w-4 h-4 text-slate-400 shrink-0" />
      <p className="text-xs text-slate-500 font-semibold">
        Available at Stage {availableAtStage}. Complete and advance the current stage first.
      </p>
    </div>
  );
}

export const StudentWorkspaceTab: React.FC<StudentWorkspaceTabProps> = ({ university }) => {
  const currentStudent: StudentRosterItem = university.students[0] || {
    id: 'STU-BIT-101',
    name: 'Ayush Kumar Singh',
    rollNumber: 'BTECH/10042/22',
    departmentId: 'DEPT-BIT-CS',
    year: '4th Year',
    skills: ['IoT Sensors', 'ESP32 Telemetry', 'Python AI', 'React Dashboard'],
    cgpa: 8.9,
    creditsEarned: 16,
  };

  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);

  const assignedProject: ProjectDoc | null =
    projects.find(p => p.universityId === university.id || p.universityName === university.name) || null;
  const assignedChallenge = assignedProject
    ? challenges.find(c => c.id === assignedProject.challengeId || c.reportId === assignedProject.challengeId)
    : undefined;
  const currentStage = assignedChallenge ? getStageForStatus(assignedChallenge.status)?.stageNumber || 0 : 0;

  const [activeMilestoneForm, setActiveMilestoneForm] = useState<'stage11' | 'stage12'>('stage11');
  const [hardwareSpec, setHardwareSpec] = useState<string>('ESP32 Dual-Core + JSN-SR04T Ultrasonic Depth Sensor + LoRa SX1276 (868MHz) + Solar 18650 IP67 Node');
  const [githubUrl, setGithubUrl] = useState<string>('https://github.com/nivaaran-hei/iot-flood-telemetry-node');
  const [telemetryLogs, setTelemetryLogs] = useState<string>('Sensor Node #04: Water depth 1.42m. Flow velocity 2.1 m/s. Geotag verified at [23.3441, 85.3096]. Battery: 94%.');
  const [testingResults, setTestingResults] = useState<string>('Lab tested: ±1cm accuracy up to 4.5m range. LoRaWAN transmission range verified up to 8.2 km line-of-sight.');
  
  const [panchayatLocation, setPanchayatLocation] = useState<string>('Hesag Gram Panchayat, Namkum Block, Ranchi');
  const [beneficiaries, setBeneficiaries] = useState<number>(3200);
  const [groundReport, setGroundReport] = useState<string>('Live field installation on rural culvert. 3 warning sirens operational with SMS dispatch to Mukhiya and Block Development Officer.');

  const [pilotLocation, setPilotLocation] = useState<string>('Hesag Gram Panchayat, Namkum Block, Ranchi');
  const [pilotObservations, setPilotObservations] = useState<string>('Live field installation on rural culvert. 3 warning sirens operational.');
  const [auditSummary, setAuditSummary] = useState<string>('');

  // File upload state
  const [protoFiles, _setProtoFiles] = useState<File[]>([]);
  const [pilotFiles, setPilotFiles] = useState<File[]>([]);
  const [auditFiles, setAuditFiles] = useState<File[]>([]);

  // Submission success tracking (per form)
  const [_protoSubmitted, setProtoSubmitted] = useState(!!assignedProject?.prototypeUpdate);
  const [pilotSubmitted, setPilotSubmitted] = useState(!!assignedProject?.pilotReport);
  const [auditSubmitted, setAuditSubmitted] = useState(!!assignedProject?.outcomeAudit);

  const [isLoggedSuccess, setIsLoggedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [_phase3Error, setPhase3Error] = useState('');

  // Advance-stage loading states
  const [advancingStage, setAdvancingStage] = useState<number | null>(null);

  React.useEffect(() => {
    const unsubscribeProjects  = subscribeToProjects(setProjects);
    const unsubscribeChallenges = subscribeToChallenges(setChallenges);
    return () => { unsubscribeProjects(); unsubscribeChallenges(); };
  }, []);
  
  // Re-sync submitted flags when project data changes
  React.useEffect(() => {
    if (assignedProject) {
      if (assignedProject.prototypeUpdate) setProtoSubmitted(true);
      if (assignedProject.pilotReport)     setPilotSubmitted(true);
      if (assignedProject.outcomeAudit)    setAuditSubmitted(true);
    }
  }, [assignedProject]);

  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    const challengeId = assignedProject?.challengeId || 'LOCAL-1787968429418';

    if (activeMilestoneForm === 'stage11') {
      await submitPrototypeProgress(
        challengeId,
        {
          hardwareSpec,
          githubUrl,
          telemetryLogs,
          testingResults,
        },
        currentStudent.name
      );
      if (assignedProject?.id) {
        const evidenceUrls = protoFiles.map(f => URL.createObjectURL(f));
        await submitPrototypeUpdate(assignedProject.id, {
          summary: telemetryLogs,
          repositoryUrl: githubUrl,
          telemetryLog: telemetryLogs,
          evidenceUrls: evidenceUrls,
          submittedBy: currentStudent.name,
        });
        setProtoSubmitted(true);
      }
      setSuccessMessage('✓ Stage 11 IoT Prototype verified & saved to Firestore! Challenge stage advanced.');
    } else {
      await submitPilotGroundTrial(
        challengeId,
        {
          panchayatLocation,
          communityBeneficiaries: beneficiaries,
          groundVerificationReport: groundReport,
        },
        currentStudent.name
      );
      if (assignedProject?.id) {
        const evidenceUrls = pilotFiles.map(f => URL.createObjectURL(f));
        await submitPilotReport(assignedProject.id, {
          location: panchayatLocation,
          observations: groundReport,
          evidenceUrls: evidenceUrls,
          submittedBy: currentStudent.name,
        });
        setPilotSubmitted(true);
      }
      setSuccessMessage('✓ Stage 12 Panchayat Pilot Trial submitted! Sent to Government Officer for deployment verification.');
    }

    setIsLoggedSuccess(true);
    setTimeout(() => setIsLoggedSuccess(false), 5000);
  };

  const handlePilotReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedProject?.id || !pilotObservations.trim()) return;
    
    const evidenceUrls = pilotFiles.map(f => URL.createObjectURL(f));
    
    const saved = await submitPilotReport(assignedProject.id, {
      location: pilotLocation,
      observations: pilotObservations.trim(),
      evidenceUrls: evidenceUrls,
      submittedBy: currentStudent.name,
    });
    if (saved) {
      setPilotSubmitted(true);
      setPhase3Error('');
      setPilotObservations('');
      setPilotFiles([]);
    } else {
      setPhase3Error('Pilot reports can be submitted once prototype work is active.');
    }
  };

  const handleOutcomeAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedProject?.id || !auditSummary.trim()) return;
    
    const evidenceUrls = auditFiles.map(f => URL.createObjectURL(f));
    
    const saved = await submitOutcomeAudit(assignedProject.id, {
      summary: auditSummary.trim(),
      verifiedBy: currentStudent.name,
      metrics: {},
      evidenceUrls: evidenceUrls,
      verifiedAt: new Date().toISOString(),
    });
    if (saved) {
      setAuditSubmitted(true);
      setPhase3Error('');
      setAuditSummary('');
      setAuditFiles([]);
    } else {
      setPhase3Error('Outcome audits can be submitted after a pilot report is recorded.');
    }
  };

  const handleAdvanceStage = async (fromStage: number) => {
    if (!assignedChallenge) return;
    const id = assignedChallenge.id || assignedChallenge.reportId;
    const nextStatus = fromStage === 11 ? 'Pilot Active' : fromStage === 12 ? 'Outcome Audit' : null;
    if (!nextStatus) return;
    setAdvancingStage(fromStage);
    try {
      await workflowStore.transitionChallenge(
        id,
        nextStatus,
        currentStudent.name,
        'Student Researcher',
        `Stage ${fromStage} complete — advancing to ${nextStatus}.`,
      );
    } catch (err) {
      console.error('Stage advance error:', err);
    } finally {
      setAdvancingStage(null);
    }
  };

  const isPrePhase3 = currentStage < 11;

  return (
    <div className="space-y-6">

      {/* Student Profile Identity Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-emerald-500 text-slate-950 font-black rounded-2xl flex items-center justify-center text-xl shrink-0">
            {currentStudent.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold font-heading text-white">{currentStudent.name}</h2>
              <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded">
                Verified Student Researcher
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Roll No: <strong className="font-mono text-white">{currentStudent.rollNumber}</strong> · {currentStudent.year} · {university.shortName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl text-center space-y-0.5">
            <span className="text-xs text-slate-400 font-semibold block">Academic Credits</span>
            <span className="text-xl font-black text-emerald-400 font-heading">{currentStudent.creditsEarned} Credits</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl text-center space-y-0.5">
            <span className="text-xs text-slate-400 font-semibold block">CGPA</span>
            <span className="text-xl font-black text-amber-400 font-heading">{currentStudent.cgpa}</span>
          </div>
        </div>
      </div>

      {/* Phase 3 Stage Progress Bar */}
      {assignedProject && <StageProgressBar currentStage={currentStage} />}

      {/* Pre-phase 3 waiting state */}
      {assignedProject && isPrePhase3 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-900">Awaiting Phase 3 Clearance</p>
            <p className="text-xs text-amber-700 mt-0.5">
              The current project stage is {assignedChallenge?.status || 'earlier than Stage 11'}.
              Phase 3 forms unlock once the government approves your proposal and the challenge advances to <strong>Prototype Active</strong> (Stage 11).
            </p>
          </div>
        </div>
      )}

      {/* Active Multidisciplinary Project Assignment */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              Assigned Multidisciplinary Project Unit
            </h3>
          </div>
          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Active R&D Stage
          </span>
        </div>

        {assignedProject ? (
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Project Title</span>
              <p className="font-extrabold text-slate-900 text-sm">{assignedProject.challengeTitle}</p>
              <p className="text-xs text-slate-600">
                Faculty Mentor: <strong className="font-bold text-slate-900">{assignedProject.facultyMentorName}</strong> · District: <strong className="font-bold text-slate-900">{assignedProject.district}</strong>
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Project Milestone Checklist:
              </span>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {assignedProject.milestones?.map((m, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{m.stageNumber}. {m.title}</span>
                      <span className="text-[10px] text-slate-500 block">{m.description}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      m.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-600">
            Awaiting project assignment by Faculty Mentor.
          </div>
        )}
      </div>

      {/* ── Stage 11: Prototype ─────────────────────────────────────────────── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Log R&D Milestone & Ground Telemetry
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveMilestoneForm('stage11')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeMilestoneForm === 'stage11'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stage 11: IoT Prototype
            </button>
            <button
              type="button"
              onClick={() => setActiveMilestoneForm('stage12')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeMilestoneForm === 'stage12'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stage 12: Ground Pilot
            </button>
          </div>
        </div>

        <form onSubmit={handleLogProgress} className="space-y-3.5 text-xs">
          {activeMilestoneForm === 'stage11' ? (
            <>
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Hardware / Sensor Specifications:</label>
                <input
                  type="text"
                  value={hardwareSpec}
                  onChange={(e) => setHardwareSpec(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">GitHub / Firmware Repository:</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                    />
                    <a 
                      href={githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Lab Test Results & Range:</label>
                  <input
                    type="text"
                    value={testingResults}
                    onChange={(e) => setTestingResults(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Field Sensor Telemetry / Sensor Stream Log:</label>
                <textarea 
                  rows={2}
                  value={telemetryLogs}
                  onChange={(e) => setTelemetryLogs(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 text-[11px]"
                />
              </div>

              {/* Live Stitch Telemetry Visualizer Preview */}
              <div className="pt-2">
                <p className="text-[11px] font-extrabold text-[#2C6E49] uppercase tracking-wider mb-2">Live Node Sensor Telemetry Monitor:</p>
                <IoTSensorTelemetryCard
                  stationName={`Panchayat Sensor Station — ${assignedProject?.challengeTitle || 'Civic Prototype'}`}
                  hardwareNode={hardwareSpec || 'ESP32 LoRaWAN v2.4 + Ultrasonic Sensor'}
                  waterLevelMeters={4.2}
                  dangerThresholdMeters={5.5}
                  batteryPct={85}
                  signalBars={4}
                  lastSyncedText="Active Field Stream"
                  rawLogs={telemetryLogs}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Panchayat Field Trial Location:</label>
                  <input
                    type="text"
                    value={panchayatLocation}
                    onChange={(e) => setPanchayatLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Estimated Community Beneficiaries:</label>
                  <input
                    type="number"
                    value={beneficiaries}
                    onChange={(e) => setBeneficiaries(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Ground Field Verification & Incident Log:</label>
                <textarea 
                  rows={2}
                  value={groundReport}
                  onChange={(e) => setGroundReport(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                />
              </div>
            </>
          )}

          {isLoggedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900 font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage || 'Milestone telemetry log saved! +4 Academic R&D Credits awarded.'}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {activeMilestoneForm === 'stage11' ? 'Submit Stage 11 IoT Prototype' : 'Submit Stage 12 Ground Pilot Report'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Stage 12: Pilot ─────────────────────────────────────────────────── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Map className="w-4 h-4 text-indigo-600" />
            Stage 12 · Pilot — Field Report
          </h3>
          {currentStage >= 12 ? (
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
              {currentStage === 12 ? 'Active' : 'Complete'}
            </span>
          ) : (
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">Locked</span>
          )}
        </div>
        <p className="text-[11px] text-slate-500">Record the real-world test location and observations after prototype readiness.</p>

        {currentStage < 12 ? (
          <LockedSection availableAtStage={12} />
        ) : (
          <form onSubmit={handlePilotReport} className="space-y-3 text-xs">
            <input
              value={pilotLocation}
              onChange={(e) => setPilotLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              placeholder="Pilot village / ward"
            />
            <textarea
              rows={4}
              value={pilotObservations}
              onChange={(e) => setPilotObservations(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl"
              placeholder="Observed performance, community feedback, and test results"
            />
            
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Upload Field Photos/Videos:</label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => setPilotFiles(Array.from(e.target.files || []))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

            {pilotSubmitted && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pilot report submitted successfully.</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 gap-3 flex-wrap">
              <button type="submit"
                disabled={!pilotObservations.trim()}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-xs font-black rounded-xl">
                Submit Pilot Report
              </button>

              {currentStage === 12 && (
                <button
                  type="button"
                  disabled={!pilotSubmitted || advancingStage === 12}
                  onClick={() => handleAdvanceStage(12)}
                  title={!pilotSubmitted ? 'Submit the pilot report above first' : 'Advance to Stage 13: Outcome Audit'}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {advancingStage === 12 ? 'Advancing…' : (
                    <>Advance to Stage 13 — Audit <ChevronRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              )}
            </div>

            {currentStage === 12 && !pilotSubmitted && (
              <p className="text-[11px] text-slate-500 italic">Submit a pilot report above to unlock the Stage 13 advance button.</p>
            )}
          </form>
        )}
      </div>

      {/* ── Stage 13: Outcome Audit ─────────────────────────────────────────── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4 text-amber-600" />
            Stage 13 · Outcome Audit
          </h3>
          {currentStage >= 13 ? (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
              {currentStage === 13 ? 'Active' : 'Submitted'}
            </span>
          ) : (
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">Locked</span>
          )}
        </div>
        <p className="text-[11px] text-slate-500">Submit a concise technical and community validation summary for government review.</p>

        {currentStage < 13 ? (
          <LockedSection availableAtStage={13} />
        ) : (
          <form onSubmit={handleOutcomeAudit} className="space-y-3 text-xs">
            <textarea
              rows={4}
              value={auditSummary}
              onChange={(e) => setAuditSummary(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl"
              placeholder="Summarize pilot outcomes, limitations, and validation evidence"
            />
            
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Upload Audit Reports / Data (PDF/Images):</label>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) => setAuditFiles(Array.from(e.target.files || []))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

            {auditSubmitted && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Outcome audit submitted. Awaiting government deployment approval.</span>
              </div>
            )}

            <button type="submit"
              disabled={!auditSummary.trim()}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-black rounded-xl">
              Submit Outcome Audit
            </button>
          </form>
        )}
      </div>

      {/* Official Government Student R&D Certificate Voucher */}
      <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Government of Jharkhand · Department R&D Certificate</span>
          </div>
          <p className="font-extrabold text-slate-900 text-sm">
            Official Societal Challenge Innovator Badge Earned
          </p>
          <p className="text-xs text-slate-600">
            Certificate Voucher Code: <strong className="font-mono text-emerald-900">JH-HEI-REWARD-9482</strong>
          </p>
        </div>

        <button
          onClick={() => setIsCertificateOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs shrink-0 flex items-center space-x-1.5"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Download Verified Certificate (PDF)</span>
        </button>
      </div>

      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        recipientName={`${currentStudent.name} (${currentStudent.rollNumber})`}
        institutionName={university.name}
        projectTitle={assignedProject?.challengeTitle || 'Ranchi School Flood Risk Triage & IoT Early Warning System'}
        voucherCode="JH-HEI-REWARD-9482"
        issueDate="28th August 2026"
        role={`Student Researcher · ${currentStudent.year}`}
      />

    </div>
  );
};
