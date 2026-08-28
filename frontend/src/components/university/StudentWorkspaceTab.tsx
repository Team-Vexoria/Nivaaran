import React, { useState } from 'react';
import { GraduationCap, Award, CheckCircle2, Upload, ExternalLink } from 'lucide-react';
import { UniversityDoc, StudentRosterItem } from '../../services/universityData';
import { getProjectsFromStore, ProjectDoc } from '../../services/firebaseService';
import { CertificateModal } from '../CertificateModal';

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

  const projects = getProjectsFromStore();
  const assignedProject: ProjectDoc | null = projects.length > 0 ? projects[0] : null;

  const [githubUrl, setGithubUrl] = useState<string>('https://github.com/nivaaran-hei/iot-flood-telemetry-node');
  const [telemetryLogs, setTelemetryLogs] = useState<string>('Sensor Node #04: Water depth 1.4m. Flow velocity 2.1 m/s. Geotag verified.');
  const [isLoggedSuccess, setIsLoggedSuccess] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);

  const handleLogProgress = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedSuccess(true);
    setTimeout(() => setIsLoggedSuccess(false), 3000);
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
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center">
          <Upload className="w-4 h-4 mr-1.5 text-emerald-600" />
          Log R&D Milestone Progress & Hardware Telemetry
        </h3>

        <form onSubmit={handleLogProgress} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">GitHub / Hardware Code Repository Link:</label>
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
            <label className="font-bold text-slate-800 block">Field Sensor Telemetry / Trial Test Logs:</label>
            <textarea 
              rows={2}
              value={telemetryLogs}
              onChange={(e) => setTelemetryLogs(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
            />
          </div>

          {isLoggedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900 font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Milestone telemetry log saved! +4 Academic R&D Credits awarded.</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Submit Milestone Verification Update
            </button>
          </div>
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
