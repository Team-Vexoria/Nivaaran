import React, { useEffect, useMemo, useState } from 'react';
import {
  Landmark, LogOut, Users,
  AlertTriangle, FileText, Building, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { tr } from '../../i18n/translationEngine';
import { subscribeToChallenges, ChallengeDoc } from '../../services/firebaseService';
import { getStageForStatus, getPublicStatusLabel } from '../../services/workflowLifecycle';
import { PortalLoadingState, PortalEmptyState } from '../../components/PortalUIStates';
import { NotificationBellDropdown } from '../../components/notifications/NotificationBellDropdown';
import { CrossPortalMessagingHub } from '../../components/communication/CrossPortalMessagingHub';
import { ChallengeDetailModal } from '../../components/ChallengeDetailModal';

type PRITab = 'overview' | 'challenges' | 'coordination' | 'messages';

// ─── Coordination Action Modal ────────────────────────────────────────────────
interface ActionModalProps {
  type: 'escalate' | 'field_visit' | 'update';
  onClose: () => void;
  challenges: ChallengeDoc[];
}

const CoordinationActionModal: React.FC<ActionModalProps> = ({ type, onClose, challenges }) => {
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  const titles = {
    escalate: 'Escalate to District Collector',
    field_visit: 'Request HEI Field Visit',
    update: 'Send Status Update',
  };

  const descriptions = {
    escalate: 'Escalate a critical challenge to the district administration for immediate attention.',
    field_visit: 'Request the assigned University/HEI team to conduct a ground inspection.',
    update: 'Broadcast a status update to all stakeholders involved in a challenge.',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#E4DDD1]">
          <h3 className="text-lg font-black text-[#201C18]">{titles[type]}</h3>
          <p className="text-xs text-[#6A6155] mt-1">{descriptions[type]}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#4A433B]">Select Challenge</label>
            <select
              required
              value={selectedChallenge}
              onChange={e => setSelectedChallenge(e.target.value)}
              className="w-full text-sm border border-[#E4DDD1] rounded-lg px-3 py-2 bg-[#FAF8F4] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            >
              <option value="">-- Select a challenge --</option>
              {challenges.map(c => (
                <option key={c.id || c.reportId} value={c.id || c.reportId}>
                  {c.title} ({getPublicStatusLabel(c.status)})
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#4A433B]">
              {type === 'escalate' ? 'Urgency Note' : type === 'field_visit' ? 'Preferred Dates / Context' : 'Update Message'}
            </label>
            <textarea
              required
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Enter details here..."
              className="w-full text-sm border border-[#E4DDD1] rounded-lg px-3 py-2 bg-[#FAF8F4] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] resize-none"
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
              className="px-4 py-2 text-sm font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center min-w-[100px] cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

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
  const { currentLang, languages, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<PRITab>('overview');
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{ type: 'escalate' | 'field_visit' | 'update' } | null>(null);
  const [viewingChallenge, setViewingChallenge] = useState<ChallengeDoc | null>(null);

  // Mock activity log
  const [activities] = useState([
    { id: 1, action: 'Escalated to DC', challenge: 'Water pipeline burst in Ward 4', date: '2 hours ago' },
    { id: 2, action: 'Field Visit Requested', challenge: 'Soil erosion near primary school', date: 'Yesterday' },
    { id: 3, action: 'SHG Mobilized', challenge: 'Waste management awareness drive', date: '3 days ago' },
  ]);

  useEffect(() => {
    const unsub = subscribeToChallenges((data) => {
      setChallenges(data);
      setLoading(false);
    });
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
                <span className="text-base font-black tracking-tight">{tr('NIVAARAN', currentLang)}</span>
                <span className="text-[10px] font-extrabold bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {tr('PRI Portal', currentLang)}
                </span>
              </div>
              <span className="text-[10px] text-white/60 font-semibold block">
                {tr('Panchayat Raj Institution', currentLang)} · {district} {tr('District', currentLang)}
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
            <NotificationBellDropdown userRole="pri" userDistrict={district} />
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="font-bold">Logout</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-2.5 flex items-center gap-1 border-t border-white/10 pt-2 overflow-x-auto no-scrollbar scrollbar-none scroll-smooth whitespace-nowrap">
          {([
            { id: 'overview', label: tr('Panchayat Overview', currentLang), icon: Landmark },
            { id: 'challenges', label: tr('Local Challenges', currentLang), icon: AlertTriangle },
            { id: 'coordination', label: tr('Coordination', currentLang), icon: Users },
            { id: 'messages', label: tr('Messages', currentLang), icon: Users },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 cursor-pointer ${
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
                      <th className="px-4 py-2.5 text-right font-extrabold text-[#4A433B] uppercase tracking-wider text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE0]">
                    {challenges.slice(0, 50).map(ch => {
                      const stage = getStageForStatus(ch.status);
                      return (
                        <tr 
                          key={ch.id || ch.reportId} 
                          onClick={() => setViewingChallenge(ch)}
                          className="hover:bg-[#F3EDE2] transition-colors cursor-pointer group"
                        >
                          <td className="px-4 py-2.5 font-semibold text-[#201C18] max-w-[200px] truncate group-hover:text-[#7C3AED]">
                            {ch.title}
                          </td>
                          <td className="px-4 py-2.5 text-[#4A433B]">{ch.block || 'Ranchi'}</td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAE4D8] text-[#4A433B]">
                              {getPublicStatusLabel(ch.status)}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[#7C3AED] font-bold">Stage {stage?.stageNumber ?? 3}</td>
                          <td className="px-4 py-2.5 text-[#2C6E49] font-semibold">{ch.assignedHEI || 'Pending Intake'}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingChallenge(ch);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7C3AED] hover:text-[#6D28D9] bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {challenges.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <PortalEmptyState
                            title="No challenges yet"
                            description="Citizen-reported challenges for this panchayat will appear here once filed."
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

        {activeTab === 'coordination' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Inter-Agency Coordination</h2>
              <p className="text-xs text-[#6A6155]">
                Connect with district administration, university teams, and government officers.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { 
                  title: 'District Collector Office', 
                  desc: 'Escalate high-priority challenges and request emergency response coordination.', 
                  status: 'Active', 
                  color: 'bg-emerald-100 text-emerald-800',
                  action: 'Escalate Challenge',
                  actionType: 'escalate' as const
                },
                { 
                  title: 'University Liaison', 
                  desc: 'Connect with assigned HEI teams for field visits and pilot coordination.', 
                  status: 'Available', 
                  color: 'bg-blue-100 text-blue-800',
                  action: 'Request Field Visit',
                  actionType: 'field_visit' as const
                },
                { 
                  title: 'Block Development Officer', 
                  desc: 'Coordinate infrastructure challenges requiring block-level resources.', 
                  status: 'Active', 
                  color: 'bg-emerald-100 text-emerald-800',
                  action: 'Send Update',
                  actionType: 'update' as const
                },
                { 
                  title: 'SHG Network', 
                  desc: 'Engage self-help groups for community mobilization and solution testing.', 
                  status: 'Available', 
                  color: 'bg-blue-100 text-blue-800',
                  action: 'Mobilize SHG',
                  actionType: 'update' as const
                },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4 hover:border-[#7C3AED] transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-[#201C18]">{item.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color}`}>{item.status}</span>
                    </div>
                    <p className="text-xs text-[#6A6155] leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-[#E4DDD1]">
                    <button 
                      onClick={() => setActionModal({ type: item.actionType })}
                      className="text-xs font-bold text-[#7C3AED] hover:text-[#5B21B6] transition-colors cursor-pointer"
                    >
                      {item.action} &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Log */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#201C18]">Recent Coordination Activity</h3>
              <div className="space-y-3">
                {activities.map(activity => (
                  <div key={activity.id} className="flex items-start justify-between gap-4 p-3 bg-[#FAF8F4] rounded-xl border border-[#E4DDD1]">
                    <div>
                      <span className="text-xs font-bold text-[#201C18] block">{activity.action}</span>
                      <span className="text-[11px] text-[#6A6155] block mt-0.5">Re: {activity.challenge}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#8A7F72] whitespace-nowrap">{activity.date}</span>
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
            <CrossPortalMessagingHub currentRole="pri" currentUserName={officialName} />
          </div>
        )}
          </>
        )}
      </main>

      {/* Action Modal */}
      {actionModal && (
        <CoordinationActionModal 
          type={actionModal.type} 
          challenges={challenges}
          onClose={() => setActionModal(null)} 
        />
      )}

      {/* Challenge Inspection Modal */}
      <ChallengeDetailModal
        isOpen={!!viewingChallenge}
        challenge={viewingChallenge}
        onClose={() => setViewingChallenge(null)}
        portalRole="pri"
      />
    </div>
  );
};
