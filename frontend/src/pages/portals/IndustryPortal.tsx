import React, { useState, useEffect } from 'react';
import {
  Handshake, Building2, Search, Compass, FileCheck, Activity,
  ShieldCheck, Award, CheckCircle2,
  MapPin, Clock, Layers, LogOut, Download,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  ChallengeDoc, subscribeToChallenges,
  CollaborationRequest, subscribeToCollaborationRequests,
  Schedule7Category
} from '../../services/firebaseService';
import { CollaborationRequestWizard } from '../../components/industry/CollaborationRequestWizard';
import { ActiveCollaborationWorkspace } from '../../components/industry/ActiveCollaborationWorkspace';

type IndustryTab = 'discovery' | 'my-requests' | 'active' | 'compliance' | 'certificates';

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
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

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
                Companies Act 2013 · Section 135 & Schedule VII R&D Marketplace
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
              <span>1. Discovery & Collaboration Board</span>
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
              <span>3. Active Collaborations & Telemetry</span>
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
                  <div key={ch.id || ch.reportId} className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#2C6E49]/40 transition-all">
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

                      {/* Title & Summary */}
                      <div>
                        <h3 className="text-sm font-extrabold text-[#201C18] line-clamp-2 leading-snug">
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

                    {/* Bottom Action Button */}
                    <div className="pt-2 border-t border-[#F0EBE0]">
                      {isUnderCollab ? (
                        <div className="flex items-center justify-between text-xs text-[#2C6E49] bg-[#F0FAF4] p-2 rounded-xl font-extrabold">
                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Active MoU Partnered</span>
                          <button onClick={() => setActiveTab('active')} className="text-[10px] underline cursor-pointer">View Workspace</button>
                        </div>
                      ) : hasExistingRequest ? (
                        <div className="flex items-center justify-between text-xs text-[#C98A2C] bg-[#FFF8EC] p-2 rounded-xl font-extrabold">
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Request Under Review</span>
                          <button onClick={() => setActiveTab('my-requests')} className="text-[10px] underline cursor-pointer">Track Status</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setWizardChallenge(ch)}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-extrabold rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                        >
                          <Handshake className="w-4 h-4" />
                          <span>Express Interest & Formulate Proposal</span>
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
                  <p className="text-xs text-[#6A6155]">Companies Act 2013 · Section 135 & Schedule VII Verification Engine</p>
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
                    CSR grant funds are disbursed in tranches to designated university bank accounts separate from general revenue to ensure full auditability by the Comptroller & Auditor General (CAG) and corporate auditors.
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
                            <span>Issuing Authority: <strong>State Disaster & Innovation Command · Govt of Jharkhand</strong></span>
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

      </main>

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

    </div>
  );
};
