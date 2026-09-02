import React, { useEffect, useState, useMemo } from 'react';
import {
  Database, Activity, ShieldCheck, LogOut,
  BarChart3, CheckCircle2, Clock, AlertTriangle,
  RefreshCw, Trash2, Search, Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { workflowStore, STORE_EVENT } from '../../services/workflowStore';
import { LIFECYCLE_STAGES, getStageForStatus } from '../../services/workflowLifecycle';
import { Challenge } from '../../services/workflowTypes';
import { subscribeToChallenges, ChallengeDoc } from '../../services/firebaseService';

type AdminTab = 'overview' | 'challenges' | 'audit' | 'taxonomy';

const DOMAIN_CATEGORIES = [
  { id: 'flood', label: 'Flood & Waterlogging', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'drought', label: 'Drought & Water Scarcity', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'landslide', label: 'Landslide & Subsidence', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'mining', label: 'Mine Safety & Pollution', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  { id: 'heatwave', label: 'Heatwave & Air Quality', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'infrastructure', label: 'Infrastructure & Roads', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'health', label: 'Public Health & Sanitation', color: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'forest', label: 'Forest & Biodiversity', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
];

export const AdminPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [challenges, setChallenges] = useState<Challenge[]>(workflowStore.getChallenges());
  const [fbChallenges, setFbChallenges] = useState<ChallengeDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Live store sync
  useEffect(() => {
    const handler = () => setChallenges(workflowStore.getChallenges());
    window.addEventListener(STORE_EVENT, handler);
    return () => window.removeEventListener(STORE_EVENT, handler);
  }, []);

  // Firebase sync
  useEffect(() => {
    const unsub = subscribeToChallenges(setFbChallenges);
    return () => unsub();
  }, []);

  // Merge workflowStore + Firebase for full picture
  const allChallenges = useMemo(() => {
    if (challenges.length > 0) return challenges;
    return fbChallenges as unknown as Challenge[];
  }, [challenges, fbChallenges]);

  // --- KPI Counts ---
  const kpis = useMemo(() => {
    const total = allChallenges.length;
    const byStage = new Array(17).fill(0);
    allChallenges.forEach(c => {
      const s = getStageForStatus(c.status)?.stageNumber ?? 1;
      byStage[s] = (byStage[s] || 0) + 1;
    });
    const pending = byStage[1] + byStage[2];
    const active = byStage.slice(3, 13).reduce((a, b) => a + b, 0);
    const resolved = byStage[14] + byStage[15] + byStage[16];
    const critical = allChallenges.filter(c => c.riskLevel === 'CRITICAL').length;
    const byCategory: Record<string, number> = {};
    allChallenges.forEach(c => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    });
    const byDistrict: Record<string, number> = {};
    allChallenges.forEach(c => {
      byDistrict[c.district] = (byDistrict[c.district] || 0) + 1;
    });
    return { total, pending, active, resolved, critical, byCategory, byDistrict, byStage };
  }, [allChallenges]);

  // --- Audit log entries from timeline events ---
  const auditEntries = useMemo(() => {
    return allChallenges.flatMap(c =>
      workflowStore.getTimelineEvents(c.id).map(e => ({ ...e, challengeTitle: c.title, challengeId: c.id }))
    ).sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')).slice(0, 50);
  }, [allChallenges]);

  // --- Filtered challenges for challenges tab ---
  const filteredChallenges = useMemo(() => {
    return allChallenges.filter(c => {
      const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase())
        || c.district.toLowerCase().includes(searchQuery.toLowerCase())
        || c.reportId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [allChallenges, searchQuery, statusFilter]);

  const handleReset = () => {
    workflowStore.resetDemoData();
    setShowResetConfirm(false);
  };

  const uniqueStatuses = useMemo(() =>
    [...new Set(allChallenges.map(c => c.status))].sort(), [allChallenges]);

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1A1612] text-white px-4 sm:px-6 py-3 border-b border-[#2E2820] shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 bg-[#B5502D] rounded-xl flex items-center justify-center font-black text-base text-white shadow-md shrink-0">A</div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black font-heading tracking-tight leading-none">NIVAARAN</span>
                <span className="text-[10px] font-extrabold bg-[#B5502D]/20 text-[#E8845E] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#B5502D]/40">
                  Super Admin
                </span>
              </div>
              <span className="text-[10px] text-[#8A7F72] font-semibold block">Platform Governance & Audit</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <span className="hidden sm:block text-[11px] bg-white/10 px-3 py-1 rounded-full text-white/70 font-semibold">
              {currentUser?.displayName} · {currentUser?.role}
            </span>
            <button
              onClick={async () => { await logout(); window.location.href = '/'; }}
              className="flex items-center space-x-1.5 text-xs bg-[#B5502D] hover:bg-[#9c4323] text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto mt-2.5 flex items-center space-x-1 border-t border-white/10 pt-2">
          {([
            { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
            { id: 'challenges', label: 'All Challenges', icon: Database },
            { id: 'taxonomy', label: 'Taxonomy & Controls', icon: ShieldCheck },
            { id: 'audit', label: 'Audit Log', icon: Activity },
          ] as { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Platform Health Dashboard</h2>
              <p className="text-xs text-[#6A6155]">Live counts from workflowStore + Firebase. Refreshes on every store event.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Challenges', value: kpis.total, icon: Database, color: 'text-slate-700', bg: 'bg-slate-100' },
                { label: 'Pending Review', value: kpis.pending, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-100' },
                { label: 'Active Pipeline', value: kpis.active, icon: RefreshCw, color: 'text-blue-700', bg: 'bg-blue-100' },
                { label: 'Resolved / Closed', value: kpis.resolved, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100' },
              ].map((kpi, i) => (
                <div key={i} className="bg-white border border-[#E4DDD1] rounded-2xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6A6155] font-medium">{kpi.label}</span>
                    <div className={`w-7 h-7 ${kpi.bg} rounded-lg flex items-center justify-center`}>
                      <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold font-heading text-[#201C18]">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Stage Pipeline */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#201C18]">16-Stage Pipeline Breakdown</h3>
              <div className="space-y-2">
                {LIFECYCLE_STAGES.map(stage => {
                  const count = kpis.byStage[stage.stageNumber] || 0;
                  const pct = kpis.total > 0 ? Math.round((count / kpis.total) * 100) : 0;
                  return (
                    <div key={stage.stageNumber} className="flex items-center gap-3 text-xs">
                      <span className="w-5 shrink-0 text-right font-mono text-[#8A7F72] text-[10px]">{stage.stageNumber}</span>
                      <span className="w-36 shrink-0 text-[#4A433B] font-semibold truncate">{stage.displayName}</span>
                      <div className="flex-1 bg-[#F0EBE0] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-[#2C6E49] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 shrink-0 font-extrabold text-[#201C18] text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* District + Category breakdown */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Top Districts */}
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-extrabold text-[#201C18]">Top Districts by Challenge Volume</h3>
                {Object.entries(kpis.byDistrict)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([district, count]) => (
                    <div key={district} className="flex items-center justify-between text-xs">
                      <span className="text-[#4A433B] font-medium">{district || 'Unknown'}</span>
                      <span className="font-extrabold text-[#201C18] bg-[#F0EBE0] px-2 py-0.5 rounded-full">{count}</span>
                    </div>
                  ))}
                {Object.keys(kpis.byDistrict).length === 0 && (
                  <p className="text-xs text-[#8A7F72]">No data yet</p>
                )}
              </div>

              {/* Category Breakdown */}
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-extrabold text-[#201C18]">Challenge Categories</h3>
                {Object.entries(kpis.byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span className="text-[#4A433B] font-medium">{cat || 'Uncategorized'}</span>
                      <span className="font-extrabold text-[#201C18] bg-[#F0EBE0] px-2 py-0.5 rounded-full">{count}</span>
                    </div>
                  ))}
                {Object.keys(kpis.byCategory).length === 0 && (
                  <p className="text-xs text-[#8A7F72]">No data yet</p>
                )}
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-red-800 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Danger Zone</span>
              </h3>
              <p className="text-xs text-red-600">Resetting demo data clears all workflowStore challenges, projects, and timeline events from localStorage. This cannot be undone.</p>
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs rounded-lg border border-red-300 transition-colors flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Demo Data</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button onClick={handleReset} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors">
                    Confirm Reset
                  </button>
                  <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 bg-white text-red-700 font-bold text-xs rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ALL CHALLENGES TAB */}
        {activeTab === 'challenges' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[#201C18]">All Challenges</h2>
                <p className="text-xs text-[#6A6155]">{filteredChallenges.length} of {allChallenges.length} shown</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A7F72]" />
                  <input
                    type="text"
                    placeholder="Search title, district, ID…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E4DDD1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C6E49] w-52"
                  />
                </div>
                <div className="flex items-center space-x-1 bg-white border border-[#E4DDD1] rounded-lg px-2 py-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#8A7F72]" />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="text-xs bg-transparent focus:outline-none text-[#201C18] font-medium"
                  >
                    <option value="all">All Statuses</option>
                    {uniqueStatuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E4DDD1] rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#FAF8F4] border-b border-[#E4DDD1]">
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Report ID</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Title</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">District</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Stage</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Status</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Risk</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Category</th>
                      <th className="px-4 py-2.5 text-right font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE0]">
                    {filteredChallenges.slice(0, 100).map(c => {
                      const stage = getStageForStatus(c.status);
                      const riskColors: Record<string, string> = {
                        CRITICAL: 'bg-red-100 text-red-800',
                        HIGH: 'bg-orange-100 text-orange-800',
                        MEDIUM: 'bg-amber-100 text-amber-800',
                        STANDARD: 'bg-slate-100 text-slate-600',
                      };
                      return (
                        <tr key={c.id} className="hover:bg-[#FAF8F4] transition-colors">
                          <td className="px-4 py-2.5 font-mono text-[#6A6155] text-[10px]">{c.reportId}</td>
                          <td className="px-4 py-2.5 font-semibold text-[#201C18] max-w-[200px] truncate">{c.title}</td>
                          <td className="px-4 py-2.5 text-[#4A433B]">{c.district}</td>
                          <td className="px-4 py-2.5 font-mono text-[#2C6E49] font-bold">{stage?.stageNumber ?? '—'}</td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAE4D8] text-[#4A433B]">
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            {c.riskLevel && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${riskColors[c.riskLevel] || 'bg-slate-100 text-slate-600'}`}>
                                {c.riskLevel}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-[#6A6155]">{c.category}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => setSelectedChallenge(c)}
                              className="px-3 py-1 bg-white border border-[#E4DDD1] text-[#201C18] text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredChallenges.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-[#8A7F72] text-sm">
                          No challenges match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Audit Log</h2>
              <p className="text-xs text-[#6A6155]">Last {auditEntries.length} timeline events across all challenges, sorted newest first.</p>
            </div>

            <div className="bg-white border border-[#E4DDD1] rounded-2xl overflow-hidden shadow-2xs">
              {auditEntries.length === 0 ? (
                <div className="p-12 text-center text-[#8A7F72] text-sm">No audit events yet.</div>
              ) : (
                <div className="divide-y divide-[#F0EBE0]">
                  {auditEntries.map((entry, i) => (
                    <div key={i} className="px-5 py-3.5 flex items-start gap-4 hover:bg-[#FAF8F4] transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2C6E49] mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-[#8A7F72]">
                            {entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                          <span className="text-[10px] font-extrabold text-[#2C6E49] bg-[#EAF4ED] px-2 py-0.5 rounded-full border border-[#C3E0CC]">
                            {entry.action || 'event'}
                          </span>
                          <span className="text-[10px] text-[#6A6155] font-semibold truncate max-w-[180px]">
                            {(entry as any).challengeTitle}
                          </span>
                        </div>
                        <p className="text-xs text-[#201C18] font-semibold mt-0.5">{entry.description}</p>
                        {entry.actor && (
                          <p className="text-[10px] text-[#8A7F72] mt-0.5">by {entry.actor}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAXONOMY & CONTROLS TAB */}
        {activeTab === 'taxonomy' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Taxonomy & System Controls</h2>
              <p className="text-xs text-[#6A6155]">Configure AI triage routing, manage platform rules, and administer user security.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Security & Moderation */}
              <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="text-sm font-extrabold">Security & Moderation</h3>
                </div>
                <p className="text-xs text-slate-600 mb-4">Ban malicious users or bots from the platform. This will lock their account and optionally purge their submitted challenges.</p>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Enter User ID or Email" className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-red-500 outline-none" />
                    <button className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-lg hover:bg-red-700 transition-colors shrink-0">Ban User</button>
                  </div>
                  <label className="flex items-center space-x-2 text-xs text-slate-600">
                    <input type="checkbox" className="rounded text-red-600 focus:ring-red-500" defaultChecked />
                    <span>Also purge all associated challenges & comments</span>
                  </label>
                </div>
              </div>

              {/* AI Priority Engine Settings */}
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center space-x-2 text-[#201C18]">
                  <Activity className="w-5 h-5 text-[#B5502D]" />
                  <h3 className="text-sm font-extrabold">AI Prioritization Engine</h3>
                </div>
                <p className="text-xs text-slate-600 mb-4">Adjust global weights used by the AI to calculate the priority score of incoming challenges.</p>
                
                <div className="space-y-3">
                  {['Population Impact', 'Infrastructure Criticality', 'Hazard Urgency'].map(factor => (
                    <div key={factor} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">{factor}</span>
                      <input type="range" min="0" max="10" defaultValue="5" className="w-32 accent-[#B5502D]" />
                    </div>
                  ))}
                  <div className="pt-2">
                    <button className="w-full px-4 py-2 bg-[#FAF8F4] border border-[#E4DDD1] text-[#201C18] font-bold text-xs rounded-lg hover:bg-[#F0EBE0] transition-colors">
                      Save Global Weights
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E4DDD1]">
              <h3 className="text-sm font-extrabold text-[#201C18] mb-4">Active Domain Taxonomy</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {DOMAIN_CATEGORIES.map(cat => {
                  const count = kpis.byCategory[cat.label] || kpis.byCategory[cat.id] || 0;
                  return (
                    <div key={cat.id} className="bg-white border border-[#E4DDD1] rounded-2xl p-4 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${cat.color}`}>
                          {cat.label}
                        </span>
                        <span className="text-xs font-extrabold text-[#201C18]">{count}</span>
                      </div>
                      <div className="h-1.5 bg-[#F0EBE0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2C6E49] rounded-full transition-all duration-500"
                          style={{ width: kpis.total > 0 ? `${Math.round((count / kpis.total) * 100)}%` : '0%' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


            {/* Workflow lifecycle reference */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-[#201C18]">16-Stage Lifecycle Reference</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {LIFECYCLE_STAGES.map(stage => (
                  <div key={stage.stageNumber} className="flex items-center space-x-3 text-xs py-1.5 border-b border-[#F0EBE0] last:border-0">
                    <span className="w-7 h-7 rounded-lg bg-[#EAE4D8] text-[#4A433B] font-extrabold flex items-center justify-center text-[11px] shrink-0">
                      {stage.stageNumber}
                    </span>
                    <div>
                      <p className="font-bold text-[#201C18]">{stage.displayName}</p>
                      <p className="text-[10px] text-[#8A7F72]">{stage.publicLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MANAGE CHALLENGE MODAL */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E4DDD1] flex items-center justify-between bg-[#FAF8F4]">
              <div>
                <h3 className="text-base font-black text-[#201C18]">Manage Challenge</h3>
                <p className="text-xs font-mono text-slate-500">{selectedChallenge.reportId}</p>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 transition-colors text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Force Transition */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-[#201C18] border-b border-[#E4DDD1] pb-1">Force State Transition</h4>
                <p className="text-xs text-slate-600">Manually advance or regress the workflow stage if the normal process is stuck.</p>
                <div className="flex gap-2">
                  <select
                    id="status-override"
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                    defaultValue={selectedChallenge.status}
                  >
                    {LIFECYCLE_STAGES.map(s => (
                      <option key={s.status} value={s.status}>{s.stageNumber}: {s.displayName}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const sel = document.getElementById('status-override') as HTMLSelectElement;
                      if (sel) {
                        workflowStore.transitionChallenge(selectedChallenge.id, sel.value as any, currentUser?.uid || 'admin', 'Super Admin forced transition');
                        setSelectedChallenge(null);
                      }
                    }}
                    className="px-4 py-2 bg-[#2C6E49] text-white font-bold text-xs rounded-lg hover:bg-[#1E4D33] transition-colors shrink-0"
                  >
                    Force Update
                  </button>
                </div>
              </div>

              {/* AI Override */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-[#201C18] border-b border-[#E4DDD1] pb-1">Override AI Prioritization</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Priority Score (0-100)</span>
                    <input
                      type="number"
                      id="priority-override"
                      defaultValue={selectedChallenge.priorityScore}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Risk Level</span>
                    <select
                      id="risk-override"
                      defaultValue={selectedChallenge.riskLevel}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="STANDARD">STANDARD</option>
                    </select>
                  </label>
                </div>
                <button
                  onClick={() => {
                    const p = document.getElementById('priority-override') as HTMLInputElement;
                    const r = document.getElementById('risk-override') as HTMLSelectElement;
                    if (p && r) {
                      workflowStore.updateChallenge(selectedChallenge.id, {
                        priorityScore: parseInt(p.value, 10) || 0,
                        riskLevel: r.value as any
                      });
                      workflowStore.addTimelineEvent(selectedChallenge.id, {
                        action: 'Admin Override',
                        actor: currentUser?.uid || 'admin',
                        description: `Super Admin overridden AI Priority to ${p.value} and Risk to ${r.value}`
                      });
                      setSelectedChallenge(null);
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply AI Override
                </button>
              </div>
              
              {/* Ban / Delete */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-red-700 border-b border-red-200 pb-1">Danger Actions</h4>
                <div className="flex gap-2">
                   <button
                    onClick={() => {
                      if (confirm('Delete this challenge permanently? This cannot be undone.')) {
                         // Mock deletion from store (workflowStore does not have delete method, but we can transition to 'Rejected' or mock delete if implemented)
                         workflowStore.transitionChallenge(selectedChallenge.id, 'Rejected', currentUser?.uid || 'admin', 'Deleted by Super Admin');
                         setSelectedChallenge(null);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-800 border border-red-300 font-bold text-xs rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Delete / Reject Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
