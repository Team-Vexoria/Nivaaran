import React, { useState, useEffect } from 'react';
import { PublicNavbar } from '../components/PublicNavbar';
import { UniversityPortal } from './portals/UniversityPortal';
import { JharkhandMapExplorer } from '../components/map/JharkhandMapExplorer';
import { PublicChallengeTracker } from '../components/tracking/PublicChallengeTracker';
import { 
  Building2, ShieldCheck, UserCheck, ArrowRight, Cpu, Search, Eye
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [currentPortal, setCurrentPortal] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('portal') || '';
  });

  const [trackingModal, setTrackingModal] = useState<{ isOpen: boolean; reportId?: string }>({
    isOpen: false,
    reportId: '',
  });

  const [heroTrackQuery, setHeroTrackQuery] = useState<string>('');

  const handleOpenTracking = (reportId?: string) => {
    setTrackingModal({
      isOpen: true,
      reportId: reportId || heroTrackQuery || 'JH-2026-RNC-001',
    });
  };

  const handleNavigatePortal = (portal: string) => {
    const url = new URL(window.location.href);
    if (portal) {
      url.searchParams.set('portal', portal);
    } else {
      url.searchParams.delete('portal');
    }
    window.history.pushState({ portal }, '', url.toString());
    setCurrentPortal(portal);
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const portalParam = params.get('portal');
      setCurrentPortal(portalParam || '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (currentPortal === 'university') {
    return <UniversityPortal />;
  }

  if (currentPortal === 'map') {
    return (
      <JharkhandMapExplorer
        onNavigateHome={() => handleNavigatePortal('')}
      />
    );
  }

  const macroPhases = [
    {
      phase: 'Phase 1: Discovery & AI Triage',
      badge: 'Stages 1–5',
      color: 'border-[#2C6E49] text-[#2C6E49] bg-[#2C6E49]/10',
      stages: [
        { stage: 1, name: 'Submission', desc: 'Geotagged Photo/Video Evidence' },
        { stage: 2, name: 'AI Understanding', desc: 'Classification & Priority Factors' },
        { stage: 3, name: 'Validation', desc: 'Govt Officer Verification' },
        { stage: 4, name: 'Deduplication', desc: 'Cluster Geo Links' },
        { stage: 5, name: 'Prioritization', desc: 'Severity Scoring' },
      ]
    },
    {
      phase: 'Phase 2: Academic Matching & Team',
      badge: 'Stages 6–9',
      color: 'border-[#C98A2C] text-[#C98A2C] bg-[#C98A2C]/10',
      stages: [
        { stage: 6, name: 'HEI Matching', desc: 'University Match Scores' },
        { stage: 7, name: 'Acceptance', desc: 'University R&D Agreement' },
        { stage: 8, name: 'Team Formation', desc: 'Multidisciplinary Roster' },
        { stage: 9, name: 'Proposal', desc: 'Milestone & Budget Plan' },
      ]
    },
    {
      phase: 'Phase 3: Industry & Prototyping',
      badge: 'Stages 10–13',
      color: 'border-[#B5502D] text-[#B5502D] bg-[#B5502D]/10',
      stages: [
        { stage: 10, name: 'Industry Collab', desc: 'Hardware & Grant Request' },
        { stage: 11, name: 'Prototype', desc: 'IoT & Telemetry Hardware' },
        { stage: 12, name: 'Pilot Testing', desc: 'Panchayat Ground Trial' },
        { stage: 13, name: 'Outcome Audit', desc: 'Verification Report' },
      ]
    },
    {
      phase: 'Phase 4: Deployment & Verified Impact',
      badge: 'Stages 14–16',
      color: 'border-[#2C6E49] text-[#2C6E49] bg-[#2C6E49]/10',
      stages: [
        { stage: 14, name: 'Deployment', desc: 'Statewide Installation' },
        { stage: 15, name: 'Impact Ledger', desc: 'Before/After Audit Proof' },
        { stage: 16, name: 'Closure', desc: 'Knowledge Package' },
      ]
    }
  ];

  const universityNodes = [
    { name: 'BIT Mesra, Ranchi', domain: 'Disaster Electronics & Flood Telemetry', node: 'Center of Excellence' },
    { name: 'IIT (ISM) Dhanbad', domain: 'Mine Safety & Geotechnical Displacement', node: 'Mining R&D Wing' },
    { name: 'NIT Jamshedpur', domain: 'Water Basin GIS & Hydraulic Modeling', node: 'Spatial Data Lab' },
    { name: 'Birsa Agricultural University', domain: 'Agro-Water & Drought Recharge', node: 'Irrigation Division' },
    { name: 'IIIT Ranchi', domain: 'Low-Cost Edge AI & Sensor Hardware', node: 'IoT Innovation Lab' },
    { name: 'Ranchi University', domain: 'Civic Surveys & Field Verification', node: 'Feedback Cell' },
  ];

  return (
    <div id="main-content" className="min-h-screen bg-[#FAF8F4] text-[#201C18] flex flex-col antialiased selection:bg-[#2C6E49] selection:text-white">
      {/* 1. Public Header Navbar (With GIGW Utility Strip & Bilingual Toggle) */}
      <PublicNavbar 
        onOpenAuth={onOpenAuth} 
        onNavigatePortal={handleNavigatePortal} 
        onOpenTracking={handleOpenTracking}
      />

      {/* Tracking Modal */}
      {trackingModal.isOpen && (
        <PublicChallengeTracker
          initialReportId={trackingModal.reportId}
          onClose={() => setTrackingModal({ isOpen: false, reportId: '' })}
        />
      )}

      <main className="flex-1 space-y-16 pb-20">
        
        {/* 2. Public Institutional Hero Section (Full 1st Frame Height) */}
        <section className="bg-[#FAF8F4] bg-[radial-gradient(#E4DDD1_1px,transparent_1px)] [background-size:16px_16px] text-[#201C18] min-h-[calc(100vh-84px)] flex flex-col justify-center py-8 sm:py-12 px-6 border-b border-[#E4DDD1] relative overflow-hidden">
          
          {/* Subtle Motif Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#2C6E49_0%,#C98A2C_50%,#B5502D_100%)]"></div>

          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 my-auto">
            
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-[#201C18] tracking-tight leading-tight max-w-4xl mx-auto">
              Report Local Community Problems. Get Verified University and Government Solutions.
            </h1>

            {/* Subtitle */}
            <p className="text-[#4A433B] text-sm sm:text-base leading-relaxed font-normal max-w-3xl mx-auto">
              Citizens report local floods, water crisis, road damage, or school safety hazards across Jharkhand. Government officers and university research teams build verified solutions for your community.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto bg-[#2C6E49] hover:bg-[#23583a] text-white font-semibold px-6 py-3.5 shadow-sm transition-all rounded-lg flex items-center justify-center space-x-2 cursor-pointer text-xs sm:text-sm"
              >
                <span>Access Stakeholder Portals</span>
                <ArrowRight className="w-4 h-4 shrink-0 text-white" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('framework-16');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-white border border-[#E4DDD1] text-[#201C18] hover:bg-[#F3EDE2] hover:border-[#C4BDB0] font-semibold px-6 py-3.5 rounded-lg shadow-2xs transition-all flex items-center justify-center space-x-2 cursor-pointer text-xs sm:text-sm"
              >
                <span>View 16-Stage Lifecycle Map</span>
              </button>
            </div>

            {/* Live 16-Stage Challenge Tracking Bar */}
            <div className="max-w-xl mx-auto pt-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleOpenTracking(heroTrackQuery || 'JH-2026-RNC-001');
                }}
                className="bg-white border border-[#E4DDD1] rounded-2xl p-2 shadow-sm flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#8A7F72] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Track Challenge Status (e.g. JH-2026-RNC-001)..."
                    value={heroTrackQuery}
                    onChange={(e) => setHeroTrackQuery(e.target.value)}
                    className="w-full bg-transparent pl-9 pr-3 py-1.5 text-xs text-[#201C18] font-medium focus:outline-none placeholder:text-[#8A7F72]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Track Status</span>
                </button>
              </form>
              <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-[#6A6155]">
                <span className="text-[#8A7F72]">Popular Audits:</span>
                {['JH-2026-RNC-001', 'JH-2026-DHN-002', 'JH-2026-ESB-003'].map(code => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleOpenTracking(code)}
                    className="font-mono text-[10px] text-[#2C6E49] hover:underline cursor-pointer font-bold"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Integrated Monolithic Civic Impact Ticker Strip */}
            <div className="w-full max-w-5xl mx-auto mt-8 bg-white border border-[#E4DDD1] rounded-xl p-4 sm:p-5 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E4DDD1] text-left shadow-2xs relative z-10">
              
              <div className="p-3 space-y-0.5">
                <p className="text-2xl sm:text-3xl font-bold text-[#201C18] tracking-tight font-heading">24 / 24</p>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Districts Connected</p>
                <p className="text-[11px] text-[#2C6E49] font-medium">Statewide Active Coverage</p>
              </div>

              <div className="p-3 space-y-0.5 md:pl-6">
                <p className="text-2xl sm:text-3xl font-bold text-[#201C18] tracking-tight font-heading">48</p>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">HEI R&D Labs Onboarded</p>
                <p className="text-[11px] text-slate-600 font-medium">BIT Mesra, IIT ISM, NIT & BAU</p>
              </div>

              <div className="p-3 space-y-0.5 md:pl-6">
                <p className="text-2xl sm:text-3xl font-bold text-[#201C18] tracking-tight font-heading">94.8%</p>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Field Audit Rate</p>
                <p className="text-[11px] text-[#2C6E49] font-medium">GPS Geotag Verified</p>
              </div>

              <div className="p-3 space-y-0.5 md:pl-6">
                <p className="text-2xl sm:text-3xl font-bold text-[#201C18] tracking-tight font-heading">14 Days</p>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Avg Resolution Time</p>
                <p className="text-[11px] text-[#2C6E49] font-medium">4x Acceleration vs Legacy</p>
              </div>

            </div>

          </div>
        </section>

        {/* 3. Role Portals Gateway Tree Diagram */}
        <section id="role-gateways" className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-[#2C6E49] uppercase tracking-wider block">
              Multi-Stakeholder Access
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-[#201C18]">
              Select Your Role to Access Portal
            </h2>
          </div>

          {/* Tree Diagram */}
          <div className="flex flex-col items-center">

            {/* Root Hub Node */}
            <div className="bg-white border-2 border-[#2C6E49] text-[#201C18] px-8 py-3 rounded-2xl shadow-sm flex items-center justify-center relative z-10">
              <p className="font-black text-base font-heading tracking-tight text-[#201C18]">NIVAARAN Platform</p>
            </div>

            {/* Vertical stem down from root */}
            <div className="w-px h-8 bg-[#DCD6C6]" />

            {/* Horizontal branch bar */}
            <div className="relative w-full max-w-5xl">
              <div className="absolute top-0 left-[12.5%] right-[12.5%] h-px bg-[#DCD6C6]" />

              {/* 4 branch drops + cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-0">
                {/* Gov */}
                <div className="flex flex-col items-center">
                  <div className="w-px h-8 bg-[#DCD6C6]" />
                  <button
                    onClick={onOpenAuth}
                    className="w-full p-5 rounded-2xl border-2 bg-white border-[#E4DDD1] hover:border-[#1D4ED8] hover:shadow-lg transition-all duration-300 group text-left space-y-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                        <Building2 className="w-6 h-6 text-[#1D4ED8]" />
                      </div>
                      <span className="text-[10px] font-bold text-[#4A433B] bg-[#FAF8F4] px-2 py-0.5 rounded-full border border-[#E4DDD1]">State & District</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black font-heading text-[#201C18] group-hover:text-[#1D4ED8] transition-colors leading-tight">Government Portal</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Validate, prioritize & assign university R&D teams</p>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] font-extrabold text-[#1D4ED8] group-hover:translate-x-1 transition-transform">
                      <span>Enter Portal</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </div>
                  </button>
                </div>

                {/* University */}
                <div className="flex flex-col items-center">
                  <div className="w-px h-8 bg-[#DCD6C6]" />
                  <button
                    onClick={onOpenAuth}
                    className="w-full p-5 rounded-2xl border-2 bg-white border-[#E4DDD1] hover:border-purple-400 hover:shadow-lg transition-all duration-300 group text-left space-y-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                        <Cpu className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="text-[10px] font-bold text-[#4A433B] bg-[#FAF8F4] px-2 py-0.5 rounded-full border border-[#E4DDD1]">BIT · IIT · NIT</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black font-heading text-[#201C18] group-hover:text-purple-600 transition-colors leading-tight">University Portal</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Build teams, IoT prototypes & milestone proposals</p>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] font-extrabold text-purple-600 group-hover:translate-x-1 transition-transform">
                      <span>Enter Portal</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </div>
                  </button>
                </div>

                {/* Industry */}
                <div className="flex flex-col items-center">
                  <div className="w-px h-8 bg-[#DCD6C6]" />
                  <button
                    onClick={onOpenAuth}
                    className="w-full p-5 rounded-2xl border-2 bg-white border-[#E4DDD1] hover:border-[#C98A2C] hover:shadow-lg transition-all duration-300 group text-left space-y-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                        <ShieldCheck className="w-6 h-6 text-[#C98A2C]" />
                      </div>
                      <span className="text-[10px] font-bold text-[#4A433B] bg-[#FAF8F4] px-2 py-0.5 rounded-full border border-[#E4DDD1]">MSME · CSR</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black font-heading text-[#201C18] group-hover:text-[#C98A2C] transition-colors leading-tight">Industry & CSR</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Fund projects, grant hardware & mentor teams</p>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] font-extrabold text-[#C98A2C] group-hover:translate-x-1 transition-transform">
                      <span>Enter Portal</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </div>
                  </button>
                </div>

                {/* Citizen */}
                <div className="flex flex-col items-center">
                  <div className="w-px h-8 bg-[#DCD6C6]" />
                  <button
                    onClick={onOpenAuth}
                    className="w-full p-5 rounded-2xl border-2 bg-white border-[#E4DDD1] hover:border-[#2C6E49] hover:shadow-lg transition-all duration-300 group text-left space-y-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                        <UserCheck className="w-6 h-6 text-[#2C6E49]" />
                      </div>
                      <span className="text-[10px] font-bold text-[#4A433B] bg-[#FAF8F4] px-2 py-0.5 rounded-full border border-[#E4DDD1]">Citizens · Panchayat</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black font-heading text-[#201C18] group-hover:text-[#2C6E49] transition-colors leading-tight">Citizen Intake</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Report hazards, track 16 stages & earn rewards</p>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] font-extrabold text-[#2C6E49] group-hover:translate-x-1 transition-transform">
                      <span>Report Problem</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 4. 16-Stage Pipeline Flow Diagram */}
        <section id="framework-16" className="max-w-7xl mx-auto px-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#201C18]">16-Stage Challenge Lifecycle</h2>
            </div>
            <div className="px-3.5 py-1.5 bg-[#2C6E49]/10 text-[#2C6E49] border border-[#2C6E49]/30 rounded-xl text-xs font-mono font-bold shrink-0 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#2C6E49]"></span>
              <span>Citizen → Closure · Full Audit Trail</span>
            </div>
          </div>

          <div className="space-y-4">
            {macroPhases.map((mp, pIdx) => {
              const phaseColors = [
                { bg: 'bg-[#2C6E49]', light: 'bg-[#2C6E49]/5', border: 'border-[#2C6E49]/25', text: 'text-[#2C6E49]', bubble: 'bg-[#2C6E49]' },
                { bg: 'bg-[#C98A2C]', light: 'bg-[#C98A2C]/5', border: 'border-[#C98A2C]/25', text: 'text-[#C98A2C]', bubble: 'bg-[#C98A2C]' },
                { bg: 'bg-[#B5502D]', light: 'bg-[#B5502D]/5', border: 'border-[#B5502D]/25', text: 'text-[#B5502D]', bubble: 'bg-[#B5502D]' },
                { bg: 'bg-[#2C6E49]', light: 'bg-[#2C6E49]/5', border: 'border-[#2C6E49]/25', text: 'text-[#2C6E49]', bubble: 'bg-[#2C6E49]' },
              ][pIdx];

              const gridCols = mp.stages.length === 5 
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5' 
                : mp.stages.length === 4 
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' 
                : 'grid-cols-1 sm:grid-cols-3';

              return (
                <div key={pIdx} className={`${phaseColors.light} border ${phaseColors.border} rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs`}>
                  {/* Phase label */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className={`${phaseColors.bg} text-white text-[11px] font-black px-3 py-1 rounded-full font-mono shadow-2xs`}>{mp.badge}</span>
                      <span className={`${phaseColors.text} text-sm font-extrabold font-heading`}>{mp.phase}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono font-medium hidden sm:inline">
                      {mp.stages.length} Connected Stages
                    </span>
                  </div>

                  {/* Stage nodes full-width grid */}
                  <div className={`grid ${gridCols} gap-3.5 w-full`}>
                    {mp.stages.map((st, sIdx) => (
                      <div 
                        key={st.stage}
                        className="bg-white p-4 rounded-xl border border-[#E4DDD1] shadow-2xs hover:border-[#2C6E49] transition-all flex flex-col justify-between space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <div className={`${phaseColors.bubble} text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs font-mono shadow-2xs shrink-0`}>
                            {st.stage}
                          </div>
                          {sIdx < mp.stages.length - 1 && (
                            <span className="text-[#C4BDB0] group-hover:text-[#2C6E49] font-bold text-xs hidden lg:inline transition-colors">→</span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[#201C18] font-heading leading-tight">{st.name}</p>
                          <p className="text-[11px] text-slate-500 leading-snug mt-1">{st.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. 24 Districts GIS & Partner Universities */}
        <section id="university-network" className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-[#C98A2C] uppercase tracking-wider block">
              Higher Education & Research Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#201C18]">
              Partner Universities & Specialization Nodes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Connecting university engineering capabilities directly with real ground problems across Jharkhand districts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {universityNodes.map((u, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-[#E4DDD1] shadow-2xs space-y-3">
                <div className="flex items-center space-x-3 border-b border-[#FAF8F4] pb-3">
                  <Building2 className="w-5 h-5 text-[#C98A2C] shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-sm text-[#201C18] font-heading">{u.name}</h4>
                    <span className="text-[10px] font-bold text-[#C98A2C]">{u.node}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Focus Area:</strong> {u.domain}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. State Impact Analytics */}
        <section id="state-impact" className="bg-[#FAF8F4] py-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-2xl border border-[#E4DDD1] shadow-sm p-8 md:p-10 relative overflow-hidden border-t-4 border-t-[#2C6E49] space-y-6">
              
              <div>
                <span className="text-[#2C6E49] font-semibold tracking-wider text-xs bg-[#2C6E49]/10 px-3 py-1 rounded-full border border-[#2C6E49]/30 inline-block mb-3">
                  PUBLIC ACCOUNTABILITY & AUDIT LEDGER
                </span>
                <h2 className="text-[#201C18] text-3xl font-bold tracking-tight font-heading">
                  Statewide Verified Impact
                </h2>
                <p className="text-slate-600 text-base max-w-2xl mt-2">
                  100% geotagged validation, transparent audit logs, and verified tree sapling rewards distributed across Jharkhand.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-[#FAF8F4] rounded-xl border border-[#E4DDD1] p-5 space-y-2">
                  <span className="text-slate-500 text-sm font-medium block">Geotagged Audits</span>
                  <p className="text-[#201C18] font-extrabold text-3xl font-heading">100% Proven</p>
                  <span className="text-[#2C6E49] text-xs font-bold block">GPS Audit Geotags</span>
                </div>

                <div className="bg-[#FAF8F4] rounded-xl border border-[#E4DDD1] p-5 space-y-2">
                  <span className="text-slate-500 text-sm font-medium block">Districts Connected</span>
                  <p className="text-[#201C18] font-extrabold text-3xl font-heading">24 / 24</p>
                  <span className="text-[#2C6E49] text-xs font-bold block">Statewide Coverage</span>
                </div>

                <div className="bg-[#FAF8F4] rounded-xl border border-[#E4DDD1] p-5 space-y-2">
                  <span className="text-slate-500 text-sm font-medium block">Citizen Rewards</span>
                  <p className="text-[#201C18] font-extrabold text-3xl font-heading">3,420+ Saplings</p>
                  <span className="text-[#2C6E49] text-xs font-bold block">Tree Vouchers Issued</span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* 7. Official Government Footer */}
      <footer className="bg-[#2C323B] text-slate-200 pt-12 pb-8 px-6 border-t border-[#3D4550]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid md:grid-cols-4 gap-8 text-xs text-slate-300">
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="NIVAARAN Logo" className="h-8 w-auto object-contain" />
                <span className="font-extrabold text-base text-white font-heading">NIVAARAN</span>
              </div>
              <p className="leading-relaxed text-slate-300 text-sm">
                Jharkhand Societal Challenge & Innovation Network. Smart India Hackathon Problem Statement 26043.
              </p>
              <p className="text-xs text-slate-400">
                Department of Higher & Technical Education, Government of Jharkhand.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[#C98A2C] font-extrabold text-xs tracking-wider uppercase block">
                Portal Role Entrances
              </span>
              <ul className="space-y-2 text-sm">
                <li><button onClick={onOpenAuth} className="text-slate-300 hover:text-white transition-colors cursor-pointer">Government Department Portal</button></li>
                <li><button onClick={onOpenAuth} className="text-slate-300 hover:text-white transition-colors cursor-pointer">University & Student Portal</button></li>
                <li><button onClick={onOpenAuth} className="text-slate-300 hover:text-white transition-colors cursor-pointer">Industry & CSR Network</button></li>
                <li><button onClick={onOpenAuth} className="text-slate-300 hover:text-white transition-colors cursor-pointer">Citizen & Community Intake</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[#C98A2C] font-extrabold text-xs tracking-wider uppercase block">
                Disaster Focus Domains
              </span>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Flooding & Basin Telemetry</li>
                <li>Drought & Groundwater Recharge</li>
                <li>Mine Hazards & Soil Displacement</li>
                <li>Roads & Infrastructure Damage</li>
                <li>School & Health Public Safety</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[#C98A2C] font-extrabold text-xs tracking-wider uppercase block">
                State Helplines
              </span>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>State Emergency Helpline: 1070</li>
                <li>Disaster Management Cell: 0651-2400220</li>
                <li>Higher Education Dept: Ranchi</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-[#3D4550] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <span>© 2026 Government of Jharkhand • All Rights Reserved</span>
            <span className="font-mono text-xs text-slate-300">NIVAARAN Platform v2.0 • SIH 26043</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
