import React, { useState } from 'react';
import { GraduationCap, Award, CheckCircle2, Upload, ExternalLink } from 'lucide-react';
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

interface StudentWorkspaceTabProps {
  university: UniversityDoc;
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
  const assignedProject: ProjectDoc | null = projects.find(p => p.universityId === university.id || p.universityName === university.name) || null;
  const assignedChallenge = assignedProject ? challenges.find(c => c.id === assignedProject.challengeId || c.reportId === assignedProject.challengeId) : undefined;
  const currentStage = assignedChallenge ? getStageForStatus(assignedChallenge.status)?.stageNumber || 0 : 0;

  const [activeMilestoneForm, setActiveMilestoneForm] = useState<'stage11' | 'stage12'>('stage11');
  const [hardwareSpec, setHardwareSpec] = useState<string>('ESP32 Dual-Core + JSN-SR04T Ultrasonic Depth Sensor + LoRa SX1276 (868MHz) + Solar 18650 IP67 Node');
  const [githubUrl, setGithubUrl] = useState<string>('https://github.com/nivaaran-hei/iot-flood-telemetry-node');
  const [telemetryLogs, setTelemetryLogs] = useState<string>('Sensor Node #04: Water depth 1.42m. Flow velocity 2.1 m/s. Geotag verified at [23.3441, 85.3096]. Battery: 94%.');
  const [testingResults, setTestingResults] = useState<string>('Lab tested: ±1cm accuracy up to 4.5m range. LoRaWAN transmission range verified up to 8.2 km line-of-sight.');
  
  const [panchayatLocation, setPanchayatLocation] = useState<string>('Hesag Gram Panchayat, Namkum Block, Ranchi');
  const [beneficiaries, setBeneficiaries] = useState<number>(3200);
  const [groundReport, setGroundReport] = useState<string>('Live field installation on rural culvert. 3 warning sirens operational with SMS dispatch to Mukhiya and Block Development Officer.');

  const [isLoggedSuccess, setIsLoggedSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [pilotLocation, setPilotLocation] = useState<string>('Pilot village / ward');
  const [pilotObservations, setPilotObservations] = useState<string>('');
  const [auditSummary, setAuditSummary] = useState<string>('');
  const [phase3Error, setPhase3Error] = useState<string>('');

  React.useEffect(() => {
    const unsubscribeProjects = subscribeToProjects(setProjects);
    const unsubscribeChallenges = subscribeToChallenges(setChallenges);
    return () => { unsubscribeProjects(); unsubscribeChallenges(); };
  }, []);

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
        submitPrototypeUpdate(assignedProject.id, {
          summary: telemetryLogs,
          repositoryUrl: githubUrl,
          telemetryLog: telemetryLogs,
          evidenceUrls: [],
          submittedBy: currentStudent.name,
        });
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
        submitPilotReport(assignedProject.id, {
          location: panchayatLocation,
          observations: groundReport,
          evidenceUrls: [],
          submittedBy: currentStudent.name,
        });
      }
      setSuccessMessage('✓ Stage 12 Panchayat Pilot Trial submitted! Sent to Government Officer for deployment verification.');
    }

    setIsLoggedSuccess(true);
    setTimeout(() => setIsLoggedSuccess(false), 5000);
  };

  const handlePilotReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedProject?.id || !pilotObservations.trim()) return;
    const saved = submitPilotReport(assignedProject.id, {
      location: pilotLocation,
      observations: pilotObservations.trim(),
      evidenceUrls: [],
      submittedBy: currentStudent.name,
    });
    setPhase3Error(saved ? '' : 'Pilot reports can be submitted once prototype work is active.');
    if (saved) setPilotObservations('');
  };

  const handleOutcomeAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedProject?.id || !auditSummary.trim()) return;
    const saved = submitOutcomeAudit(assignedProject.id, {
      summary: auditSummary.trim(),
      verifiedBy: currentStudent.name,
      metrics: {},
      evidenceUrls: [],
      verifiedAt: new Date().toISOString(),
    });
    setPhase3Error(saved ? '' : 'Outcome audits can be submitted after a pilot report is recorded.');
    if (saved) setAuditSummary('');
  };

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

        {/* Academic R&D Credit Badges */}
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

            {/* Stage Milestones Checklist */}
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

      {/* Student Milestone Progress Submission Form */}
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

          {phase3Error && <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 font-semibold">{phase3Error}</div>}

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

      {/* Phase 3 pilot and outcome submissions */}
      <div className="grid lg:grid-cols-2 gap-4">
        <form onSubmit={handlePilotReport} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div><h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Stage 12 · Pilot field report</h3><p className="text-[11px] text-slate-500 mt-1">Record the real-world test location and observations after prototype readiness.</p></div>
          <input value={pilotLocation} onChange={(e) => setPilotLocation(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" placeholder="Pilot village / ward" />
          <textarea rows={4} value={pilotObservations} onChange={(e) => setPilotObservations(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs" placeholder="Observed performance, community feedback, and test results" />
          <button type="submit" disabled={!assignedProject || currentStage < 11} className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-black rounded-xl">Submit pilot report</button>
        </form>

        <form onSubmit={handleOutcomeAudit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div><h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Stage 13 · Outcome audit</h3><p className="text-[11px] text-slate-500 mt-1">Submit a concise technical and community validation summary for review.</p></div>
          <textarea rows={4} value={auditSummary} onChange={(e) => setAuditSummary(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs" placeholder="Summarize pilot outcomes, limitations, and validation evidence" />
          <button type="submit" disabled={!assignedProject || currentStage < 12} className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-xs font-black rounded-xl">Submit outcome audit</button>
        </form>
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

      {/* Official Government of Jharkhand Certificate Modal */}
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
