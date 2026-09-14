import React, { useEffect, useMemo, useState } from 'react';
import {
  Users, LogOut, MapPin, CheckCircle2, AlertTriangle,
  FileText, Handshake, MessageSquare, Search, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToChallenges, subscribeToProjects, submitOutcomeAudit, ChallengeDoc, ProjectDoc } from '../../services/firebaseService';
import { getStageForStatus, getPublicStatusLabel } from '../../services/workflowLifecycle';
import { PortalLoadingState, PortalEmptyState } from '../../components/PortalUIStates';
import { NotificationBellDropdown } from '../../components/notifications/NotificationBellDropdown';
import { CrossPortalMessagingHub } from '../../components/communication/CrossPortalMessagingHub';
import { ChallengeDetailModal } from '../../components/ChallengeDetailModal';

type CommunityTab = 'overview' | 'challenges' | 'actions' | 'messages';

/**
 * Community / NGO Portal
 *
 * Provides a simplified view for community organizations and NGOs:
 * - Overview of local challenges in their district
 * - Track challenges they've reported or are involved with
 * - View government + university activity on community issues
 */
export const CommunityPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<CommunityTab>('overview');
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingChallenge, setViewingChallenge] = useState<ChallengeDoc | null>(null);
  
  // Action view state
  const [actionView, setActionView] = useState<'menu' | 'adopt' | 'audit'>('menu');
  const [adoptedIds, setAdoptedIds] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Audit form state
  const [auditNotes, setAuditNotes] = useState('');
  const [communityFeedback, setCommunityFeedback] = useState('');
  const [impactMetrics, setImpactMetrics] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubChallenges = subscribeToChallenges((data) => {
        setChallenges(data);
        setLoading(false);
    });
    const unsubProjects = subscribeToProjects((data) => {
        setProjects(data);
    });
    
    try {
      const stored = localStorage.getItem('ngo_adopted_challenges');
      if (stored) setAdoptedIds(JSON.parse(stored));
    } catch {}
    
    return () => { unsubChallenges(); unsubProjects(); };
  }, []);

  const handleAdopt = (id: string) => {
    const next = [...adoptedIds, id];
    setAdoptedIds(next);
    localStorage.setItem('ngo_adopted_challenges', JSON.stringify(next));
  };

  const handleUnadopt = (id: string) => {
    const next = adoptedIds.filter(a => a !== id);
    setAdoptedIds(next);
    localStorage.setItem('ngo_adopted_challenges', JSON.stringify(next));
  };

  const handleSubmitAudit = () => {
    if (!selectedProjectId) return;
    submitOutcomeAudit(selectedProjectId, {
      summary: auditNotes || 'Community Outcome Audit',
      verifiedBy: orgName,
      verifiedAt: new Date().toISOString(),
      communityFeedback,
      auditNotes,
      metrics: { summary: impactMetrics },
      evidenceUrls: [],
      isSuccessful: true,
    });
    setSelectedProjectId(null);
    setAuditNotes('');
    setCommunityFeedback('');
    setImpactMetrics('');
    alert('Outcome Audit submitted successfully!');
    setActionView('menu');
  };

  const orgName = currentUser?.displayName || 'Community Organization';

  // Stats
  const stats = useMemo(() => {
    const total = challenges.length;
    const active = challenges.filter(c => {
      const s = getStageForStatus(c.status)?.stageNumber || 0;
      return s >= 3 && s <= 13;
    }).length;
    const resolved = challenges.filter(c =>
      c.status === 'Resolved' || c.status === 'Closed'
    ).length;
    const pending = challenges.filter(c => c.status === 'Under Review').length;
    return { total, active, resolved, pending };
  }, [challenges]);

  const filtered = useMemo(() => {
    if (!searchQuery) return challenges;
    const q = searchQuery.toLowerCase();
    return challenges.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [challenges, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#201C18] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#1A3A2A] text-white px-4 sm:px-6 py-3 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-[#2C6E49] rounded-xl flex items-center justify-center font-black text-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight">NIVAARAN</span>
                <span className="text-[10px] font-extrabold bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Community Portal
                </span>
              </div>
              <span className="text-[10px] text-white/60 font-semibold block">
                {currentUser?.role || 'Community / NGO'} · {orgName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-[11px] bg-white/10 px-3 py-1 rounded-full text-white/70 font-semibold">
              {orgName}
            </span>
            <NotificationBellDropdown userRole="community" userDistrict={orgName} />
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="font-bold">Logout</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto mt-2.5 flex items-center gap-1 border-t border-white/10 pt-2">
          {([
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'challenges', label: 'All Challenges', icon: AlertTriangle },
            { id: 'actions', label: 'NGO Actions', icon: Handshake },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setActionView('menu'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">

        {loading ? (
          <PortalLoadingState />
        ) : (
          <>
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <>
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Community Impact Dashboard</h2>
              <p className="text-xs text-[#6A6155]">
                Track how community-reported challenges are progressing through the government and university pipeline.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Challenges', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-100' },
                { label: 'Pending Review', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-100' },
                { label: 'Active Pipeline', value: stats.active, color: 'text-blue-700', bg: 'bg-blue-100' },
                { label: 'Resolved', value: stats.resolved, color: 'text-emerald-700', bg: 'bg-emerald-100' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white border border-[#E4DDD1] rounded-2xl p-4 shadow-2xs space-y-2">
                  <span className="text-xs text-[#6A6155] font-medium">{kpi.label}</span>
                  <p className={`text-2xl font-extrabold font-heading ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* How It Works */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#201C18]">How Community Issues Get Resolved</h3>
              <div className="grid sm:grid-cols-4 gap-3">
                {[
                  { stage: '1', title: 'Report Filed', desc: 'Citizens or NGOs report ground-level problems with photo/video evidence', color: 'bg-amber-100 text-amber-800' },
                  { stage: '2', title: 'Gov Validation', desc: 'Government officers verify, validate, or request more evidence', color: 'bg-blue-100 text-blue-800' },
                  { stage: '3', title: 'University R&D', desc: 'Matched HEI labs build IoT prototypes and field-tested solutions', color: 'bg-emerald-100 text-emerald-800' },
                  { stage: '4', title: 'Deploy & Close', desc: 'Solution is deployed, audited, and the challenge is archived', color: 'bg-purple-100 text-purple-800' },
                ].map(s => (
                  <div key={s.stage} className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3.5 space-y-2">
                    <span className={`w-7 h-7 rounded-lg ${s.color} font-extrabold flex items-center justify-center text-sm`}>
                      {s.stage}
                    </span>
                    <p className="text-xs font-bold text-[#201C18]">{s.title}</p>
                    <p className="text-[11px] text-[#6A6155] leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Challenges */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-[#201C18]">Recent Community Challenges</h3>
              {challenges.length === 0 ? (
                <PortalEmptyState
                  title="No challenges reported yet"
                  description="Community-reported challenges appear here once submitted."
                  icon={<AlertTriangle className="w-8 h-8 text-[#C98A2C]" />}
                />
              ) : (
                <div className="divide-y divide-[#F0EBE0]">
                  {challenges.slice(0, 5).map(ch => {
                    return (
                      <div key={ch.id || ch.reportId} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#201C18] truncate">{ch.title}</p>
                          <p className="text-[11px] text-[#8A7F72] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {ch.district} · {ch.category}
                          </p>
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EAE4D8] text-[#4A433B] shrink-0">
                          {getPublicStatusLabel(ch.status)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ALL CHALLENGES */}
        {activeTab === 'challenges' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[#201C18]">All Community Challenges</h2>
                <p className="text-xs text-[#6A6155]">{filtered.length} challenges across Jharkhand</p>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A7F72]" />
                <input
                  type="text"
                  placeholder="Search title, district…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E4DDD1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C6E49] w-52"
                />
              </div>
            </div>

            <div className="bg-white border border-[#E4DDD1] rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#FAF8F4] border-b border-[#E4DDD1]">
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Challenge</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">District</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Category</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Status</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">HEI Assigned</th>
                      <th className="px-4 py-2.5 text-right font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE0]">
                    {filtered.slice(0, 50).map(ch => (
                      <tr 
                        key={ch.id || ch.reportId} 
                        onClick={() => setViewingChallenge(ch)}
                        className="hover:bg-[#F3EDE2] transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-2.5 font-semibold text-[#201C18] max-w-[220px] truncate group-hover:text-[#2C6E49]">
                          {ch.title}
                        </td>
                        <td className="px-4 py-2.5 text-[#4A433B]">{ch.district}</td>
                        <td className="px-4 py-2.5 text-[#6A6155]">{ch.category}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAE4D8] text-[#4A433B]">
                            {getPublicStatusLabel(ch.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[#2C6E49] font-semibold">{ch.assignedHEI || 'Pending Allocation'}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingChallenge(ch);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2C6E49] hover:text-[#23583a] bg-[#2C6E49]/10 hover:bg-[#2C6E49]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <PortalEmptyState
                            title="No challenges found"
                            description="Try adjusting your search filters."
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* NGO ACTIONS */}
        {activeTab === 'actions' && (
          <section className="space-y-6">
            {actionView === 'menu' && (
              <>
                <div>
                  <h2 className="text-lg font-black text-[#201C18]">NGO & Community Partner Actions</h2>
                  <p className="text-xs text-[#6A6155]">
                    Coordinate with government and university teams on community challenges.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      icon: Handshake,
                      title: 'Adopt a Challenge',
                      desc: 'Track and monitor local challenges in your district to ensure they get resolved.',
                      color: 'text-[#2C6E49]',
                      bg: 'bg-[#F0FAF4]',
                      border: 'border-[#C3E6D0]',
                      action: () => setActionView('adopt')
                    },
                    {
                      icon: CheckCircle2,
                      title: 'Outcome Audit',
                      desc: 'Submit a third-party validation report for pilot projects deployed in your community.',
                      color: 'text-[#C98A2C]',
                      bg: 'bg-[#FFF8EC]',
                      border: 'border-[#F0D99A]',
                      action: () => setActionView('audit')
                    },
                    {
                      icon: MessageSquare,
                      title: 'Community Feedback',
                      desc: 'Provide ground-level feedback on deployed solutions to help improve outcomes.',
                      color: 'text-[#B5502D]',
                      bg: 'bg-[#FFF0EE]',
                      border: 'border-[#F5C6C0]',
                      action: () => {}
                    },
                    {
                      icon: Users,
                      title: 'Volunteer Mobilization',
                      desc: 'Register community volunteers for pilot testing and solution deployment.',
                      color: 'text-[#2C6E49]',
                      bg: 'bg-[#F0FAF4]',
                      border: 'border-[#C3E6D0]',
                      action: () => {}
                    },
                    {
                      icon: MapPin,
                      title: 'Field Verification',
                      desc: 'Assist government officers with on-ground verification of reported challenges.',
                      color: 'text-[#C98A2C]',
                      bg: 'bg-[#FFF8EC]',
                      border: 'border-[#F0D99A]',
                      action: () => {}
                    },
                    {
                      icon: FileText,
                      title: 'Report New Challenge',
                      desc: 'Submit a community-identified problem on behalf of your organization with ground-level evidence.',
                      color: 'text-[#B5502D]',
                      bg: 'bg-[#FFF0EE]',
                      border: 'border-[#F5C6C0]',
                      action: () => {}
                    },
                  ].map((actionItem, i) => (
                    <div
                      key={i}
                      onClick={actionItem.action}
                      className={`${actionItem.bg} border ${actionItem.border} rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow cursor-pointer`}
                    >
                      <actionItem.icon className={`w-6 h-6 ${actionItem.color}`} />
                      <h3 className="text-sm font-extrabold text-[#201C18]">{actionItem.title}</h3>
                      <p className="text-xs text-[#6A6155] leading-relaxed">{actionItem.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl p-5 text-center space-y-2">
                  <p className="text-xs text-[#8A7F72]">
                    Additional NGO coordination features — volunteer management and field verification workflows — are available in the production build.
                  </p>
                </div>
              </>
            )}

            {actionView === 'adopt' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-[#201C18]">Adopt a Challenge</h2>
                    <p className="text-xs text-[#6A6155]">Monitor local challenges to ensure timely resolution.</p>
                  </div>
                  <button onClick={() => setActionView('menu')} className="text-xs font-bold text-slate-500 hover:text-slate-800">← Back</button>
                </div>
                <div className="bg-white border border-[#E4DDD1] rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead className="bg-[#FAF8F4] border-b border-[#E4DDD1]">
                      <tr>
                        <th className="px-5 py-3 text-left font-extrabold text-[#4A433B] uppercase">Challenge</th>
                        <th className="px-5 py-3 text-left font-extrabold text-[#4A433B] uppercase">District</th>
                        <th className="px-5 py-3 text-left font-extrabold text-[#4A433B] uppercase">Status</th>
                        <th className="px-5 py-3 text-right font-extrabold text-[#4A433B] uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE0]">
                      {challenges.slice(0, 15).map(ch => {
                        const isAdopted = adoptedIds.includes(ch.id || ch.reportId);
                        return (
                          <tr 
                            key={ch.id || ch.reportId} 
                            onClick={() => setViewingChallenge(ch)}
                            className="hover:bg-[#F3EDE2] transition-colors cursor-pointer group"
                          >
                            <td className="px-5 py-3 font-semibold text-[#16293F] max-w-[200px] truncate group-hover:text-[#2C6E49]">{ch.title}</td>
                            <td className="px-5 py-3 text-slate-600">{ch.district}</td>
                            <td className="px-5 py-3">
                              <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold">{getPublicStatusLabel(ch.status)}</span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              {isAdopted ? (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnadopt(ch.id || ch.reportId);
                                  }} 
                                  className="text-xs font-bold text-rose-600 border border-rose-200 bg-rose-50 px-3 py-1.5 rounded-lg cursor-pointer"
                                >
                                  Unadopt
                                </button>
                              ) : (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAdopt(ch.id || ch.reportId);
                                  }} 
                                  className="text-xs font-bold text-emerald-700 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 cursor-pointer"
                                >
                                  Adopt
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {actionView === 'audit' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-[#201C18]">Third-Party Outcome Audit</h2>
                    <p className="text-xs text-[#6A6155]">Validate the effectiveness of deployed pilot projects.</p>
                  </div>
                  <button onClick={() => { setActionView('menu'); setSelectedProjectId(null); }} className="text-xs font-bold text-slate-500 hover:text-slate-800">← Back</button>
                </div>
                
                {!selectedProjectId ? (
                  <div className="bg-white border border-[#E4DDD1] rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-xs">
                      <thead className="bg-[#FAF8F4] border-b border-[#E4DDD1]">
                        <tr>
                          <th className="px-5 py-3 text-left font-extrabold text-[#4A433B] uppercase">Project</th>
                          <th className="px-5 py-3 text-left font-extrabold text-[#4A433B] uppercase">University</th>
                          <th className="px-5 py-3 text-left font-extrabold text-[#4A433B] uppercase">Status</th>
                          <th className="px-5 py-3 text-right font-extrabold text-[#4A433B] uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EBE0]">
                        {projects.filter(p => p.status === 'Pilot Active').map(p => (
                          <tr key={p.id} className="hover:bg-[#FAF8F4] transition-colors">
                            <td className="px-5 py-3 font-semibold text-[#16293F]">{p.challengeTitle}</td>
                            <td className="px-5 py-3 text-slate-600">{p.universityName}</td>
                            <td className="px-5 py-3"><span className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-bold">{p.status}</span></td>
                            <td className="px-5 py-3 text-right">
                              <button onClick={() => setSelectedProjectId(p.id!)} className="text-xs font-bold text-white bg-[#16293F] hover:bg-[#2A435C] px-3 py-1.5 rounded-lg">Start Audit</button>
                            </td>
                          </tr>
                        ))}
                        {projects.filter(p => p.status === 'Pilot Active').length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-5 py-8 text-center text-slate-500 italic">No projects are currently in the Pilot Active phase awaiting an outcome audit.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white border border-[#E4DDD1] rounded-2xl p-6 max-w-2xl shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-[#16293F]">Submit Audit Report for Project {selectedProjectId}</h3>
                    <label className="block space-y-1">
                      <span className="text-xs font-bold text-slate-700">Audit Notes / Observations</span>
                      <textarea value={auditNotes} onChange={e => setAuditNotes(e.target.value)} rows={3} className="w-full p-2 text-xs border border-slate-300 rounded-lg" placeholder="Describe the physical state of the deployed solution..." />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-xs font-bold text-slate-700">Community Feedback</span>
                      <textarea value={communityFeedback} onChange={e => setCommunityFeedback(e.target.value)} rows={3} className="w-full p-2 text-xs border border-slate-300 rounded-lg" placeholder="What are the local citizens saying about this solution?" />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-xs font-bold text-slate-700">Impact Metrics Summary</span>
                      <textarea value={impactMetrics} onChange={e => setImpactMetrics(e.target.value)} rows={2} className="w-full p-2 text-xs border border-slate-300 rounded-lg" placeholder="E.g., 200 households served, 15% reduction in flood water..." />
                    </label>
                    <div className="flex justify-end gap-2 pt-3">
                      <button onClick={() => setSelectedProjectId(null)} className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                      <button onClick={handleSubmitAudit} className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Submit Audit Validation</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Cross-Portal Stakeholder Messages</h2>
              <p className="text-xs text-[#6A6155]">Coordinate with government officers, university mentors, student leads, and citizens across active challenges.</p>
            </div>
            <CrossPortalMessagingHub currentRole="community" currentUserName={orgName} />
          </div>
        )}
          </>
        )}
      </main>

      {/* Challenge Inspection Modal */}
      <ChallengeDetailModal
        isOpen={!!viewingChallenge}
        challenge={viewingChallenge}
        onClose={() => setViewingChallenge(null)}
        portalRole="community"
      />
    </div>
  );
};
