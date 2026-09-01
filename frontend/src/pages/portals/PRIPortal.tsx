import React, { useEffect, useMemo, useState } from 'react';
import {
  Landmark, LogOut, Users,
  AlertTriangle, FileText, Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToChallenges, ChallengeDoc } from '../../services/firebaseService';
import { getStageForStatus, getPublicStatusLabel } from '../../services/workflowLifecycle';

type PRITab = 'overview' | 'challenges' | 'coordination';

/**
 * PRI (Panchayat Raj Institution) Portal
 *
 * Panchayat-level officials see challenges in their jurisdiction:
 * - Overview of panchayat-level challenge activity
 * - Track challenges originating from their blocks/gram panchayats
 * - Coordinate with district administration and university teams
 */
export const PRIPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<PRITab>('overview');
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);

  useEffect(() => {
    const unsub = subscribeToChallenges(setChallenges);
    return () => unsub();
  }, []);

  const officialName = currentUser?.displayName || 'PRI Official';
  const district = currentUser?.district || 'Ranchi';

  const stats = useMemo(() => {
    const total = challenges.length;
    const validated = challenges.filter(c => c.status === 'Government Validated').length;
    const inProgress = challenges.filter(c => {
      const s = getStageForStatus(c.status)?.stageNumber || 0;
      return s >= 6 && s <= 13;
    }).length;
    const resolved = challenges.filter(c =>
      c.status === 'Resolved' || c.status === 'Closed'
    ).length;
    return { total, validated, inProgress, resolved };
  }, [challenges]);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#201C18] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#2D1B4E] text-white px-4 sm:px-6 py-3 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-[#7C3AED] rounded-xl flex items-center justify-center font-black text-sm">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight">NIVAARAN</span>
                <span className="text-[10px] font-extrabold bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  PRI Portal
                </span>
              </div>
              <span className="text-[10px] text-white/60 font-semibold block">
                Panchayat Raj Institution · {district} District
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-[11px] bg-white/10 px-3 py-1 rounded-full text-white/70 font-semibold">
              {officialName}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="font-bold">Logout</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-2.5 flex items-center gap-1 border-t border-white/10 pt-2">
          {([
            { id: 'overview', label: 'Panchayat Overview', icon: Landmark },
            { id: 'challenges', label: 'Local Challenges', icon: AlertTriangle },
            { id: 'coordination', label: 'Coordination', icon: Users },
          ] as const).map(tab => (
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">

        {activeTab === 'overview' && (
          <>
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[11px] font-extrabold text-[#7C3AED] bg-[#7C3AED]/10 px-2.5 py-0.5 rounded-full border border-[#7C3AED]/25 uppercase tracking-wider">
                  Panchayat Administration
                </span>
              </div>
              <h2 className="text-xl font-black font-heading text-[#201C18]">
                {district} District — Panchayat Challenge Tracker
              </h2>
              <p className="text-xs text-[#6A6155] mt-1">
                Monitor ground-level challenges from your panchayat jurisdiction and track government + university response.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Reports', value: stats.total, color: 'text-slate-700' },
                { label: 'Govt Validated', value: stats.validated, color: 'text-blue-700' },
                { label: 'In Progress', value: stats.inProgress, color: 'text-amber-700' },
                { label: 'Resolved', value: stats.resolved, color: 'text-emerald-700' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white border border-[#E4DDD1] rounded-2xl p-4 shadow-2xs">
                  <span className="text-xs text-[#6A6155] font-medium">{kpi.label}</span>
                  <p className={`text-2xl font-extrabold font-heading ${kpi.color} mt-1`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Panchayat Role Info */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#201C18]">Your Panchayat Responsibilities</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: FileText, title: 'Ground Verification', desc: 'Verify citizen-reported challenges in your panchayat area with on-site inspection.' },
                  { icon: Users, title: 'Community Coordination', desc: 'Coordinate with self-help groups, schools, and village volunteers for field testing.' },
                  { icon: Building, title: 'District Liaison', desc: 'Escalate validated challenges to district administration and track HEI assignments.' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4 space-y-2">
                    <item.icon className="w-5 h-5 text-[#7C3AED]" />
                    <p className="text-xs font-bold text-[#201C18]">{item.title}</p>
                    <p className="text-[11px] text-[#6A6155] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'challenges' && (
          <>
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Local Panchayat Challenges</h2>
              <p className="text-xs text-[#6A6155]">{challenges.length} challenges in your district</p>
            </div>

            <div className="bg-white border border-[#E4DDD1] rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#FAF8F4] border-b border-[#E4DDD1]">
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Challenge</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Block / GP</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Status</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Stage</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">HEI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE0]">
                    {challenges.slice(0, 50).map(ch => {
                      const stage = getStageForStatus(ch.status);
                      return (
                        <tr key={ch.id || ch.reportId} className="hover:bg-[#FAF8F4] transition-colors">
                          <td className="px-4 py-2.5 font-semibold text-[#201C18] max-w-[200px] truncate">{ch.title}</td>
                          <td className="px-4 py-2.5 text-[#4A433B]">{ch.block || '—'}</td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAE4D8] text-[#4A433B]">
                              {getPublicStatusLabel(ch.status)}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[#7C3AED] font-bold">{stage?.stageNumber ?? '—'}</td>
                          <td className="px-4 py-2.5 text-[#2C6E49] font-semibold">{ch.assignedHEI || '—'}</td>
                        </tr>
                      );
                    })}
                    {challenges.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-[#8A7F72] text-sm">No challenges yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'coordination' && (
          <>
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Inter-Agency Coordination</h2>
              <p className="text-xs text-[#6A6155]">
                Connect with district administration, university teams, and government officers.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'District Collector Office', desc: 'Escalate high-priority challenges and request emergency response coordination.', status: 'Active', color: 'bg-emerald-100 text-emerald-800' },
                { title: 'University Liaison', desc: 'Connect with assigned HEI teams for field visits and pilot coordination.', status: 'Available', color: 'bg-blue-100 text-blue-800' },
                { title: 'Block Development Officer', desc: 'Coordinate infrastructure challenges requiring block-level resources.', status: 'Active', color: 'bg-emerald-100 text-emerald-800' },
                { title: 'SHG Network', desc: 'Engage self-help groups for community mobilization and solution testing.', status: 'Available', color: 'bg-blue-100 text-blue-800' },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3 hover:border-[#7C3AED] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#201C18]">{item.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color}`}>{item.status}</span>
                  </div>
                  <p className="text-xs text-[#6A6155] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl p-5 text-center space-y-2">
              <p className="text-xs text-[#8A7F72]">
                Full coordination messaging and scheduling features are available in the production build.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
