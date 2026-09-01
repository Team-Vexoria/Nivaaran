import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2, LogOut,
  AlertTriangle, Wrench, Droplets, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToChallenges, ChallengeDoc } from '../../services/firebaseService';
import { getStageForStatus, getPublicStatusLabel } from '../../services/workflowLifecycle';

type ULBTab = 'overview' | 'challenges' | 'municipal';

/**
 * ULB (Urban Local Body) Portal
 *
 * Municipal / urban governance officials:
 * - Ward-level challenge tracking for urban areas
 * - Municipal infrastructure challenge management
 * - Coordination with utility departments and HEI teams
 */
export const ULBPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ULBTab>('overview');
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);

  useEffect(() => {
    const unsub = subscribeToChallenges(setChallenges);
    return () => unsub();
  }, []);

  const officialName = currentUser?.displayName || 'Municipal Officer';
  const city = currentUser?.district || 'Ranchi';

  const stats = useMemo(() => {
    const total = challenges.length;
    const critical = challenges.filter(c => c.riskLevel === 'CRITICAL').length;
    const active = challenges.filter(c => {
      const s = getStageForStatus(c.status)?.stageNumber || 0;
      return s >= 3 && s <= 13;
    }).length;
    const resolved = challenges.filter(c =>
      c.status === 'Resolved' || c.status === 'Closed'
    ).length;
    return { total, critical, active, resolved };
  }, [challenges]);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#201C18] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#0F2942] text-white px-4 sm:px-6 py-3 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-[#3B82F6] rounded-xl flex items-center justify-center font-black text-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight">NIVAARAN</span>
                <span className="text-[10px] font-extrabold bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Municipal Portal
                </span>
              </div>
              <span className="text-[10px] text-white/60 font-semibold block">
                Urban Local Body · {city} Municipal Corporation
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
            { id: 'overview', label: 'Municipal Overview', icon: Building2 },
            { id: 'challenges', label: 'Urban Challenges', icon: AlertTriangle },
            { id: 'municipal', label: 'Dept Coordination', icon: Wrench },
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
                <span className="text-[11px] font-extrabold text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-0.5 rounded-full border border-[#3B82F6]/25 uppercase tracking-wider">
                  Municipal Governance
                </span>
              </div>
              <h2 className="text-xl font-black font-heading text-[#201C18]">
                {city} Municipal Corporation — Urban Challenge Tracker
              </h2>
              <p className="text-xs text-[#6A6155] mt-1">
                Ward-level infrastructure, utility, and public safety challenge management.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Urban Reports', value: stats.total, color: 'text-slate-700' },
                { label: 'Critical (City)', value: stats.critical, color: 'text-red-700' },
                { label: 'Active Pipeline', value: stats.active, color: 'text-amber-700' },
                { label: 'Resolved', value: stats.resolved, color: 'text-emerald-700' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white border border-[#E4DDD1] rounded-2xl p-4 shadow-2xs">
                  <span className="text-xs text-[#6A6155] font-medium">{kpi.label}</span>
                  <p className={`text-2xl font-extrabold font-heading ${kpi.color} mt-1`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Urban Focus Areas */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#201C18]">Municipal Priority Domains</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: Droplets, title: 'Water & Drainage', desc: 'Urban flooding, waterlogging, stormwater drainage, and sewage overflow challenges.', color: 'text-blue-600' },
                  { icon: Zap, title: 'Power & Utilities', desc: 'Street lighting, power distribution, and public utility infrastructure.', color: 'text-amber-600' },
                  { icon: Wrench, title: 'Roads & Bridges', desc: 'Urban road conditions, flyover maintenance, and bridge safety.', color: 'text-emerald-600' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4 space-y-2">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
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
              <h2 className="text-lg font-black text-[#201C18]">Urban Challenge Ledger</h2>
              <p className="text-xs text-[#6A6155]">{challenges.length} challenges across the municipality</p>
            </div>

            <div className="bg-white border border-[#E4DDD1] rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#FAF8F4] border-b border-[#E4DDD1]">
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Challenge</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Ward / Area</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Category</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Status</th>
                      <th className="px-4 py-2.5 text-left font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE0]">
                    {challenges.slice(0, 50).map(ch => (
                      <tr key={ch.id || ch.reportId} className="hover:bg-[#FAF8F4] transition-colors">
                        <td className="px-4 py-2.5 font-semibold text-[#201C18] max-w-[200px] truncate">{ch.title}</td>
                        <td className="px-4 py-2.5 text-[#4A433B]">{ch.block || ch.village || '—'}</td>
                        <td className="px-4 py-2.5 text-[#6A6155]">{ch.category}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAE4D8] text-[#4A433B]">
                            {getPublicStatusLabel(ch.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          {ch.riskLevel && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ch.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                              ch.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {ch.riskLevel}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {challenges.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-[#8A7F72] text-sm">No urban challenges yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'municipal' && (
          <>
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Municipal Department Coordination</h2>
              <p className="text-xs text-[#6A6155]">
                Coordinate with utility departments, public works, and HEI research teams.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Public Works Department', desc: 'Road repair, bridge maintenance, and construction-related challenges.', color: 'bg-emerald-100 text-emerald-800' },
                { title: 'Water & Sewerage Board', desc: 'Water supply, drainage, and sewage treatment infrastructure.', color: 'bg-blue-100 text-blue-800' },
                { title: 'Electricity Board', desc: 'Street lighting, transformer issues, and power distribution.', color: 'bg-amber-100 text-amber-800' },
                { title: 'Fire & Emergency Services', desc: 'Public safety hazards, building safety, and emergency response.', color: 'bg-red-100 text-red-800' },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-2 hover:border-[#3B82F6] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#201C18]">{item.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color}`}>Active</span>
                  </div>
                  <p className="text-xs text-[#6A6155] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl p-5 text-center space-y-2">
              <p className="text-xs text-[#8A7F72]">
                Full inter-department coordination, SLA tracking, and escalation workflows are available in the production build.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
