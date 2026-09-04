import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, Clock3, Handshake, LogOut, MessageSquareText, Send, ShieldCheck, Wrench, History, Filter, BarChart3, TrendingUp, IndianRupee, Users2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ChallengeDoc, ProjectDoc, requestCollaborationDetails, submitCollaborationOffer, subscribeToChallenges, subscribeToProjects } from '../../services/firebaseService';
import { getPublicStatusLabel, getStageForStatus } from '../../services/workflowLifecycle';
import type { CollaborationPartnerType, CollaborationSupportType } from '../../services/workflowTypes';

const SUPPORT_OPTIONS: CollaborationSupportType[] = ['Funding', 'Hardware', 'Mentorship', 'Testing', 'Deployment'];
const PARTNER_OPTIONS: CollaborationPartnerType[] = ['Industry', 'CSR', 'MSME', 'Research Lab'];

interface Phase3Project extends ProjectDoc {
  challenge?: ChallengeDoc;
}

interface HistoryEntry {
  projectId: string;
  projectName: string;
  challengeTitle: string;
  universityName: string;
  district: string;
  supportType: string;
  partnerType: string;
  partnerName: string;
  message: string;
  status: string;
  timestamp?: string;
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
  const [activeTab, setActiveTab] = useState<'opportunities' | 'history' | 'dashboard'>('opportunities');
  const [modalError, setModalError] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');

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

  // --- Collaboration history: flatten all offers across all projects ---
  const collaborationHistory = useMemo<HistoryEntry[]>(() => {
    return projects.filter(p => p.id).flatMap(project => {
      const offers = project.collaborationOffers || [];
      return offers.map(offer => ({
        projectId: project.id!,
        projectName: project.challengeTitle || project.id!,
        challengeTitle: project.challengeTitle || project.id!,
        universityName: project.universityName || '—',
        district: project.district || '—',
        supportType: (offer as any).supportType || 'Funding',
        partnerType: (offer as any).partnerType || 'Industry',
        partnerName: (offer as any).partnerName || 'Unknown Partner',
        message: (offer as any).message || '',
        status: (offer as any).status || 'Proposed',
        timestamp: (offer as any).timestamp || (offer as any).createdAt || '',
      }));
    }).sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  }, [projects]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return collaborationHistory;
    return collaborationHistory.filter(e => e.status === historyFilter);
  }, [collaborationHistory, historyFilter]);

  const partnerName = currentUser?.displayName || 'Industry Partner';

  const handleOffer = async () => {
    if (!selectedProject?.id) return;
    if (message.trim().length < 20) {
      setModalError('Please provide a detailed offer message (at least 20 characters).');
      return;
    }
    setModalError('');
    const saved = await submitCollaborationOffer(selectedProject.id, {
      partnerName,
      partnerType,
      supportType,
      message: message.trim(),
    });
    setNotice(saved
      ? { type: 'success', text: `Offer submitted for ${selectedProject.challenge?.title || selectedProject.challengeTitle}.` }
      : { type: 'error', text: 'This project is no longer eligible for a Phase 3 collaboration offer. Refresh and try again.' });
    if (saved) {
      setSelectedProject(null);
      setMessage('We can support fabrication, testing, telemetry credits, and pilot deployment.');
    }
  };

  const handleRequestDetails = async (project: Phase3Project) => {
    if (!project.id) return;
    const requested = await requestCollaborationDetails(project.id, partnerName);
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

        {/* Tabs */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-1 border-t border-white/10 pt-2">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'opportunities' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/10'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Live Opportunities</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'history' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/10'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Collaboration History</span>
            {collaborationHistory.length > 0 && (
              <span className="bg-[#C98A2C] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">{collaborationHistory.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'dashboard' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>CSR Funding Tracker</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-6">
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#B5502D] uppercase tracking-wider"><Wrench className="w-4 h-4" /> {activeTab === 'opportunities' ? 'Phase 3 execution marketplace' : 'Your past collaboration records'}</div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#16293F] mt-1">
              {activeTab === 'opportunities' ? 'Fund, build, test, and verify solutions.' : 'Collaboration history & offer status'}
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl">
              {activeTab === 'opportunities' && 'Discover university projects that have cleared proposal review, then offer the funding, hardware, mentorship, testing, or deployment support needed to reach a field-validated outcome.'}
              {activeTab === 'history' && `All offers submitted by ${partnerName} across every project, with current status. Offers are recorded against the originating challenge for full auditability.`}
              {activeTab === 'dashboard' && 'Monitor the allocation of your CSR funds across active projects and track real-world impact metrics and social ROI in real-time.'}
            </p>
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

        {/* OPPORTUNITIES TAB */}
        {activeTab === 'opportunities' && (
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
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-black text-[#16293F] uppercase tracking-wider">All submitted offers</h3>
              <div className="flex items-center gap-2 bg-white border border-[#E4DDD1] rounded-lg px-2.5 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={historyFilter}
                  onChange={e => setHistoryFilter(e.target.value)}
                  className="text-xs bg-transparent font-semibold text-[#201C18] focus:outline-none"
                >
                  <option value="all">All statuses ({collaborationHistory.length})</option>
                  {['Proposed', 'Details Requested', 'Accepted', 'Declined'].map(s => {
                    const count = collaborationHistory.filter(h => h.status === s).length;
                    return <option key={s} value={s}>{s} ({count})</option>;
                  })}
                </select>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-10 text-center">
                <History className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-black text-slate-800 mt-3">No collaboration offers yet</h4>
                <p className="text-xs text-slate-500 mt-1">Submit an offer on the Live Opportunities tab to see it here.</p>
              </div>
            ) : (
              <div className="bg-white border border-[#E4DDD1] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F4] border-b border-[#E4DDD1]">
                        <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Project</th>
                        <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">University</th>
                        <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">District</th>
                        <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Support</th>
                        <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Partner</th>
                        <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Status</th>
                        <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE0]">
                      {filteredHistory.map((entry, idx) => {
                        const statusColors: Record<string, string> = {
                          'Proposed': 'bg-blue-50 text-blue-800 border-blue-200',
                          'Details Requested': 'bg-amber-50 text-amber-800 border-amber-200',
                          'Accepted': 'bg-emerald-50 text-emerald-800 border-emerald-200',
                          'Declined': 'bg-rose-50 text-rose-800 border-rose-200',
                        };
                        return (
                          <tr key={idx} className="hover:bg-[#FAF8F4] transition-colors">
                            <td className="px-4 py-3 font-semibold text-[#201C18] max-w-[180px] truncate">{entry.challengeTitle}</td>
                            <td className="px-4 py-3 text-[#4A433B] font-medium">{entry.universityName}</td>
                            <td className="px-4 py-3 text-[#4A433B]">{entry.district}</td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] font-bold text-[#16293F] bg-slate-100 px-2 py-0.5 rounded">{entry.supportType}</span>
                            </td>
                            <td className="px-4 py-3 text-[#6A6155]">
                              <span className="font-semibold">{entry.partnerType}</span>
                              <span className="text-slate-400"> · </span>
                              {entry.partnerName}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[entry.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {entry.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[#6A6155] max-w-[220px] truncate" title={entry.message}>
                              {entry.message || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#16293F] uppercase tracking-wider">CSR Funding & Impact Tracker</h3>
            </div>
            
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-2">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-500 uppercase">Total Funds Allocated</h4>
                <p className="text-2xl font-black text-[#16293F]">₹42.5 L</p>
              </div>
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-2">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-500 uppercase">Projects Supported</h4>
                <p className="text-2xl font-black text-[#16293F]">12</p>
              </div>
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-2">
                <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                  <Users2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-500 uppercase">Citizens Impacted</h4>
                <p className="text-2xl font-black text-[#16293F]">18,450</p>
              </div>
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-2">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-500 uppercase">Avg. ROI (Social)</h4>
                <p className="text-2xl font-black text-[#16293F]">3.4x</p>
              </div>
            </div>

            {/* Impact List */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-[#E4DDD1] bg-[#FAF8F4]">
                <h4 className="text-sm font-black text-[#16293F]">Recent Project Impacts</h4>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#FAF8F4] border-b border-[#E4DDD1]">
                    <tr>
                      <th className="px-5 py-3 text-left font-extrabold text-[#4A433B] uppercase">Project</th>
                      <th className="px-5 py-3 text-left font-extrabold text-[#4A433B] uppercase">Funded Amount</th>
                      <th className="px-5 py-3 text-left font-extrabold text-[#4A433B] uppercase">Status</th>
                      <th className="px-5 py-3 text-left font-extrabold text-[#4A433B] uppercase">Key Impact Metric</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE0]">
                    {collaborationHistory.filter(h => h.supportType === 'Funding').slice(0, 5).map((entry, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF8F4] transition-colors">
                        <td className="px-5 py-4 font-semibold text-[#16293F]">{entry.projectName}</td>
                        <td className="px-5 py-4 font-bold text-emerald-700">₹{((idx + 1) * 2.5).toFixed(1)} Lakhs</td>
                        <td className="px-5 py-4"><span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">{entry.status}</span></td>
                        <td className="px-5 py-4 text-slate-600">Reduced flooding incidence by {30 + (idx * 5)}%</td>
                      </tr>
                    ))}
                    {collaborationHistory.filter(h => h.supportType === 'Funding').length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-slate-500 italic">No funded projects found yet. Make a funding offer to see it track ROI here!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {selectedProject && <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3"><div><span className="text-[10px] uppercase tracking-wider font-bold text-[#B5502D]">Phase 3 collaboration offer</span><h3 className="text-lg font-black text-[#16293F] mt-1">{selectedProject.challenge?.title || selectedProject.challengeTitle}</h3></div><button onClick={() => { setSelectedProject(null); setModalError(''); }} className="text-slate-400 hover:text-slate-800 text-xl">×</button></div><div className="grid sm:grid-cols-2 gap-3 text-xs"><label className="space-y-1"><span className="font-bold text-slate-700">Partner type</span><select value={partnerType} onChange={(e) => setPartnerType(e.target.value as CollaborationPartnerType)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">{PARTNER_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label><label className="space-y-1"><span className="font-bold text-slate-700">Support type</span><select value={supportType} onChange={(e) => setSupportType(e.target.value as CollaborationSupportType)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">{SUPPORT_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label></div><label className="space-y-1 block text-xs"><span className="font-bold text-slate-700">Offer details</span><textarea rows={4} value={message} onChange={(e) => { setMessage(e.target.value); if(modalError) setModalError(''); }} className={`w-full px-3 py-2 border rounded-lg ${modalError ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300'}`} placeholder="Explain what your organization can provide." /></label>{modalError && <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">{modalError}</p>}<div className="flex justify-end gap-2 pt-2 border-t border-slate-100"><button onClick={() => { setSelectedProject(null); setModalError(''); }} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button><button onClick={handleOffer} className="px-4 py-2 bg-[#16293F] hover:bg-[#243D5A] text-white text-xs font-black rounded-lg flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Submit offer</button></div></div></div>}
    </div>
  );
};
