import React, { useEffect, useMemo, useState } from 'react';
import {
  FlaskConical, LogOut, ExternalLink, Beaker, Cpu, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { tr } from '../../i18n/translationEngine';
import { subscribeToChallenges, subscribeToProjects, ChallengeDoc, ProjectDoc } from '../../services/firebaseService';
import { getStageForStatus } from '../../services/workflowLifecycle';
import { PortalLoadingState, PortalEmptyState } from '../../components/PortalUIStates';

type LabTab = 'overview' | 'projects' | 'research';

// ─── Lab Action Modal ─────────────────────────────────────────────────────────
interface LabActionModalProps {
  type: 'update' | 'request' | 'resource';
  resourceTitle?: string;
  onClose: () => void;
  projects: ProjectDoc[];
}

const LabActionModal: React.FC<LabActionModalProps> = ({ type, resourceTitle, onClose, projects }) => {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [details, setDetails] = useState('');
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
    update: 'Submit Research Update',
    request: 'Request Equipment / Dataset',
    resource: `Access ${resourceTitle}`,
  };

  const descriptions = {
    update: 'Log a prototype milestone or submit field telemetry data for an active project.',
    request: 'Request specialized sensors, compute resources, or historical datasets.',
    resource: 'View technical documentation, JSON schemas, and calibration guides.',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#E4DDD1]">
          <h3 className="text-lg font-black text-[#201C18]">{titles[type]}</h3>
          <p className="text-xs text-[#6A6155] mt-1">{descriptions[type]}</p>
        </div>
        
        {type === 'resource' ? (
          <div className="p-5 space-y-4">
            <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4 flex flex-col items-center justify-center space-y-2">
              <ExternalLink className="w-8 h-8 text-[#6366F1]" />
              <span className="text-sm font-bold text-[#4A433B]">Document Ready</span>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-[#6A6155] hover:bg-[#FAF8F4] rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-white bg-[#6366F1] hover:bg-[#4F46E5] rounded-lg transition-colors">
                Open Resource
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4A433B]">Select Project</label>
              <select
                required
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                className="w-full text-sm border border-[#E4DDD1] rounded-lg px-3 py-2 bg-[#FAF8F4] focus:outline-none focus:border-[#6366F1]"
              >
                <option value="">-- Select a project --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.challengeTitle}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4A433B]">
                {type === 'update' ? 'Prototype Status / Telemetry Summary' : 'Equipment/Dataset Details'}
              </label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Enter details..."
                className="w-full text-sm border border-[#E4DDD1] rounded-lg px-3 py-2 bg-[#FAF8F4] focus:outline-none focus:border-[#6366F1] resize-none"
              />
            </div>
            
            {type === 'update' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A433B]">Attach Telemetry File (JSON/CSV)</label>
                <input 
                  type="file" 
                  className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#6366F1]/10 file:text-[#6366F1] hover:file:bg-[#6366F1]/20 cursor-pointer"
                />
              </div>
            )}

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
                className="px-4 py-2 text-sm font-bold text-white bg-[#6366F1] hover:bg-[#4F46E5] rounded-lg transition-colors disabled:opacity-70 min-w-[100px] cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
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
 * Research Lab / Industry Lab Portal
 *
 * For specialized research labs and industry R&D units:
 * - View projects assigned to their lab
 * - Track prototype development and testing milestones
 * - Submit research updates and telemetry data
 */
export const LabPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { currentLang, languages, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<LabTab>('overview');
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{ type: 'update' | 'request' | 'resource', resourceTitle?: string } | null>(null);

  useEffect(() => {
    const unsubCh = subscribeToChallenges((data) => {
      setChallenges(data);
      setLoading(false);
    });
    const unsubPr = subscribeToProjects((data) => {
      setProjects(data);
      setLoading(false);
    });
    return () => { unsubCh(); unsubPr(); };
  }, []);

  const labName = currentUser?.displayName || 'Research Lab';

  const stats = useMemo(() => {
    const assigned = projects.length;
    const active = projects.filter(p => !['Completed', 'Cancelled'].includes(p.status || '')).length;
    const completed = projects.filter(p => p.status === 'Completed').length;
    return { assigned, active, completed };
  }, [projects]);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#201C18] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#1A1A2E] text-white px-4 sm:px-6 py-3 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-[#6366F1] rounded-xl flex items-center justify-center font-black text-sm">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight">{tr('NIVAARAN', currentLang)}</span>
                <span className="text-[10px] font-extrabold bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {tr('Research Lab Portal', currentLang)}
                </span>
              </div>
              <span className="text-[10px] text-white/60 font-semibold block">
                {tr(currentUser?.role || 'Research Lab', currentLang)} · {labName}
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
              {labName}
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

        <div className="max-w-7xl mx-auto mt-2.5 flex items-center gap-1 border-t border-white/10 pt-2 overflow-x-auto no-scrollbar scrollbar-none scroll-smooth whitespace-nowrap">
          {([
            { id: 'overview', label: tr('Lab Overview', currentLang), icon: FlaskConical },
            { id: 'projects', label: tr('Assigned Projects', currentLang), icon: Beaker },
            { id: 'research', label: tr('R&D Resources', currentLang), icon: Cpu },
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
                <span className="text-[11px] font-extrabold text-[#6366F1] bg-[#6366F1]/10 px-2.5 py-0.5 rounded-full border border-[#6366F1]/25 uppercase tracking-wider">
                  Research & Development
                </span>
              </div>
              <h2 className="text-xl font-black font-heading text-[#201C18]">
                {labName} — Research Dashboard
              </h2>
              <p className="text-xs text-[#6A6155] mt-1">
                Track assigned prototype development, IoT testing, and field validation projects.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Assigned Projects', value: stats.assigned, color: 'text-[#6366F1]' },
                { label: 'Active R&D', value: stats.active, color: 'text-amber-700' },
                { label: 'Completed', value: stats.completed, color: 'text-emerald-700' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white border border-[#E4DDD1] rounded-2xl p-4 shadow-2xs">
                  <span className="text-xs text-[#6A6155] font-medium">{kpi.label}</span>
                  <p className={`text-2xl font-extrabold font-heading ${kpi.color} mt-1`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Lab Capabilities */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#201C18]">Lab Capabilities & Focus Areas</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: Cpu, title: 'IoT & Sensor Development', desc: 'Design, build, and test IoT sensor nodes for environmental monitoring and early warning systems.' },
                  { icon: BarChart3, title: 'Data Analytics & AI', desc: 'Process field telemetry data, build prediction models, and generate actionable insights.' },
                  { icon: FlaskConical, title: 'Prototype Validation', desc: 'Conduct lab testing, field trials, and performance validation for deployed solutions.' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4 space-y-2">
                    <item.icon className="w-5 h-5 text-[#6366F1]" />
                    <p className="text-xs font-bold text-[#201C18]">{item.title}</p>
                    <p className="text-[11px] text-[#6A6155] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'projects' && (
          <>
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Assigned Research Projects</h2>
              <p className="text-xs text-[#6A6155]">{projects.length} projects linked to your lab</p>
            </div>

            {projects.length === 0 ? (
              <PortalEmptyState
                title="No projects assigned yet"
                description="Projects appear here once a university team links their prototype work to your lab."
                icon={<Beaker className="w-8 h-8 text-slate-400" />}
              />
            ) : (
              <div className="space-y-3">
                {projects.map(proj => {
                  const challenge = challenges.find(c => c.id === proj.challengeId || c.reportId === proj.challengeId);
                  const stage = challenge ? getStageForStatus(challenge.status) : null;
                  return (
                    <div key={proj.id} className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {proj.id}
                          </span>
                          <h3 className="text-sm font-extrabold text-[#201C18] mt-1">{proj.challengeTitle}</h3>
                          <p className="text-xs text-[#6A6155] mt-0.5">
                            {proj.universityName} · {proj.district}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAE4D8] text-[#4A433B] shrink-0">
                          {stage ? `Stage ${stage.stageNumber}` : proj.status}
                        </span>
                      </div>

                      {proj.prototypeUpdate && (
                        <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg px-3 py-2 text-xs">
                          <span className="font-bold text-[#6366F1]">Latest Prototype: </span>
                          <span className="text-[#4A433B]">{proj.prototypeUpdate.summary}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-slate-50 rounded-lg p-2.5">
                          <span className="block text-[10px] text-slate-500 font-bold">TEAM</span>
                          <strong>{proj.teamMembers?.length || 0} members</strong>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5">
                          <span className="block text-[10px] text-slate-500 font-bold">MENTOR</span>
                          <strong>{proj.facultyMentorName || '—'}</strong>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5">
                          <span className="block text-[10px] text-slate-500 font-bold">STATUS</span>
                          <strong>{proj.status || 'Active'}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'research' && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black text-[#201C18]">R&D Resources & References</h2>
                <p className="text-xs text-[#6A6155]">
                  Technical references, sensor specifications, and deployment guides for NIVAARAN projects.
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActionModal({ type: 'update' })}
                  className="text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Submit Research Update
                </button>
                <button 
                  onClick={() => setActionModal({ type: 'request' })}
                  className="text-xs font-bold bg-white hover:bg-[#FAF8F4] border border-[#E4DDD1] text-[#201C18] px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Request Resources
                </button>
              </div>
            </div>

            {/* Telemetry Dashboard Mini-View */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#201C18] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#6366F1]" /> Field Telemetry Status
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3">
                  <span className="text-[10px] font-bold text-[#6A6155] uppercase tracking-wider">Active Sensor Nodes</span>
                  <p className="text-xl font-black text-[#201C18] mt-1">14</p>
                </div>
                <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3">
                  <span className="text-[10px] font-bold text-[#6A6155] uppercase tracking-wider">Last Data Push</span>
                  <p className="text-xl font-black text-[#201C18] mt-1 text-emerald-600">5 mins ago</p>
                </div>
                <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3">
                  <span className="text-[10px] font-bold text-[#6A6155] uppercase tracking-wider">Total Readings (24h)</span>
                  <p className="text-xl font-black text-[#201C18] mt-1 text-[#6366F1]">4,892</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { 
                  title: 'IoT Sensor Specifications', 
                  desc: 'Hardware specs for water level, flow velocity, air quality, and seismic sensors used in NIVAARAN field deployments.',
                  action: 'Download Spec'
                },
                { 
                  title: 'Telemetry Data Format', 
                  desc: 'Standardized JSON schema for sensor node telemetry data submission and aggregation.',
                  action: 'View Schema'
                },
                { 
                  title: 'Field Deployment Guide', 
                  desc: 'Step-by-step guide for installing and calibrating sensor nodes in Jharkhand field conditions.',
                  action: 'Open Guide'
                },
                { 
                  title: 'AI Model Registry', 
                  desc: 'Version-controlled AI models for triage, classification, and predictive analytics.',
                  action: 'Browse Models'
                },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4 hover:border-[#6366F1] transition-colors">
                  <div className="space-y-2">
                    <h3 className="text-sm font-extrabold text-[#201C18]">{item.title}</h3>
                    <p className="text-xs text-[#6A6155] leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-[#E4DDD1]">
                    <button 
                      onClick={() => setActionModal({ type: 'resource', resourceTitle: item.title })}
                      className="text-[11px] font-bold text-[#6366F1] flex items-center gap-1.5 hover:text-[#4F46E5] transition-colors cursor-pointer"
                    >
                      {item.action} <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Action Modal */}
      {actionModal && (
        <LabActionModal 
          type={actionModal.type} 
          resourceTitle={actionModal.resourceTitle}
          projects={projects}
          onClose={() => setActionModal(null)} 
        />
      )}
    </div>
  );
};
