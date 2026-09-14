import React, { useState, useEffect, useMemo } from 'react';
import {
  Handshake, Building2, Search, Compass, FileCheck, Activity,
  ShieldCheck, Award, CheckCircle2,
  MapPin, Clock, Layers, LogOut, Download,
  Check, MessageSquareText, Send, Wrench, History, Filter, BarChart3, TrendingUp, IndianRupee, Users2, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  ChallengeDoc, subscribeToChallenges,
  CollaborationRequest, subscribeToCollaborationRequests,
  Schedule7Category,
  submitCollaborationOffer,
  requestCollaborationDetails
} from '../../services/firebaseService';
import { CollaborationRequestWizard } from '../../components/industry/CollaborationRequestWizard';
import { ActiveCollaborationWorkspace } from '../../components/industry/ActiveCollaborationWorkspace';
import {
  Phase3Project,
  CollaborationPartnerType,
  CollaborationSupportType,
  PARTNER_OPTIONS,
  SUPPORT_OPTIONS
} from '../../services/workflowTypes';
import { getStageForStatus, getPublicStatusLabel } from '../../services/workflowLifecycle';
import { NotificationBellDropdown } from '../../components/notifications/NotificationBellDropdown';
import { CrossPortalMessagingHub } from '../../components/communication/CrossPortalMessagingHub';
import { ChallengeDetailModal } from '../../components/ChallengeDetailModal';

type IndustryTab = 'discovery' | 'my-requests' | 'active' | 'compliance' | 'certificates' | 'opportunities' | 'history' | 'dashboard' | 'messages';

const SCHEDULE7_LIST: Schedule7Category[] = [
  'i. Eradicating extreme hunger, poverty and malnutrition',
  'ii. Promoting education, employment, livelihood',
  'iii. Promoting gender equality, empowering women',
  'iv. Ensuring environmental sustainability',
  'v. Protection of national heritage, art and culture',
  'vi. Measures for the benefit of armed forces veterans',
  'vii. Training to promote rural sports, nationally recognised sports',
  'viii. Contributions to PM National Relief Fund',
  'ix. Contributions to science, technology, engineering, medicine R&D',
  'x. Rural development projects',
  'xi. Slum area development',
  'xii. Disaster management, relief, rehabilitation',
];

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
  const [activeTab, setActiveTab] = useState<IndustryTab>('discovery');

  // Challenges from Firestore
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);
  // Collaboration Requests from Firestore
  const [collabRequests, setCollabRequests] = useState<CollaborationRequest[]>([]);

  // Search & Filter in Discovery
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Wizard state
  const [wizardChallenge, setWizardChallenge] = useState<ChallengeDoc | null>(null);
  const [inspectingChallenge, setInspectingChallenge] = useState<ChallengeDoc | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Legacy offer modal & history state
  const [projects, _setProjects] = useState<Phase3Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Phase3Project | null>(null);
  const [partnerType, setPartnerType] = useState<CollaborationPartnerType>('Industry');
  const [supportType, setSupportType] = useState<CollaborationSupportType>('Funding');
  const [message, setMessage] = useState('We can support fabrication, testing, telemetry credits, and pilot deployment.');
  const [_notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalError, setModalError] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');

  const orgName = currentUser?.displayName || 'Tata Steel CSR Foundation';
  const orgEmail = currentUser?.email || 'partner@tatasteel.com';

  useEffect(() => {
    const unsub1 = subscribeToChallenges(data => setChallenges(data));
    const unsub2 = subscribeToCollaborationRequests(data => setCollabRequests(data));
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  // Filter challenges eligible for industry collaboration:
  // (In Progress, stageNumber >= 7 or assignedHEI present)
  const eligibleChallenges = challenges.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.assignedHEI && c.assignedHEI.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDistrict = selectedDistrict === 'ALL' || c.district === selectedDistrict;
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;

    return matchesSearch && matchesDistrict && matchesCategory;
  });

  // Unique districts & categories
  const districts = ['ALL', ...Array.from(new Set(challenges.map(c => c.district))).filter(Boolean)];
  const categories = ['ALL', ...Array.from(new Set(challenges.map(c => c.category))).filter(Boolean)];

  // My requests for this org
  const myRequests = collabRequests.filter(r =>
    r.orgName === orgName || r.authorizedSignatoryEmail === orgEmail || r.submittedByOrg === orgName
  );

  const activeCollabsCount = collabRequests.filter(r =>
    (r.status === 'MoU Signed' || r.status === 'Active' || r.status === 'Completed') &&
    (r.orgName === orgName || r.authorizedSignatoryEmail === orgEmail || r.submittedByOrg === orgName)
  ).length;

  const handleReturnHome = async () => {
    if (logout) {
      await logout();
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('portal');
    url.searchParams.set('tab', 'home');
    window.history.pushState({ tab: 'home' }, '', url.toString());
    window.dispatchEvent(new Event('popstate'));
  };

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

  const phase3Projects = useMemo(() => {
    return projects.filter(p => (p.status as string) === 'Phase 3' || (p.status as string) === 'In Progress' || p.status === 'Prototype Active' || p.status === 'Pilot Active' || (p.challenge && (getStageForStatus(p.challenge.status)?.stageNumber || 0) >= 9));
  }, [projects]);

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
    <div className="min-h-screen bg-[#FAF8F4] text-[#201C18] flex flex-col antialiased selection:bg-[#2C6E49] selection:text-white font-sans">
      
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-[100] bg-[#FAF8F4] text-[#201C18] border-b border-[#E4DDD1] shadow-2xs px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Portal Branding */}
          <div 
            onClick={handleReturnHome}
            className="flex items-center space-x-2 shrink-0 cursor-pointer select-none"
          >
            <img src="/logo.png" alt="NIVAARAN Logo" className="h-8 sm:h-9 w-auto object-contain shrink-0" />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg sm:text-xl font-black font-heading text-[#201C18] tracking-tight leading-none">
                  NIVAARAN
                </span>
                <span className="text-[10px] font-extrabold bg-[#EAE4D8] text-[#2C6E49] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#E4DDD1]">
                  Industry / CSR Portal
                </span>
              </div>
              <span className="text-[10px] text-[#5A5247] font-semibold block">
                Companies Act 2013 · Section 135 &amp; Schedule VII R&amp;D Marketplace
              </span>
            </div>
          </div>

          {/* Org & User Details */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 bg-white border border-[#E4DDD1] px-3 py-1.5 rounded-xl text-xs shadow-2xs">
              <Building2 className="w-4 h-4 text-[#2C6E49]" />
              <div>
                <p className="font-extrabold text-[#201C18] leading-tight">{orgName}</p>
                <p className="text-[10px] text-[#6A6155]">{currentUser?.role || 'CSR Partner'}</p>
              </div>
            </div>

            <NotificationBellDropdown userRole="industry" userDistrict={orgName} />

            <button
              onClick={handleReturnHome}
              className="text-[11px] font-extrabold text-white bg-[#B5502D] hover:bg-[#9c4323] px-3 py-1.5 rounded-lg transition-colors shrink-0 flex items-center space-x-1 cursor-pointer active:scale-95 shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>

        {/* ── Sub-Tab Navigation Bar ── */}
        <div className="max-w-7xl mx-auto flex items-center justify-between border-t border-[#E4DDD1] pt-2 mt-2 overflow-x-auto gap-2 text-xs">
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('discovery')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'discovery'
                  ? 'bg-[#2C6E49] text-white shadow-2xs'
                  : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>1. Discovery &amp; Collaboration Board</span>
            </button>

            <button
              onClick={() => setActiveTab('my-requests')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'my-requests'
                  ? 'bg-[#2C6E49] text-white shadow-2xs'
                  : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>2. My Collaboration Requests</span>
              {myRequests.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'my-requests' ? 'bg-white text-[#2C6E49]' : 'bg-[#2C6E49] text-white'
                }`}>{myRequests.length}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-[#2C6E49] text-white shadow-2xs'
                  : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#C98A2C]" />
              <span>3. Active Collaborations &amp; Telemetry</span>
              {activeCollabsCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'active' ? 'bg-white text-[#2C6E49]' : 'bg-[#C98A2C] text-white'
                }`}>{activeCollabsCount}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('compliance')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'compliance'
                  ? 'bg-[#2C6E49] text-white shadow-2xs'
                  : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4. Section 135 Compliance Center</span>
            </button>

            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'certificates'
                  ? 'bg-[#2C6E49] text-white shadow-2xs'
                  : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-[#C98A2C]" />
              <span>5. Impact Certificates (Board CSR Report)</span>
            </button>
          </nav>
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
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'messages' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/10'
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>Messages</span>
          </button>
        </div>
      </header>

      {/* ── Main Content Viewport ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* Success Banner */}
        {successBanner && (
          <div className="bg-[#F0FAF4] border border-[#C3E6D0] rounded-xl p-4 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 text-xs text-[#2C6E49] font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button onClick={() => setSuccessBanner(null)} className="text-[#2C6E49] hover:text-[#23583a] text-xs font-extrabold cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 1: DISCOVERY & COLLABORATION BOARD
           ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'discovery' && (
          <div className="space-y-6">
            
            {/* Hero Banner */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-6 shadow-xs relative overflow-hidden">
              <div className="max-w-3xl space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F4] border border-[#E4DDD1] text-[10px] font-extrabold text-[#2C6E49] uppercase tracking-wider">
                  <Handshake className="w-3 h-3" />
                  Section 135 Schedule VII R&D Pipeline
                </div>
                <h1 className="text-xl sm:text-2xl font-black font-heading text-[#201C18] tracking-tight">
                  University R&D Projects Seeking Industry Collaboration
                </h1>
                <p className="text-xs text-[#6A6155] leading-relaxed">
                  Discover validated civic challenges adopted by Jharkhand Higher Education Institutions (IIT ISM Dhanbad, BIT Mesra, NIT Jamshedpur, Birsa Agricultural University). Partner through CSR grants, hardware testing, cloud credits, or pilot deployment.
                </p>
              </div>

              {/* Stat Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#F0EBE0]">
                <div className="bg-[#FAF8F4] p-3 rounded-xl border border-[#E4DDD1]">
                  <p className="text-[10px] font-extrabold text-[#6A6155] uppercase tracking-wider">Available Projects</p>
                  <p className="text-lg font-black text-[#201C18]">{challenges.length}</p>
                </div>
                <div className="bg-[#FAF8F4] p-3 rounded-xl border border-[#E4DDD1]">
                  <p className="text-[10px] font-extrabold text-[#6A6155] uppercase tracking-wider">HEIs Collaborating</p>
                  <p className="text-lg font-black text-[#2C6E49]">6 Autonomous HEIs</p>
                </div>
                <div className="bg-[#FAF8F4] p-3 rounded-xl border border-[#E4DDD1]">
                  <p className="text-[10px] font-extrabold text-[#6A6155] uppercase tracking-wider">Legal Framework</p>
                  <p className="text-xs font-black text-[#C98A2C] mt-1">Companies Act §135</p>
                </div>
                <div className="bg-[#FAF8F4] p-3 rounded-xl border border-[#E4DDD1]">
                  <p className="text-[10px] font-extrabold text-[#6A6155] uppercase tracking-wider">State Mandate</p>
                  <p className="text-xs font-black text-[#201C18] mt-1">Govt of Jharkhand</p>
                </div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white border border-[#E4DDD1] rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#8A7F72] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by challenge title, report ID, HEI, or district..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-xs text-[#201C18] font-medium focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30 placeholder:text-[#B0A89E]"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedDistrict}
                  onChange={e => setSelectedDistrict(e.target.value)}
                  className="px-3 py-2 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-xs text-[#201C18] font-bold focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30"
                >
                  {districts.map(d => <option key={d} value={d}>{d === 'ALL' ? 'All Districts' : d}</option>)}
                </select>

                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-xs text-[#201C18] font-bold focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30"
                >
                  {categories.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Sectors' : c}</option>)}
                </select>
              </div>
            </div>

            {/* Challenge Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eligibleChallenges.map(ch => {
                const isUnderCollab = collabRequests.some(r =>
                  (r.challengeId === ch.id || r.challengeId === ch.reportId) &&
                  (r.status === 'MoU Signed' || r.status === 'Active' || r.status === 'Completed')
                );
                const hasExistingRequest = collabRequests.some(r =>
                  (r.challengeId === ch.id || r.challengeId === ch.reportId) &&
                  (r.orgName === orgName)
                );

                return (
                  <div 
                    key={ch.id || ch.reportId} 
                    onClick={() => setInspectingChallenge(ch)}
                    className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#2C6E49] hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="space-y-3">
                      
                      {/* Top Badges */}
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-[10px] font-extrabold text-[#2C6E49] bg-[#F0FAF4] px-2 py-0.5 rounded-full border border-[#C3E6D0]">
                          {ch.category || 'Civic Infrastructure'}
                        </span>
                        <span className="text-[10px] font-mono text-[#8A7F72]">
                          {ch.reportId}
                        </span>
                      </div>

                      {/* Evidence Photo Preview */}
                      {(ch.evidenceUrl || (ch.evidenceUrls && ch.evidenceUrls[0])) && (
                        <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#E4DDD1] bg-[#FAF8F4]">
                          <img
                            src={ch.evidenceUrl || (ch.evidenceUrls && ch.evidenceUrls[0])}
                            alt={ch.title}
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Title & Summary */}
                      <div>
                        <h3 className="text-sm font-extrabold text-[#201C18] line-clamp-2 leading-snug group-hover:text-[#2C6E49] transition-colors">
                          {ch.title}
                        </h3>
                        <p className="text-xs text-[#6A6155] mt-1.5 line-clamp-3 leading-relaxed">
                          {ch.summary}
                        </p>
                      </div>

                      {/* Location & HEI info */}
                      <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-2.5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#8A7F72] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#B5502D]" /> Location:
                          </span>
                          <span className="font-bold text-[#201C18]">{ch.village}, {ch.block}, {ch.district}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#8A7F72] flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[#2C6E49]" /> Lead HEI:
                          </span>
                          <span className="font-bold text-[#2C6E49] truncate max-w-[160px]">{ch.assignedHEI || 'BIT Mesra (Allocated)'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#8A7F72] flex items-center gap-1">
                            <Layers className="w-3 h-3 text-[#C98A2C]" /> Lifecycle:
                          </span>
                          <span className="font-bold text-[#C98A2C]">{ch.stageName || `Stage ${ch.stageNumber || 9}`}</span>
                        </div>
                      </div>

                      {/* Collaboration Needs Tag */}
                      <div className="bg-[#FFF8EC] border border-[#F0D99A] rounded-xl p-2.5 text-xs text-[#7A5A1A]">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider mb-1">Collaboration Needs</p>
                        <p className="text-[11px] leading-snug">
                          Seeking industry partner for hardware component sponsorship, testing laboratory facilities, and CSR pilot tranche disbursement.
                        </p>
                      </div>

                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 border-t border-[#F0EBE0] space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectingChallenge(ch);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#FAF8F4] hover:bg-[#EAE4D8] text-[#201C18] border border-[#E4DDD1] text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2C6E49]" />
                          <span>View Full Docket</span>
                        </button>
                      </div>

                      {isUnderCollab ? (
                        <div className="flex items-center justify-between text-xs text-[#2C6E49] bg-[#F0FAF4] p-2 rounded-xl font-extrabold">
                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Active MoU Partnered</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab('active');
                            }} 
                            className="text-[10px] underline cursor-pointer"
                          >
                            View Workspace
                          </button>
                        </div>
                      ) : hasExistingRequest ? (
                        <div className="flex items-center justify-between text-xs text-[#C98A2C] bg-[#FFF8EC] p-2 rounded-xl font-extrabold">
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Request Under Review</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab('my-requests');
                            }} 
                            className="text-[10px] underline cursor-pointer"
                          >
                            Track Status
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setWizardChallenge(ch);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-extrabold rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                        >
                          <Handshake className="w-4 h-4" />
                          <span>Express Interest &amp; Formulate Proposal</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: MY COLLABORATION REQUESTS
           ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'my-requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#201C18]">My Collaboration Requests</h2>
                <p className="text-xs text-[#6A6155]">Track status of grant applications, counter-terms from universities, and draft MoUs.</p>
              </div>
              <span className="text-xs font-extrabold text-[#8A7F72]">{myRequests.length} submitted requests</span>
            </div>

            {myRequests.length === 0 ? (
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-10 text-center space-y-3">
                <FileCheck className="w-10 h-10 text-[#D5CDBF] mx-auto" />
                <h3 className="text-sm font-extrabold text-[#8A7F72]">No Collaboration Requests Submitted Yet</h3>
                <p className="text-xs text-[#B0A89E] max-w-md mx-auto">
                  Browse the Discovery Board to find active university R&D projects aligned with your CSR mandate and submit a 5-step proposal.
                </p>
                <button
                  onClick={() => setActiveTab('discovery')}
                  className="px-4 py-2 bg-[#2C6E49] text-white text-xs font-extrabold rounded-xl hover:bg-[#23583a] transition-colors cursor-pointer"
                >
                  Browse Discovery Board
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map(req => {
                  const total = req.disbursementMilestones.reduce((s, m) => s + m.amountInr, 0);

                  return (
                    <div key={req.id || req.requestId} className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-xs space-y-4">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#201C18]">{req.requestId}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              req.status === 'MoU Signed' ? 'bg-[#F0FAF4] text-[#2C6E49] border border-[#C3E6D0]' :
                              req.status === 'Negotiation — Counter Terms Sent' ? 'bg-[#FFF0EE] text-[#B5502D] border border-[#F5C6C0]' :
                              req.status === 'Under University Review' ? 'bg-[#EEF5FF] text-[#1A56AA]' :
                              req.status === 'Declined' ? 'bg-[#F8E8E8] text-[#B3261E]' :
                              'bg-[#FFF8EC] text-[#C98A2C] border border-[#F0D99A]'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <h3 className="text-sm font-extrabold text-[#201C18] mt-1">{req.challengeTitle}</h3>
                          <p className="text-xs text-[#6A6155]">{req.assignedHEI} · {req.collaborationTypes.join(', ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-extrabold text-[#2C6E49]">₹{total.toLocaleString('en-IN')} INR</p>
                          <p className="text-[10px] text-[#8A7F72]">{req.disbursementMilestones.length} Milestone Tranches</p>
                        </div>
                      </div>

                      {/* University Review Note or Counter-Terms */}
                      {req.universityReviewNote && (
                        <div className="bg-[#EEF5FF] border border-[#B8D4F5] rounded-xl p-3 text-xs space-y-1">
                          <p className="font-extrabold text-[#1A56AA]">University Review Feedback (by {req.reviewedByFaculty}):</p>
                          <p className="text-[#1A3A6B]">{req.universityReviewNote}</p>
                          {req.universityCounterTerms && (
                            <div className="mt-2 pt-2 border-t border-[#B8D4F5]">
                              <p className="font-extrabold text-[#B5502D]">Counter-Terms Proposed by University:</p>
                              <p className="text-[#201C18] font-mono text-[11px] mt-0.5">{req.universityCounterTerms}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tranche Preview */}
                      <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3">
                        <p className="text-[10px] font-extrabold text-[#6A6155] uppercase tracking-wider mb-1.5">Disbursement Milestone Schedule</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {req.disbursementMilestones.map(m => (
                            <div key={m.trancheNumber} className="bg-white border border-[#E4DDD1] rounded-lg p-2 text-xs">
                              <div className="flex justify-between font-bold">
                                <span>{m.label}</span>
                                <span className="text-[#2C6E49]">₹{m.amountInr.toLocaleString('en-IN')}</span>
                              </div>
                              <p className="text-[10px] text-[#8A7F72] truncate mt-0.5">{m.triggerStageName}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {req.status === 'MoU Signed' && (
                        <div className="flex items-center justify-between pt-2 border-t border-[#F0EBE0]">
                          <span className="text-xs text-[#2C6E49] font-extrabold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Official Memorandum of Understanding Executed
                          </span>
                          <button
                            onClick={() => setActiveTab('active')}
                            className="px-3 py-1.5 bg-[#2C6E49] text-white text-xs font-extrabold rounded-xl hover:bg-[#23583a] transition-colors cursor-pointer"
                          >
                            Open Live Workspace
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: ACTIVE COLLABORATIONS & TELEMETRY
           ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'active' && (
          <ActiveCollaborationWorkspace
            viewerRole="industry"
            filterByOrg={orgName}
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 4: SECTION 135 COMPLIANCE CENTER
           ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2C6E49]" />
                <div>
                  <h2 className="text-base font-extrabold text-[#201C18]">Corporate Social Responsibility (CSR) Regulatory Compliance</h2>
                  <p className="text-xs text-[#6A6155]">Companies Act 2013 · Section 135 &amp; Schedule VII Verification Engine</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#2C6E49]">
                    <Check className="w-4 h-4" />
                    <span>CSR-1 Mandatory Registration</span>
                  </div>
                  <p className="text-xs text-[#4A433B] leading-relaxed">
                    Under Rule 4(2) of the Companies (CSR Policy) Amendment Rules 2021, any entity receiving CSR funds must possess a unique registration number (Form CSR-1) from the Ministry of Corporate Affairs (MCA). Nivaaran verifies this before executing an MoU.
                  </p>
                </div>

                <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#2C6E49]">
                    <Check className="w-4 h-4" />
                    <span>Schedule VII Item (ix) Alignment</span>
                  </div>
                  <p className="text-xs text-[#4A433B] leading-relaxed">
                    Schedule VII (Item ix) specifically qualifies contributions to science, technology, engineering, and medicine R&D directed towards Sustainable Development Goals (SDGs) at public-funded universities and IITs as eligible CSR expenditure.
                  </p>
                </div>

                <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#2C6E49]">
                    <Check className="w-4 h-4" />
                    <span>Ring-Fenced CSR Bank Account</span>
                  </div>
                  <p className="text-xs text-[#4A433B] leading-relaxed">
                    CSR grant funds are disbursed in tranches to designated university bank accounts separate from general revenue to ensure full auditability by the Comptroller &amp; Auditor General (CAG) and corporate auditors.
                  </p>
                </div>

                <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#2C6E49]">
                    <Check className="w-4 h-4" />
                    <span>CA-Certified Utilization Certificate</span>
                  </div>
                  <p className="text-xs text-[#4A433B] leading-relaxed">
                    Upon reaching Stage 16 (Verified Closure), the platform generates a comprehensive Utilization Certificate and Section 135 Social Impact Dossier for inclusion in the corporate Director's Report.
                  </p>
                </div>
              </div>

              {/* Schedule VII Reference Table */}
              <div className="border-t border-[#F0EBE0] pt-4">
                <h3 className="text-xs font-extrabold text-[#201C18] uppercase tracking-wider mb-2">Schedule VII Prescribed Activities Reference</h3>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  {SCHEDULE7_LIST.map((item, idx) => (
                    <div key={idx} className="bg-white border border-[#E4DDD1] rounded-lg p-2 text-[#4A433B]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 5: IMPACT CERTIFICATES
           ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#C98A2C]" />
                  <div>
                    <h2 className="text-base font-extrabold text-[#201C18]">Section 135 CSR Social Impact Certificates</h2>
                    <p className="text-xs text-[#6A6155]">Official verified certificates issued by the Government of Jharkhand for Corporate Board annual reporting.</p>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#2C6E49] text-white text-xs font-extrabold rounded-xl hover:bg-[#23583a] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Print All Certificates
                </button>
              </div>

              {collabRequests.filter(r => r.status === 'MoU Signed' || r.status === 'Active' || r.status === 'Completed').length === 0 ? (
                <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-8 text-center space-y-2">
                  <Award className="w-8 h-8 text-[#D5CDBF] mx-auto" />
                  <p className="text-xs font-bold text-[#8A7F72]">No certificates available yet</p>
                  <p className="text-[11px] text-[#B0A89E]">Certificates are generated automatically as soon as an MoU is executed and updated as tranches are disbursed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {collabRequests
                    .filter(r => r.status === 'MoU Signed' || r.status === 'Active' || r.status === 'Completed')
                    .map(req => {
                      const certId = `NIVAARAN-CSR-CERT-${req.requestId}`;
                      const total = req.disbursementMilestones.reduce((s, m) => s + m.amountInr, 0);

                      return (
                        <div key={req.id || req.requestId} className="bg-gradient-to-br from-[#F0FAF4] via-white to-[#FAF8F4] border-2 border-[#C3E6D0] rounded-2xl p-6 shadow-sm space-y-4 relative">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold bg-[#2C6E49] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Official Certificate</span>
                                <span className="text-xs font-mono font-bold text-[#6A6155]">{certId}</span>
                              </div>
                              <h3 className="text-base font-black font-heading text-[#201C18] mt-2">{req.challengeTitle}</h3>
                              <p className="text-xs text-[#4A433B]">Partner: <strong>{req.orgName}</strong> ({req.orgType}) · Lead HEI: <strong>{req.assignedHEI}</strong></p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-[#2C6E49]">₹{total.toLocaleString('en-IN')} INR</p>
                              <p className="text-[10px] text-[#8A7F72]">Approved CSR Commitment</p>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-3 gap-3 text-xs bg-white/80 border border-[#E4DDD1] rounded-xl p-3">
                            <div>
                              <p className="text-[9px] font-extrabold text-[#8A7F72] uppercase tracking-wider">Schedule VII Category</p>
                              <p className="font-bold text-[#201C18] text-[11px] truncate mt-0.5">{req.schedule7Category}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-extrabold text-[#8A7F72] uppercase tracking-wider">Beneficiaries Impacted</p>
                              <p className="font-bold text-[#2C6E49] text-[11px] mt-0.5">{Number(req.expectedCommunityBeneficiaries).toLocaleString('en-IN')} Citizens</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-extrabold text-[#8A7F72] uppercase tracking-wider">MCA Registration</p>
                              <p className="font-bold text-[#201C18] text-[11px] mt-0.5">{req.csrRegistrationNumber}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#6A6155] pt-2 border-t border-[#E4DDD1]">
                            <span>Issuing Authority: <strong>State Disaster &amp; Innovation Command · Govt of Jharkhand</strong></span>
                            <button
                              onClick={() => window.print()}
                              className="flex items-center gap-1 text-[#2C6E49] font-extrabold hover:underline cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> Print Single Certificate
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

      {/* ── 5-STEP COLLABORATION WIZARD MODAL ── */}
      {wizardChallenge && (
        <CollaborationRequestWizard
          projectId={`PRJ-${wizardChallenge.assignedHEI?.slice(0, 3).toUpperCase() || 'BIT'}-2026-001`}
          challengeId={wizardChallenge.id || wizardChallenge.reportId}
          challengeTitle={wizardChallenge.title}
          assignedHEI={wizardChallenge.assignedHEI || 'BIT Mesra'}
          orgName={orgName}
          orgEmail={orgEmail}
          onClose={() => setWizardChallenge(null)}
          onSuccess={(requestId) => {
            setWizardChallenge(null);
            setSuccessBanner(`Collaboration request ${requestId} submitted successfully. The university faculty and admin have been notified for review.`);
            setActiveTab('my-requests');
          }}
        />
      )}

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
              <h3 className="text-sm font-black text-[#16293F] uppercase tracking-wider">CSR Funding &amp; Impact Tracker</h3>
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

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Cross-Portal Stakeholder Messages</h2>
              <p className="text-xs text-[#6A6155]">Coordinate with government officers, university mentors, student leads, and citizens across active challenges.</p>
            </div>
            <CrossPortalMessagingHub currentRole="industry" currentUserName={orgName} />
          </div>
        )}
      </main>

      {selectedProject && <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3"><div><span className="text-[10px] uppercase tracking-wider font-bold text-[#B5502D]">Phase 3 collaboration offer</span><h3 className="text-lg font-black text-[#16293F] mt-1">{selectedProject.challenge?.title || selectedProject.challengeTitle}</h3></div><button onClick={() => { setSelectedProject(null); setModalError(''); }} className="text-slate-400 hover:text-slate-800 text-xl">×</button></div><div className="grid sm:grid-cols-2 gap-3 text-xs"><label className="space-y-1"><span className="font-bold text-slate-700">Partner type</span><select value={partnerType} onChange={(e) => setPartnerType(e.target.value as CollaborationPartnerType)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">{PARTNER_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label><label className="space-y-1"><span className="font-bold text-slate-700">Support type</span><select value={supportType} onChange={(e) => setSupportType(e.target.value as CollaborationSupportType)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">{SUPPORT_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label></div><label className="space-y-1 block text-xs"><span className="font-bold text-slate-700">Offer details</span><textarea rows={4} value={message} onChange={(e) => { setMessage(e.target.value); if(modalError) setModalError(''); }} className={`w-full px-3 py-2 border rounded-lg ${modalError ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300'}`} placeholder="Explain what your organization can provide." /></label>{modalError && <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">{modalError}</p>}<div className="flex justify-end gap-2 pt-2 border-t border-slate-100"><button onClick={() => { setSelectedProject(null); setModalError(''); }} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button><button onClick={handleOffer} className="px-4 py-2 bg-[#16293F] hover:bg-[#243D5A] text-white text-xs font-black rounded-lg flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Submit offer</button></div></div></div>}

      {/* Challenge Inspection Modal */}
      <ChallengeDetailModal
        isOpen={!!inspectingChallenge}
        challenge={inspectingChallenge}
        onClose={() => setInspectingChallenge(null)}
        portalRole="industry"
        actionButtonLabel="Collaborate / Propose Grant"
        onActionClick={(c) => {
          setInspectingChallenge(null);
          setWizardChallenge(c);
        }}
      />
    </div>
  );
};
