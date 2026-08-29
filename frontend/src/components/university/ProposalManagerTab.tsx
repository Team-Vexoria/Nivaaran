import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import { getProjectsFromStore, ProjectDoc, saveProjectTeamToStore } from '../../services/firebaseService';
import { UniversityDoc } from '../../services/universityData';

interface ProposalManagerTabProps {
  university: UniversityDoc;
  activeChallengeId?: string;
  onProposalSubmitted: () => void;
}

export const ProposalManagerTab: React.FC<ProposalManagerTabProps> = ({
  university,
  activeChallengeId,
  onProposalSubmitted,
}) => {
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [technicalApproach, setTechnicalApproach] = useState<string>(
    'Deploy IoT telemetry sensors coupled with LoRaWAN wireless nodes for real-time flood monitoring. Integrate GIS satellite imagery mapping with a citizen mobile alert app.'
  );
  const [estimatedBudget, setEstimatedBudget] = useState<number>(150000);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const loaded = getProjectsFromStore().filter(p => p.universityId === university.id || p.universityName === university.name);
    setProjects(loaded);
    if (activeChallengeId) {
      const match = loaded.find(p => p.challengeId === activeChallengeId);
      if (match && match.id) {
        setSelectedProjectId(match.id);
      } else if (loaded.length > 0 && loaded[0].id) {
        setSelectedProjectId(loaded[0].id);
      }
    } else if (loaded.length > 0 && loaded[0].id) {
      setSelectedProjectId(loaded[0].id);
    }
  }, [university, activeChallengeId]);

  const currentProject = projects.find(p => p.id === selectedProjectId) || (projects.length > 0 ? projects[0] : null);

  const handleSubmitProposal = () => {
    if (!currentProject) return;

    const proposalId = `PROP-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const updated: ProjectDoc = {
      ...currentProject,
      status: 'Proposal Submitted',
      budgetEstimated: estimatedBudget,
      proposals: [
        ...(currentProject.proposals || []),
        {
          id: proposalId,
          projectId: currentProject.id || proposalId,
          title: `Solution proposal for ${currentProject.challengeTitle}`,
          description: `Structured technical proposal for addressing ${currentProject.challengeTitle}.`,
          approach: technicalApproach,
          estimatedBudget,
          estimatedTimeline: '21 days to pilot readiness',
          status: 'Submitted',
          submittedBy: university.name,
          submittedAt: new Date().toISOString(),
        },
      ],
    };

    const saved = saveProjectTeamToStore(updated);
    if (!saved) return;
    setIsSubmittedSuccess(true);
    setTimeout(() => {
      onProposalSubmitted();
    }, 1500);
  };

  if (!currentProject) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <FileText className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">No R&D Project Team Formed Yet</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Please accept a challenge from Tab 1 and assemble a multidisciplinary team in Tab 2 before drafting a technical proposal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Project Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-extrabold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                Stage 9: Technical Proposal
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                {currentProject.status}
              </span>
            </div>
            <h2 className="text-xl font-extrabold font-heading text-slate-900 mt-1">
              R&D Solution Proposal & Milestone Planner
            </h2>
          </div>

          <div className="shrink-0">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.challengeTitle} ({p.district})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Project Summary Bar */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl grid sm:grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] font-bold block">FACULTY LEAD</span>
            <span className="font-extrabold text-slate-900">{currentProject.facultyMentorName}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-bold block">MULTIDISCIPLINARY TEAM</span>
            <span className="font-extrabold text-slate-900">{currentProject.teamMembers?.length || 0} Students Assigned</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-bold block">TARGET DISTRICT</span>
            <span className="font-extrabold text-slate-900">{currentProject.district} District</span>
          </div>
        </div>
      </div>

      {/* Technical Approach & Budget Form */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          1. Executive Technical Architecture & Methodology
        </h3>
        
        <textarea 
          rows={3}
          value={technicalApproach}
          onChange={(e) => setTechnicalApproach(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 leading-relaxed"
        />

        <div className="pt-2 border-t border-slate-100 grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">
              Estimated R&D & Hardware Testing Budget (₹ INR):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">₹</span>
              <input 
                type="number"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">
              Target Field Trial Completion:
            </label>
            <input 
              type="text"
              readOnly
              value="21 Days (Verified Fast-Track Pipeline)"
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* 4 Development Milestones */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          2. Official 4-Stage Development Milestones
        </h3>

        <div className="space-y-2.5">
          {currentProject.milestones?.map((m, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-slate-900 text-white rounded-full font-black text-xs inline-flex items-center justify-center shrink-0">
                  {m.stageNumber}
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900">{m.title}</h4>
                  <p className="text-[11px] text-slate-600 font-medium">{m.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono font-bold text-slate-500 block">Target: {m.targetDays} Days</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  m.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Notification Alert */}
      {isSubmittedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center space-x-2 text-xs text-emerald-900 font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Technical R&D Proposal successfully submitted to Government of Jharkhand Intake!</span>
        </div>
      )}

      {/* Submit Proposal Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSubmitProposal}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center space-x-2 active:scale-95"
        >
          <FileText className="w-4 h-4" />
          <span>Submit Proposal to Government for Milestone Clearance</span>
        </button>
      </div>

    </div>
  );
};
