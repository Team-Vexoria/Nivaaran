import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Award, CheckCircle2, ExternalLink, ChevronRight, 
  FlaskConical, Map, ClipboardCheck, Upload, ShieldCheck, Cpu, Layers, 
  FileCode, DollarSign, Check, Radio, 
  FileText, Users, Building2, Terminal, PlayCircle
} from 'lucide-react';
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
import { ChallengeStatus } from '../../services/workflowTypes';

interface StudentWorkspaceTabProps {
  university: UniversityDoc;
}

// Full Stages 8 to 13 definitions for the University Lab & Student Milestone Tracker
const LAB_WORKFLOW_STAGES = [
  { num: 8,  key: 'TEAM_FORMATION',                  label: 'Team Formation',    desc: 'Lab Allocation & Roster',        icon: Users },
  { num: 9,  key: 'PROPOSAL',                        label: 'Proposal & BOM',    desc: 'System Architecture',            icon: FileText },
  { num: 10, key: 'INDUSTRY_CSR_COLLABORATION',     label: 'CSR Grant',         desc: 'Industry Co-Funding',            icon: Building2 },
  { num: 11, key: 'PROTOTYPE',                       label: 'IoT Prototype',     desc: 'CAD, Schematics & Telemetry',    icon: FlaskConical },
  { num: 12, key: 'PILOT',                           label: 'Panchayat Pilot',   desc: 'Ground Field Trials',            icon: Map },
  { num: 13, key: 'TECHNICAL_COMMUNITY_VALIDATION',  label: 'Outcome Audit',     desc: 'Govt Deployment Clearance',      icon: ClipboardCheck },
];

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
  
  // Calculate current stage number (default to stage 11 if active prototype project)
  const currentStage = assignedChallenge ? (getStageForStatus(assignedChallenge.status)?.stageNumber || 11) : 11;

  // Active view tab for Stages 8-13
  const [selectedStageTab, setSelectedStageTab] = useState<number>(11);

  // Prototype (Stage 11) Form States
  const [hardwareSpec, setHardwareSpec] = useState<string>(
    'ESP32-S3 Dual-Core + JSN-SR04T Waterproof Ultrasonic Depth Sensor + LoRa SX1276 (868MHz) + Solar 18650 LiFePO4 IP67 Node'
  );
  const [githubUrl, setGithubUrl] = useState<string>('https://github.com/nivaaran-hei/iot-flood-telemetry-node');
  const [githubBranch, setGithubBranch] = useState<string>('main');
  const [cadModelName, setCadModelName] = useState<string>('JSN-SR04T_SolarNode_Enclosure_IP67_v2.step');
  const [telemetryLogs, setTelemetryLogs] = useState<string>(
    `[${new Date().toLocaleTimeString()}] TX LoRa: Freq=865.2MHz SF=7 BW=125kHz RSSI=-71dBm SNR=9.8dB\n` +
    `[${new Date().toLocaleTimeString()}] SENS_WATER_DEPTH: raw_cm=142.0, calculated_level=4.20m [NORMAL]\n` +
    `[${new Date().toLocaleTimeString()}] BATT_ADC_VOLTS: 3.96V (88%) | SOLAR_IN: 5.15V @ 210mA\n` +
    `[${new Date().toLocaleTimeString()}] STATUS: OK | PAYLOAD_HASH=0x9A4E2B | PANCHAYAT_GATEWAY_ACK=RECVD`
  );
  const [testingResults, setTestingResults] = useState<string>(
    'Lab tested: ±0.8cm ultrasonic accuracy across 0.2m - 5.0m range. LoRaWAN transmission range verified up to 8.4 km line-of-sight.'
  );

  // Live Telemetry Simulation States
  const [simWaterLevel, setSimWaterLevel] = useState<number>(4.2);
  const [simBattery, setSimBattery] = useState<number>(88);
  const [isSimulatingPulse, setIsSimulatingPulse] = useState<boolean>(false);

  // Pilot (Stage 12) Form States
  const [panchayatLocation, setPanchayatLocation] = useState<string>('Hesag Gram Panchayat, Namkum Block, Ranchi');
  const [beneficiaries, setBeneficiaries] = useState<number>(3200);
  const [mukhiyaContact, setMukhiyaContact] = useState<string>('Rameshwar Munda (+91 94311 02841)');
  const [groundReport, setGroundReport] = useState<string>(
    'Live field deployment on rural culvert. 3 warning sirens operational with automated SMS dispatch to Mukhiya and Block Development Officer (BDO).'
  );

  // Outcome Audit (Stage 13) Form States
  const [auditSummary, setAuditSummary] = useState<string>(
    'Field pilot completed with 100% telemetry uptime over 14 days. Flood surge simulation triggered sirens in 38 seconds. Community satisfaction score 94%.'
  );
  const [auditMetrics, _setAuditMetrics] = useState({
    latencySec: 38,
    falseAlarmPct: 0.8,
    uptimePct: 99.7,
    communityApprovalPct: 94
  });

  // Faculty Mentor Digital Sign-Off Form States
  const [facultyRemarks, setFacultyRemarks] = useState<string>(
    'Verified telemetry packet integrity and CAD waterproofing. Lab calibration results meet Jharkhand Disaster Management Authority (JDMA) standards. Recommended for immediate stage advancement.'
  );
  const [facultySignOffSuccess, setFacultySignOffSuccess] = useState<boolean>(false);
  const [isSigningOff, setIsSigningOff] = useState<boolean>(false);

  // File upload state
  const [protoFiles, _setProtoFiles] = useState<File[]>([]);
  const [pilotFiles, setPilotFiles] = useState<File[]>([]);
  const [auditFiles, setAuditFiles] = useState<File[]>([]);

  // Submission success tracking
  const [_protoSubmitted, setProtoSubmitted] = useState(!!assignedProject?.prototypeUpdate);
  const [pilotSubmitted, setPilotSubmitted] = useState(!!assignedProject?.pilotReport);
  const [auditSubmitted, setAuditSubmitted] = useState(!!assignedProject?.outcomeAudit);

  const [isLoggedSuccess, setIsLoggedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [advancingStage, setAdvancingStage] = useState<number | null>(null);
  const [isAbcModalOpen, setIsAbcModalOpen] = useState<boolean>(false);
  const [abcId] = useState<string>('ABC-9821-4432-1190');

  useEffect(() => {
    const unsubscribeProjects = subscribeToProjects(setProjects);
    const unsubscribeChallenges = subscribeToChallenges(setChallenges);
    return () => { 
      unsubscribeProjects(); 
      unsubscribeChallenges(); 
    };
  }, []);
  
  useEffect(() => {
    if (assignedProject) {
      if (assignedProject.prototypeUpdate) setProtoSubmitted(true);
      if (assignedProject.pilotReport) setPilotSubmitted(true);
      if (assignedProject.outcomeAudit) setAuditSubmitted(true);
    }
  }, [assignedProject]);

  // Inject a live sensor test pulse
  const handleTriggerSimPulse = () => {
    setIsSimulatingPulse(true);
    const newLevel = Number((simWaterLevel + 0.6).toFixed(2));
    setSimWaterLevel(newLevel);
    setSimBattery(prev => Math.max(prev - 1, 10));
    const nowTime = new Date().toLocaleTimeString();
    const newLogLine = `[${nowTime}] !!! WATER LEVEL SURGE ALERT: level=${newLevel}m (Threshold: 5.5m) | LORA_TX_BURST=OK\n` + telemetryLogs;
    setTelemetryLogs(newLogLine);
    setTimeout(() => {
      setIsSimulatingPulse(false);
    }, 1500);
  };

  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    const challengeId = assignedProject?.challengeId || 'LOCAL-1787968429418';

    if (selectedStageTab === 11) {
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
      setSuccessMessage('✓ Stage 11 IoT Prototype milestone & live telemetry verified! R&D progress updated.');
    } else if (selectedStageTab === 12) {
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
      setSuccessMessage('✓ Stage 12 Panchayat Pilot Trial submitted to Govt Officer & Faculty Lead.');
    }

    setIsLoggedSuccess(true);
    setTimeout(() => setIsLoggedSuccess(false), 5000);
  };

  const handlePilotReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedProject?.id || !groundReport.trim()) return;
    
    const evidenceUrls = pilotFiles.map(f => URL.createObjectURL(f));
    const saved = await submitPilotReport(assignedProject.id, {
      location: panchayatLocation,
      observations: groundReport.trim(),
      evidenceUrls: evidenceUrls,
      submittedBy: currentStudent.name,
    });
    if (saved) {
      setPilotSubmitted(true);
      setSuccessMessage('✓ Stage 12 Ground Pilot observations recorded successfully.');
      setIsLoggedSuccess(true);
      setTimeout(() => setIsLoggedSuccess(false), 4000);
    }
  };

  const handleOutcomeAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedProject?.id || !auditSummary.trim()) return;
    
    const evidenceUrls = auditFiles.map(f => URL.createObjectURL(f));
    const saved = await submitOutcomeAudit(assignedProject.id, {
      summary: auditSummary.trim(),
      verifiedBy: currentStudent.name,
      metrics: auditMetrics,
      evidenceUrls: evidenceUrls,
      verifiedAt: new Date().toISOString(),
    });
    if (saved) {
      setAuditSubmitted(true);
      setSuccessMessage('✓ Stage 13 Outcome Audit submitted for final Government Deployment Clearance.');
      setIsLoggedSuccess(true);
      setTimeout(() => setIsLoggedSuccess(false), 4000);
    }
  };

  const handleFacultySignOffAndAdvance = async (fromStage: number) => {
    if (!assignedChallenge) return;
    setIsSigningOff(true);
    const id = assignedChallenge.id || assignedChallenge.reportId;
    const nextStatus: ChallengeStatus = fromStage === 11 ? 'Pilot Active' : fromStage === 12 ? 'Outcome Audit' : 'Resolved';
    try {
      await workflowStore.transitionChallenge(
        id,
        nextStatus,
        assignedProject?.facultyMentorName || 'Dr. Arvind Sinha',
        'Faculty Research Mentor',
        `Faculty Digital Sign-Off Completed: ${facultyRemarks}`
      );
      setFacultySignOffSuccess(true);
      setTimeout(() => setFacultySignOffSuccess(false), 5000);
    } catch (err) {
      console.error('Stage advance error:', err);
    } finally {
      setIsSigningOff(false);
    }
  };

  const handleAdvanceStage = async (fromStage: number) => {
    if (!assignedChallenge) return;
    const id = assignedChallenge.id || assignedChallenge.reportId;
    const nextStatus: ChallengeStatus | null = fromStage === 11 ? 'Pilot Active' : fromStage === 12 ? 'Outcome Audit' : null;
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

  return (
    <div className="space-y-6">

      {/* Student Profile Identity Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl shadow-md border border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-emerald-900/30">
            {currentStudent.name.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black font-heading text-white">{currentStudent.name}</h2>
              <span className="text-[10px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-600/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verified HEI Student Lead
              </span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                UID: {currentStudent.id}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Roll No: <strong className="font-mono text-white">{currentStudent.rollNumber}</strong> · {currentStudent.year} · {university.name}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {currentStudent.skills.map((skill, idx) => (
                <span key={idx} className="text-[10px] bg-slate-800/80 text-teal-300 border border-teal-800/40 px-2 py-0.5 rounded-md font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="bg-slate-800/90 border border-slate-700/80 px-4 py-3 rounded-xl text-center space-y-0.5 shadow-xs">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">Academic Credits</span>
            <span className="text-xl font-black text-emerald-400 font-heading">{currentStudent.creditsEarned} + 4 Credits</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700/80 px-4 py-3 rounded-xl text-center space-y-0.5 shadow-xs">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">CGPA Score</span>
            <span className="text-xl font-black text-amber-400 font-heading">{currentStudent.cgpa}</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700/80 px-4 py-3 rounded-xl text-center space-y-0.5 shadow-xs">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">Lab Station</span>
            <span className="text-xs font-bold text-teal-300 font-heading block">IoT Node #04 Active</span>
          </div>
        </div>
      </div>

      {/* DigiLocker and Academic Bank of Credits (ABC) Verification Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-2xl p-5 shadow-md text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  National Academic Depository (NAD)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">DigiLocker Certified</span>
              </div>
              <h3 className="text-base font-black font-heading text-white">
                Academic Bank of Credits (ABC) : 4 UGC Credits Awarded
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Official NEP 2020 experiential learning credits verified for active technical problem solving on Jharkhand civic challenges.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div className="text-right hidden md:block">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">ABC Account ID</span>
              <span className="font-mono text-xs font-bold text-teal-300">{abcId}</span>
            </div>
            <button
              onClick={() => setIsAbcModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Verify ABC Credential</span>
            </button>
          </div>
        </div>
      </div>

      {/* DigiLocker ABC Modal */}
      {isAbcModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[250] p-4 text-left">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ministry of Education : Govt of India
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">Official Academic Bank of Credits Transcript</h3>
                <p className="text-xs text-slate-500">Verified via DigiLocker IndiaStack Gateway</p>
              </div>
              <button 
                onClick={() => setIsAbcModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-bold">Student Name:</span>
                <span className="font-bold text-slate-900">{currentStudent.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-bold">Institutional Roll:</span>
                <span className="font-mono text-slate-900">{currentStudent.rollNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-bold">Institution:</span>
                <span className="font-semibold text-slate-900">{university.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-bold">Permanent ABC ID:</span>
                <span className="font-mono font-bold text-emerald-700">{abcId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-bold">Course Category:</span>
                <span className="font-semibold text-slate-900">Societal Innovation and Experiential Field Deployment</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-900 font-bold">UGC Credits Deposited:</span>
                <span className="font-black text-emerald-600 text-sm">4.0 Academic Credits</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Digitally Signed and Authenticated by DigiLocker Authority</span>
              </p>
              <p className="font-mono text-[9px] text-emerald-700">
                Signature SHA256: 0x98FA2B019CC47D8E21098AA7C5E941
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  alert(`Official DigiLocker ABC Transcript for ${currentStudent.name} (ABC ID: ${abcId}) downloaded.`);
                  setIsAbcModalOpen(false);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Download Verified Transcript (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stages 8 to 13 University Lab Milestone Tracker */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-black text-slate-900 font-heading">
                Student Lab Milestone & Execution Roadmap (Stages 8–13)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multidisciplinary R&D pipeline from lab formation to village pilot and outcome validation.
            </p>
          </div>
          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
            Current: Stage {currentStage} ({LAB_WORKFLOW_STAGES.find(s => s.num === currentStage)?.label || 'Prototype Active'})
          </span>
        </div>

        {/* Milestone Steps Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {LAB_WORKFLOW_STAGES.map((s) => {
            const isCompleted = currentStage > s.num;
            const isActive = currentStage === s.num;
            const isSelected = selectedStageTab === s.num;
            const Icon = s.icon;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setSelectedStageTab(s.num)}
                className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between min-h-[96px] ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                    : isCompleted
                    ? 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
                    : isActive
                    ? 'border-teal-300 bg-teal-50/50 hover:bg-teal-50'
                    : 'border-slate-200 bg-white opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : isActive
                      ? 'bg-teal-100 text-teal-800 animate-pulse'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isCompleted ? 'Done' : isActive ? 'Active' : `Stg ${s.num}`}
                  </span>
                </div>

                <div>
                  <span className={`text-xs font-bold block truncate ${
                    isSelected ? 'text-emerald-950 font-black' : 'text-slate-900'
                  }`}>
                    {s.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {s.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tranche Grant Disbursement Tracker (30% - 40% - 30%) ── */}
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 font-heading">
                Tranche Grant Disbursement Tracker
              </h3>
              <p className="text-[11px] text-slate-500">
                Jharkhand Societal Innovation R&D Fund · Sanction Order: <strong className="font-mono text-slate-700">JH-RND-2026-042</strong>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-semibold block">Total Sanctioned Grant</span>
            <span className="text-lg font-black text-slate-900 font-heading">₹5,00,000</span>
          </div>
        </div>

        {/* 3 Tranches Visual Grid */}
        <div className="grid md:grid-cols-3 gap-3">
          {/* Tranche 1 */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">Tranche 1 (30%)</span>
                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Disbursed
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900">₹1,50,000</h4>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">
                Prototype Hardware & Component Procurement (Stage 11 Gate).
              </p>
            </div>
            <div className="text-[10px] text-emerald-800 font-mono bg-white/80 p-2 rounded-lg border border-emerald-200">
              PFMS Ref: <span className="font-bold">JH-PFMS-88391</span> · 12 Aug 2026
            </div>
          </div>

          {/* Tranche 2 */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
            currentStage >= 12
              ? 'border-indigo-200 bg-indigo-50/50'
              : 'border-slate-200 bg-slate-50/70'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Tranche 2 (40%)</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentStage >= 12 
                    ? 'bg-indigo-200 text-indigo-900' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentStage >= 12 ? 'In Processing' : 'Pending Stage 12'}
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900">₹2,00,000</h4>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">
                Panchayat Field Trial, LoRaWAN Gateways & Warning Sirens.
              </p>
            </div>
            <div className="text-[10px] text-slate-600 font-mono bg-white/80 p-2 rounded-lg border border-slate-200">
              Release Trigger: <span className="font-bold">Stage 12 Field Report</span>
            </div>
          </div>

          {/* Tranche 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Tranche 3 (30%)</span>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                  {currentStage >= 13 ? 'Audit Review' : 'Locked'}
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900">₹1,50,000</h4>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">
                District-Wide Scaled Deployment & Handover to District Admin.
              </p>
            </div>
            <div className="text-[10px] text-slate-600 font-mono bg-white/80 p-2 rounded-lg border border-slate-200">
              Release Trigger: <span className="font-bold">Stage 13 Outcome Audit</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Multidisciplinary Project Assignment Overview ── */}
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
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-start gap-4">
              {(assignedChallenge?.evidenceUrl || (assignedChallenge?.evidenceUrls && assignedChallenge.evidenceUrls[0])) && (
                <img
                  src={assignedChallenge.evidenceUrl || (assignedChallenge.evidenceUrls && assignedChallenge.evidenceUrls[0])}
                  alt={assignedProject.challengeTitle}
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  className="w-full sm:w-44 h-28 object-cover rounded-xl border border-slate-200 shrink-0 shadow-2xs"
                />
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Project Title</span>
                <p className="font-extrabold text-slate-900 text-sm">{assignedProject.challengeTitle}</p>
                <p className="text-xs text-slate-600">
                  Faculty Mentor: <strong className="font-bold text-slate-900">{assignedProject.facultyMentorName || 'Dr. Arvind Sinha'}</strong> · District: <strong className="font-bold text-slate-900">{assignedProject.district || 'Ranchi'}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
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

      {/* ── SELECTED STAGE TAB WORKSPACE VIEW ── */}

      {/* STAGE 8 & 9 VIEW */}
      {selectedStageTab === 8 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Stage 8 · Student Team Formation & Lab Allocation
            </h3>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-200">
              Completed
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Student Innovation Roster</h4>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-center justify-between">
                  <span>Ayush Kumar Singh (Lead · 4th Yr CSE)</span>
                  <span className="font-mono text-emerald-700 font-bold">IoT & Firmware</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Pooja Kumari (3rd Yr ECE)</span>
                  <span className="font-mono text-emerald-700 font-bold">Circuit & PCB</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Rohit Verma (4th Yr Mech)</span>
                  <span className="font-mono text-emerald-700 font-bold">CAD & IP67 Enclosure</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Allocated HEI Research Facility</h4>
              <p className="text-slate-600">
                <strong>Facility:</strong> Advanced Embedded Systems & LoRaWAN Testbed (Lab 304, Dept of ECE, {university.name})
              </p>
              <p className="text-slate-600">
                <strong>Equipment:</strong> Rohde & Schwarz Spectrum Analyzer, Formlabs 3D Resin Printer, 868MHz Gateway Node.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedStageTab === 9 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Stage 9 · Engineering Proposal & Bill of Materials (BOM)
            </h3>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-200">
              Endorsed by Faculty
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">Architecture Summary</h4>
              <p className="text-slate-600 leading-relaxed">
                Solar-powered LoRaWAN flood & water level monitoring nodes deployed on rural bridges and culverts. Telemetry packets relayed to district disaster control room and automated audio siren triggers within 45 seconds of flood threshold violation.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Core Microcontroller</span>
                <span className="font-bold text-slate-900">ESP32-S3 Dual-Core (240MHz)</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Telemetry Transceiver</span>
                <span className="font-bold text-slate-900">Semtech SX1276 LoRa (868MHz)</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Sensors</span>
                <span className="font-bold text-slate-900">JSN-SR04T Waterproof Ultrasonic</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedStageTab === 10 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              Stage 10 · Industry & CSR Collaboration Clearance
            </h3>
            <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded border border-teal-200">
              MoU Executed
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 space-y-2">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">CSR Partner</span>
              <h4 className="font-black text-slate-900 text-sm">Tata Steel Rural Development Society (TSRDS)</h4>
              <p className="text-slate-600">
                Co-funding grant of ₹2,50,000 for sensor nodes across 12 vulnerable panchayats in Subarnarekha Basin.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Industry Mentor</span>
              <h4 className="font-bold text-slate-900">Dr. S. K. Roy (Chief Engineer, IoT Systems)</h4>
              <p className="text-slate-600">
                Weekly technical review & LoRaWAN security protocol audit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 11: PROTOTYPE & LIVE IOT TELEMETRY WORKSPACE ── */}
      {selectedStageTab === 11 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-heading">
                  Stage 11 · Hardware CAD Prototype & Live Telemetry Stream
                </h3>
                <p className="text-[11px] text-slate-500">
                  Upload CAD/firmware schematics, monitor real-time sensor node telemetry, and log test runs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTriggerSimPulse}
                disabled={isSimulatingPulse}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <PlayCircle className={`w-3.5 h-3.5 ${isSimulatingPulse ? 'animate-spin' : ''}`} />
                <span>{isSimulatingPulse ? 'Injecting Surge…' : 'Simulate Flood Ping'}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogProgress} className="space-y-4 text-xs">
            {/* Specs & CAD Enclosure */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                  Hardware / Sensor Specifications:
                </label>
                <input
                  type="text"
                  value={hardwareSpec}
                  onChange={(e) => setHardwareSpec(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                  3D CAD Enclosure Model (.STEP / .STL):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cadModelName}
                    onChange={(e) => setCadModelName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-2 rounded-xl shrink-0">
                    IP67 Sealed
                  </span>
                </div>
              </div>
            </div>

            {/* GitHub Repo & Branch */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
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
                <label className="font-bold text-slate-800 block">Branch & CI/CD Status:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-2 rounded-xl shrink-0">
                    CI: Passed
                  </span>
                </div>
              </div>
            </div>

            {/* Lab Test Results */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Lab Test Results & Transmission Range:</label>
              <input
                type="text"
                value={testingResults}
                onChange={(e) => setTestingResults(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

            {/* Live Visual Telemetry Monitor Card */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                  Live Field Node Telemetry Visualizer
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Node R1 · Hesag Culvert [23.3441° N, 85.3096° E]
                </span>
              </div>

              <IoTSensorTelemetryCard
                stationName={`Panchayat Sensor Station — ${assignedProject?.challengeTitle || 'Ranchi Flood Early Warning'}`}
                hardwareNode={hardwareSpec}
                waterLevelMeters={simWaterLevel}
                dangerThresholdMeters={5.5}
                batteryPct={simBattery}
                signalBars={4}
                lastSyncedText="Real-time · Stream active"
                rawLogs={telemetryLogs}
              />
            </div>

            {/* Telemetry Log Stream Area */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-600" />
                  Live LoRaWAN Telemetry Stream Log:
                </label>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">● 115200 BAUD UART</span>
              </div>
              <textarea 
                rows={3}
                value={telemetryLogs}
                onChange={(e) => setTelemetryLogs(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-emerald-400 text-[11px]"
              />
            </div>

            {isLoggedSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900 font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage || 'Stage 11 IoT Prototype milestone saved! +4 Academic R&D Credits awarded.'}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Update Stage 11 IoT Prototype & Telemetry</span>
              </button>

              {/* Advance to Stage 12 Button */}
              {currentStage === 11 && (
                <button
                  type="button"
                  disabled={advancingStage === 11}
                  onClick={() => handleAdvanceStage(11)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {advancingStage === 11 ? 'Advancing to Pilot…' : (
                    <>Advance to Stage 12 — Ground Pilot <ChevronRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── STAGE 12: GROUND PILOT WORKSPACE ── */}
      {selectedStageTab === 12 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Map className="w-4 h-4 text-indigo-600" />
              Stage 12 · Panchayat Field Ground Pilot
            </h3>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${
              currentStage >= 12 ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {currentStage === 12 ? 'Active Stage' : currentStage > 12 ? 'Completed' : 'Locked'}
            </span>
          </div>

          <form onSubmit={handlePilotReport} className="space-y-3.5 text-xs">
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
                <label className="font-bold text-slate-800 block">Mukhiya / Panchayat Contact:</label>
                <input
                  type="text"
                  value={mukhiyaContact}
                  onChange={(e) => setMukhiyaContact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Estimated Village Beneficiaries:</label>
                <input
                  type="number"
                  value={beneficiaries}
                  onChange={(e) => setBeneficiaries(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Deployment Status:</label>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-emerald-800">
                  ✓ 3 Solar Warning Sirens Installed & Connected to LoRa Relay
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Ground Field Verification & Incident Log:</label>
              <textarea 
                rows={3}
                value={groundReport}
                onChange={(e) => setGroundReport(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Field Video & Photo Evidence (Multiple Files):</label>
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
                <span>Panchayat Pilot report submitted. Tranche 2 verification underway.</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
              <button 
                type="submit"
                className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-black rounded-xl cursor-pointer"
              >
                Submit Stage 12 Ground Pilot Report
              </button>

              {currentStage === 12 && (
                <button
                  type="button"
                  disabled={!pilotSubmitted || advancingStage === 12}
                  onClick={() => handleAdvanceStage(12)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {advancingStage === 12 ? 'Advancing…' : (
                    <>Advance to Stage 13 — Outcome Audit <ChevronRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── STAGE 13: OUTCOME AUDIT WORKSPACE ── */}
      {selectedStageTab === 13 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-amber-600" />
              Stage 13 · Outcome Audit & Scaled Production Clearance
            </h3>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${
              currentStage >= 13 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {currentStage >= 13 ? 'Audit In Review' : 'Locked until Stage 12'}
            </span>
          </div>

          <form onSubmit={handleOutcomeAudit} className="space-y-3.5 text-xs">
            {/* Quantitative Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Warning Latency</span>
                <span className="text-base font-black text-emerald-700">{auditMetrics.latencySec}s</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">False Alarm Rate</span>
                <span className="text-base font-black text-emerald-700">{auditMetrics.falseAlarmPct}%</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">System Uptime</span>
                <span className="text-base font-black text-emerald-700">{auditMetrics.uptimePct}%</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Community Approval</span>
                <span className="text-base font-black text-emerald-700">{auditMetrics.communityApprovalPct}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Outcome Audit Summary & Field Test Findings:</label>
              <textarea
                rows={3}
                value={auditSummary}
                onChange={(e) => setAuditSummary(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

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
                <span>Outcome audit submitted. Awaiting Government Disaster Management sign-off.</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={!auditSummary.trim()}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-black rounded-xl cursor-pointer"
            >
              Submit Stage 13 Outcome Audit
            </button>
          </form>
        </div>
      )}

      {/* ── FACULTY MENTOR DIGITAL REVIEW & SIGN-OFF GATE ── */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-heading">
                Faculty Mentor Digital Sign-Off & Stage Advancement Gate
              </h3>
              <p className="text-[11px] text-slate-400">
                Authorized Faculty: <strong className="text-teal-300">{assignedProject?.facultyMentorName || 'Dr. Arvind Sinha (Professor & Head, IoT Lab)'}</strong>
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono bg-slate-800 text-teal-400 border border-slate-700 px-2.5 py-1 rounded-lg">
            SHA-256 e-Sign Active
          </span>
        </div>

        {/* Review Rubric */}
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Hardware & Circuit Design</span>
            <span className="text-emerald-400 font-black text-sm">9.5 / 10 · Approved</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">LoRaWAN Telemetry Reliability</span>
            <span className="text-emerald-400 font-black text-sm">9.8 / 10 · Verified</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Panchayat Field Safety</span>
            <span className="text-emerald-400 font-black text-sm">10.0 / 10 · Certified</span>
          </div>
        </div>

        {/* Faculty Remarks Field */}
        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-300 block">Faculty Evaluation Remarks & Endorsement:</label>
          <textarea
            rows={2}
            value={facultyRemarks}
            onChange={(e) => setFacultyRemarks(e.target.value)}
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs font-medium"
          />
        </div>

        {facultySignOffSuccess && (
          <div className="bg-emerald-950/80 border border-emerald-500 p-3 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Digital Sign-Off Recorded! Challenge stage successfully advanced in Workflow Engine.</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
          <span className="text-[10px] text-slate-400 font-mono">
            Digital Signature: <span className="text-slate-300">BIT-MESRA/FAC-SIGN/2026/08</span>
          </span>

          <button
            type="button"
            disabled={isSigningOff}
            onClick={() => handleFacultySignOffAndAdvance(currentStage)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSigningOff ? 'Recording Digital Sign-Off…' : `Faculty Digital Sign-Off & Advance Stage ${currentStage}`}</span>
          </button>
        </div>
      </div>

      {/* Official Government Student R&D Certificate Voucher */}
      <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
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
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs shrink-0 flex items-center space-x-1.5 cursor-pointer"
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
