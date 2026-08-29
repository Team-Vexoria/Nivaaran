import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, Clock3, Handshake, LogOut, MessageSquareText, Send, ShieldCheck, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ChallengeDoc, ProjectDoc, requestCollaborationDetails, submitCollaborationOffer, subscribeToChallenges, subscribeToProjects } from '../../services/firebaseService';
import { getPublicStatusLabel, getStageForStatus } from '../../services/workflowLifecycle';
import type { CollaborationPartnerType, CollaborationSupportType } from '../../services/workflowTypes';

const SUPPORT_OPTIONS: CollaborationSupportType[] = ['Funding', 'Hardware', 'Mentorship', 'Testing', 'Deployment'];
const PARTNER_OPTIONS: CollaborationPartnerType[] = ['Industry', 'CSR', 'MSME', 'Research Lab'];

interface Phase3Project extends ProjectDoc {
  challenge?: ChallengeDoc;
}

export const IndustryPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);
  const [selectedProject, setSelectedProject] = useState<Phase3Project | null>(null);
  const [partnerType, setPartnerType] = useState<CollaborationPartnerType>('Industry');
  const [supportType, setSupportType] = useState<CollaborationSupportType>('Funding');
  const [message, setMessage] = useState('We can support fabrication, testing, telemetry credits, and pilot deployment.');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsubscribeProjects = subscribeToProjects(setProjects);
    const unsubscribeChallenges = subscribeToChallenges(setChallenges);
    return () => { unsubscribeProjects(); unsubscribeChallenges(); };
  }, []);

  const phase3Projects = useMemo<Phase3Project[]>(() => {
    const challengeById = new Map<string, ChallengeDoc>();
    challenges.forEach((challenge) => {
      challengeById.set(challenge.id || challenge.reportId, challenge);
      challengeById.set(challenge.reportId, challenge);
    });
    return projects
      .map((project) => ({ ...project, challenge: challengeById.get(project.challengeId) }))
      .filter((project) => {
        const stage = project.challenge ? getStageForStatus(project.challenge.status)?.stageNumber || 0 : 0;
        return stage >= 9 && stage <= 13;
      });
  }, [projects, challenges]);

  const pipelineCounts = useMemo(() => {
    const counts = { opportunities: 0, collaboration: 0, prototype: 0, pilot: 0, audit: 0 };
    phase3Projects.forEach((project) => {
      const stage = project.challenge ? getStageForStatus(project.challenge.status)?.stageNumber || 0 : 0;
      if (stage === 9) counts.opportunities += 1;
      if (stage === 10) counts.collaboration += 1;
      if (stage === 11) counts.prototype += 1;
      if (stage === 12) counts.pilot += 1;
      if (stage === 13) counts.audit += 1;
    });
    return counts;
  }, [phase3Projects]);

  const partnerName = currentUser?.displayName || 'Industry Partner';

  const handleOffer = () => {
    if (!selectedProject?.id) return;
    const saved = submitCollaborationOffer(selectedProject.id, {
      partnerName,
      partnerType,
      supportType,
      message: message.trim() || 'Ready to support this project through the Nivaaran collaboration marketplace.',
    });
    setNotice(saved
      ? { type: 'success', text: `Offer submitted for ${selectedProject.challenge?.title || selectedProject.challengeTitle}.` }
      : { type: 'error', text: 'This project is no longer eligible for a Phase 3 collaboration offer. Refresh and try again.' });
    if (saved) setSelectedProject(null);
  };

  const handleRequestDetails = (project: Phase3Project) => {
    if (!project.id) return;
    const requested = requestCollaborationDetails(project.id, partnerName);
    setNotice(requested
      ? { type: 'success', text: `Technical details requested from ${project.universityName}.` }
      : { type: 'error', text: 'The request could not be recorded. Please refresh and try again.' });
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#201C18] flex flex-col">
      <header className="bg-[#16293F] text-white px-5 sm:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C98A2C] flex items-center justify-center font-black text-xl">I</div>
            <div><h1 className="text-lg font-black">Industry & CSR Collaboration</h1><p className="text-xs text-slate-300">Phase 3 · Stages 10–13 · Nivaaran Marketplace</p></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs bg-white/10 px-3 py-1.5 rounded-full text-slate-200">{partnerName} · {currentUser?.role || 'Partner'}</span>
            <button onClick={logout} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Logout</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-6">
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#B5502D] uppercase tracking-wider"><Wrench className="w-4 h-4" /> Phase 3 execution marketplace</div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#16293F] mt-1">Fund, build, test, and verify solutions.</h2>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl">Discover university projects that have cleared proposal review, then offer the funding, hardware, mentorship, testing, or deployment support needed to reach a field-validated outcome.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-[#E4DDD1] px-3 py-2 rounded-xl"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Every offer is recorded against the originating challenge</div>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            ['Open proposals', pipelineCounts.opportunities, 'text-blue-700'],
            ['Collaboration', pipelineCounts.collaboration, 'text-[#B5502D]'],
            ['Prototype', pipelineCounts.prototype, 'text-amber-700'],
            ['Pilot', pipelineCounts.pilot, 'text-emerald-700'],
            ['Outcome audit', pipelineCounts.audit, 'text-indigo-700'],
          ].map(([label, count, color]) => <div key={label} className="bg-white border border-[#E4DDD1] rounded-xl p-3"><span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500">{label}</span><span className={`block text-2xl font-black ${color}`}>{count}</span></div>)}
        </section>

        {notice && <div className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 ${notice.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>{notice.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Clock3 className="w-4 h-4" />}{notice.text}<button onClick={() => setNotice(null)} className="ml-auto text-xs underline">Dismiss</button></div>}

        <section className="space-y-3">
          <div className="flex items-center justify-between"><h3 className="text-sm font-black text-[#16293F] uppercase tracking-wider">Live project opportunities</h3><span className="text-xs text-slate-500">{phase3Projects.length} projects in Stages 9–13</span></div>
          {phase3Projects.length === 0 ? (
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-10 text-center"><Building2 className="w-10 h-10 text-slate-300 mx-auto" /><h4 className="font-black text-slate-800 mt-3">No Phase 3 projects are ready yet</h4><p className="text-xs text-slate-500 mt-1">Projects appear here after a university submits a proposal.</p></div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {phase3Projects.map((project) => {
                const stage = project.challenge ? getStageForStatus(project.challenge.status) : undefined;
                const offers = project.collaborationOffers || [];
                return <article key={project.id} className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{project.id}</span><span className="text-[10px] font-bold text-[#B5502D] bg-[#B5502D]/10 px-2 py-1 rounded">Stage {stage?.stageNumber || '—'} · {project.challenge ? getPublicStatusLabel(project.challenge.status) : project.status}</span></div><h4 className="text-base font-black text-[#16293F] mt-2">{project.challenge?.title || project.challengeTitle}</h4></div><span className="text-xs font-black text-slate-600 whitespace-nowrap">{project.universityName}</span></div>
                  <p className="text-xs text-slate-600 leading-relaxed">{project.proposals?.[project.proposals.length - 1]?.approach || 'University project team is preparing a technical solution and seeking a Phase 3 partner.'}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs"><div className="bg-slate-50 rounded-lg p-2.5"><span className="block text-[10px] text-slate-500 font-bold">TEAM</span><strong>{project.teamMembers?.length || 0} members</strong></div><div className="bg-slate-50 rounded-lg p-2.5"><span className="block text-[10px] text-slate-500 font-bold">DISTRICT</span><strong>{project.district}</strong></div></div>
                  {offers.length > 0 && <div className="text-xs text-slate-600 border-t border-slate-100 pt-3"><span className="font-bold">{offers.length} collaboration record{offers.length === 1 ? '' : 's'}</span> · latest: {offers[offers.length - 1].status}</div>}
                  <div className="flex flex-wrap gap-2 pt-1"><button onClick={() => { setSelectedProject(project); setNotice(null); }} className="px-3 py-2 bg-[#C98A2C] hover:bg-[#A96D16] text-white text-xs font-black rounded-lg flex items-center gap-1.5"><Handshake className="w-3.5 h-3.5" /> Offer support</button><button onClick={() => handleRequestDetails(project)} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-[#16293F] text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1.5"><MessageSquareText className="w-3.5 h-3.5" /> Request technical details</button></div>
                </article>;
              })}
            </div>
          )}
        </section>
      </main>

      {selectedProject && <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3"><div><span className="text-[10px] uppercase tracking-wider font-bold text-[#B5502D]">Phase 3 collaboration offer</span><h3 className="text-lg font-black text-[#16293F] mt-1">{selectedProject.challenge?.title || selectedProject.challengeTitle}</h3></div><button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-slate-800 text-xl">×</button></div><div className="grid sm:grid-cols-2 gap-3 text-xs"><label className="space-y-1"><span className="font-bold text-slate-700">Partner type</span><select value={partnerType} onChange={(e) => setPartnerType(e.target.value as CollaborationPartnerType)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">{PARTNER_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label><label className="space-y-1"><span className="font-bold text-slate-700">Support type</span><select value={supportType} onChange={(e) => setSupportType(e.target.value as CollaborationSupportType)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">{SUPPORT_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label></div><label className="space-y-1 block text-xs"><span className="font-bold text-slate-700">Offer details</span><textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="Explain what your organization can provide." /></label><div className="flex justify-end gap-2 pt-2 border-t border-slate-100"><button onClick={() => setSelectedProject(null)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button><button onClick={handleOffer} className="px-4 py-2 bg-[#16293F] hover:bg-[#243D5A] text-white text-xs font-black rounded-lg flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Submit offer</button></div></div></div>}
    </div>
  );
};
