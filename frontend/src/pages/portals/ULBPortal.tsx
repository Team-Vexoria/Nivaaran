import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2, LogOut,
  AlertTriangle, Wrench, Droplets, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { tr } from '../../i18n/translationEngine';
import { subscribeToChallenges, ChallengeDoc } from '../../services/firebaseService';
import { getStageForStatus, getPublicStatusLabel } from '../../services/workflowLifecycle';
import { PortalLoadingState, PortalEmptyState } from '../../components/PortalUIStates';
import { NotificationBellDropdown } from '../../components/notifications/NotificationBellDropdown';
import { CrossPortalMessagingHub } from '../../components/communication/CrossPortalMessagingHub';

type ULBTab = 'overview' | 'challenges' | 'municipal' | 'messages';

// ─── Dept Coordination Modal ────────────────────────────────────────────────
interface DeptActionModalProps {
  type: 'assign' | 'sla' | 'directive';
  department: string;
  onClose: () => void;
  challenges: ChallengeDoc[];
}

const DeptCoordinationModal: React.FC<DeptActionModalProps> = ({ type, department, onClose, challenges }) => {
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [priority, setPriority] = useState('Medium');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  const titles = {
    assign: `Assign to ${department}`,
    sla: `${department} SLA Review`,
    directive: `Send Directive to ${department}`,
  };

  const descriptions = {
    assign: 'Route a verified challenge to this department for immediate action.',
    sla: 'Review pending tickets and escalate overdue SLAs.',
    directive: 'Issue a municipal directive or standard operating procedure update.',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#E4DDD1]">
          <h3 className="text-lg font-black text-[#201C18]">{titles[type]}</h3>
          <p className="text-xs text-[#6A6155] mt-1">{descriptions[type]}</p>
        </div>
        
        {type === 'sla' ? (
          <div className="p-5 space-y-4">
            <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4 text-center">
              <span className="text-3xl font-black text-[#3B82F6]">92%</span>
              <p className="text-xs font-bold text-[#6A6155] mt-1">SLA Compliance Rate</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#4A433B]">Resolved within 48h</span>
                <span className="font-bold text-emerald-600">45</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#4A433B]">Pending / In Progress</span>
                <span className="font-bold text-amber-600">12</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#4A433B]">SLA Breached (&gt;72h)</span>
                <span className="font-bold text-red-600">3</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {type === 'assign' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A433B]">Select Challenge</label>
                <select
                  required
                  value={selectedChallenge}
                  onChange={e => setSelectedChallenge(e.target.value)}
                  className="w-full text-sm border border-[#E4DDD1] rounded-lg px-3 py-2 bg-[#FAF8F4] focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="">-- Select a challenge --</option>
                  {challenges.map(c => (
                    <option key={c.id || c.reportId} value={c.id || c.reportId}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {type === 'assign' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A433B]">Priority Level</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full text-sm border border-[#E4DDD1] rounded-lg px-3 py-2 bg-[#FAF8F4] focus:outline-none focus:border-[#3B82F6]"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical (24h SLA)</option>
                </select>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4A433B]">
                {type === 'assign' ? 'Instructions / Context' : 'Directive Message'}
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter details..."
                className="w-full text-sm border border-[#E4DDD1] rounded-lg px-3 py-2 bg-[#FAF8F4] focus:outline-none focus:border-[#3B82F6] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-[#6A6155] hover:bg-[#FAF8F4] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors disabled:opacity-70 min-w-[100px] cursor-pointer"
              >
                {isSubmitting ? 'Sending...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

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
  const { currentLang, languages, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<ULBTab>('overview');
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{ type: 'assign' | 'sla' | 'directive', department: string } | null>(null);

  useEffect(() => {
    const unsub = subscribeToChallenges((data) => {
      setChallenges(data);
      setLoading(false);
    });
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
                <span className="text-base font-black tracking-tight">{tr('NIVAARAN', currentLang)}</span>
                <span className="text-[10px] font-extrabold bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {tr('Municipal Portal', currentLang)}
                </span>
              </div>
              <span className="text-[10px] text-white/60 font-semibold block">
                {tr('Urban Local Body', currentLang)} · {city} {tr('Municipal Corporation', currentLang)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={currentLang}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-white/10 text-white text-[11px] px-2 py-1 rounded-lg border-none focus:ring-0 cursor-pointer"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <span className="hidden sm:inline text-[11px] bg-white/10 px-3 py-1 rounded-full text-white/70 font-semibold">
              {officialName}
            </span>
            <NotificationBellDropdown userRole="ulb" userDistrict={city} />
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
            { id: 'overview', label: tr('Municipal Overview', currentLang), icon: Building2 },
            { id: 'challenges', label: tr('Urban Challenges', currentLang), icon: AlertTriangle },
            { id: 'municipal', label: tr('Dept Coordination', currentLang), icon: Wrench },
            { id: 'messages', label: tr('Messages', currentLang), icon: Building2 },
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

        {loading ? (
          <PortalLoadingState />
        ) : (
          <>
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
                        <td colSpan={5} className="p-0">
                          <PortalEmptyState
                            title="No urban challenges yet"
                            description="Municipal challenges will appear here once reported by citizens or escalated from district officers."
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

        {activeTab === 'municipal' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Municipal Department Coordination</h2>
              <p className="text-xs text-[#6A6155]">
                Coordinate with utility departments, public works, and HEI research teams.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { 
                  title: 'Public Works Department', 
                  desc: 'Road repair, bridge maintenance, and construction-related challenges.', 
                  color: 'bg-emerald-100 text-emerald-800' 
                },
                { 
                  title: 'Water & Sewerage Board', 
                  desc: 'Water supply, drainage, and sewage treatment infrastructure.', 
                  color: 'bg-blue-100 text-blue-800' 
                },
                { 
                  title: 'Electricity Board', 
                  desc: 'Street lighting, transformer issues, and power distribution.', 
                  color: 'bg-amber-100 text-amber-800' 
                },
                { 
                  title: 'Fire & Emergency Services', 
                  desc: 'Public safety hazards, building safety, and emergency response.', 
                  color: 'bg-red-100 text-red-800' 
                },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4 hover:border-[#3B82F6] transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-[#201C18]">{item.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color}`}>Active</span>
                    </div>
                    <p className="text-xs text-[#6A6155] leading-relaxed">{item.desc}</p>
                  </div>
                  
                  <div className="flex gap-2 pt-3 border-t border-[#E4DDD1]">
                    <button 
                      onClick={() => setActionModal({ type: 'assign', department: item.title })}
                      className="text-[10px] font-bold bg-[#FAF8F4] hover:bg-[#E4DDD1] text-[#201C18] px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                    >
                      Assign Task
                    </button>
                    <button 
                      onClick={() => setActionModal({ type: 'sla', department: item.title })}
                      className="text-[10px] font-bold bg-[#FAF8F4] hover:bg-[#E4DDD1] text-[#201C18] px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                    >
                      View SLA
                    </button>
                    <button 
                      onClick={() => setActionModal({ type: 'directive', department: item.title })}
                      className="text-[10px] font-bold bg-[#FAF8F4] hover:bg-[#E4DDD1] text-[#201C18] px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                    >
                      Send Directive
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SLA Tracker Progress Bars */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-5">
              <h3 className="text-sm font-extrabold text-[#201C18]">City-Wide SLA Status</h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Public Works Dept', percent: 85, color: 'bg-emerald-500' },
                  { label: 'Water Board', percent: 62, color: 'bg-amber-500' },
                  { label: 'Electricity Board', percent: 94, color: 'bg-blue-500' },
                ].map(dept => (
                  <div key={dept.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[#4A433B]">{dept.label}</span>
                      <span className="font-bold text-[#6A6155]">{dept.percent}% SLA Compliance</span>
                    </div>
                    <div className="h-2 w-full bg-[#FAF8F4] rounded-full overflow-hidden border border-[#E4DDD1]">
                      <div className={`h-full ${dept.color}`} style={{ width: `${dept.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Cross-Portal Stakeholder Messages</h2>
              <p className="text-xs text-[#6A6155]">Coordinate with government officers, university mentors, student leads, and citizens across active challenges.</p>
            </div>
            <CrossPortalMessagingHub currentRole="ulb" currentUserName={officialName} />
          </div>
        )}
          </>
        )}
      </main>

      {/* Action Modal */}
      {actionModal && (
        <DeptCoordinationModal 
          type={actionModal.type} 
          department={actionModal.department}
          challenges={challenges}
          onClose={() => setActionModal(null)} 
        />
      )}
    </div>
  );
};
