import React, { useState, useEffect } from 'react';
import { PublicNavbar } from '../components/PublicNavbar';
import { UniversityPortal } from './portals/UniversityPortal';
import { JharkhandMapExplorer } from '../components/map/JharkhandMapExplorer';
import { 
  Building2, ShieldCheck, UserCheck, ArrowRight, Cpu
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [currentPortal, setCurrentPortal] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('portal') || '';
  });

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
        onNavigateHome={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('portal');
          window.history.pushState({}, '', url.toString());
          setCurrentPortal('');
        }}
      />
    );
  }

  const roleGateways = [
    {
      role: 'Government Department',
      icon: <Building2 className="w-7 h-7 text-[#1D4ED8]" />,
      bg: 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40',
      badge: 'State & District Officers',
      title: 'Government Department Portal',
      desc: 'Validate geotagged reports, prioritize district hazards, assign university R&D teams, and monitor 24-district state analytics.',
      action: 'Enter Government Portal',
    },
    {
      role: 'University R&D',
      icon: <Cpu className="w-7 h-7 text-purple-600" />,
      bg: 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/40',
      badge: 'BIT, IIT, NIT, BAU & HEIs',
      title: 'University & Student Portal',
      desc: 'Discover matched community challenges, form multidisciplinary student/faculty teams, build IoT prototypes, and track milestone proposals.',
      action: 'Enter HEI & Student Workspace',
    },
    {
      role: 'Industry & CSR',
      icon: <ShieldCheck className="w-7 h-7 text-[#F59E0B]" />,
      bg: 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40',
      badge: 'Corporate & MSME Partners',
      title: 'Industry & CSR Network',
      desc: 'Co-sponsor high-impact engineering projects, provide telemetry hardware grants, and mentor student research teams.',
      action: 'Enter Industry / CSR Network',
    },
    {
      role: 'Citizen & Community',
      icon: <UserCheck className="w-7 h-7 text-[#16A34A]" />,
      bg: 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40',
      badge: 'Citizens & Panchayat Orgs',
      title: 'Citizen & Community Intake',
      desc: 'Report local flood risks, water shortage, or road hazards with GPS photos/videos. Track 16-stage progress & earn tree sapling rewards.',
      action: 'Citizen Access & Report Problem',
    },
  ];

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

  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);

  return (
    <div id="main-content" className="min-h-screen bg-[#FAF8F4] text-[#201C18] flex flex-col antialiased selection:bg-[#2C6E49] selection:text-white">
      
<<<<<<< HEAD
 soul
      {/* 5-Route Citizen Navbar */}
      <CitizenNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAuth={onOpenAuth}
        onOpenUniversityPortal={() => {
          setCurrentPortal('university');
          const url = new URL(window.location.href);
          url.searchParams.set('portal', 'university');
          window.history.pushState({ portal: 'university' }, '', url.toString());
        }}
        currentLang={currentLang}
        onLangChange={setLanguage}
        userDisplayName={currentUser?.displayName || ''}
        userEmail={currentUser?.email || ''}
      />

      {/* Main Tab View Stream */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <CitizenHomeTab
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'my-reports' && (
          <CitizenMyReportsTab
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'community-feed' && (
          <CitizenCommunityFeedTab />
        )}

        {activeTab === 'region-chat' && (
          <CitizenRegionChatTab />
        )}

        {activeTab === 'leaderboard' && (
          <CitizenLeaderboardTab />
        )}

        {activeTab === 'profile' && (
          <CitizenProfileTab
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onTabChange={handleTabChange}
          />
        )}

      {/* 1. Public Header Navbar (Preserved Crisp Civic Blue Header) */}
=======
      {/* 1. Public Header Navbar (With GIGW Utility Strip & Bilingual Toggle) */}
>>>>>>> backup-local-work
      <PublicNavbar onOpenAuth={onOpenAuth} />

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

        {/* 3. Role Portals Gateway Grid */}
        <section id="role-gateways" className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-[#2C6E49] uppercase tracking-wider block">
              Multi-Stakeholder Access
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-[#201C18]">
              Select Your Role to Access Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Strict RBAC authorization tailored specifically for government officers, university researchers, industry CSR, and citizens.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleGateways.map((card, idx) => (
              <div 
                key={idx}
                onClick={onOpenAuth}
                className="p-6 rounded-2xl border bg-white border-[#E4DDD1] hover:border-[#C98A2C] transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between space-y-5 cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-[#FAF8F4] border border-[#E4DDD1]">
                      {card.icon}
                    </div>
                    <span className="text-[11px] font-bold text-[#4A433B] bg-[#FAF8F4] px-2.5 py-1 rounded-full border border-[#E4DDD1]">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-heading text-[#201C18] group-hover:text-[#2C6E49] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-xs font-extrabold text-[#201C18] group-hover:translate-x-1 transition-transform">
                  <span>{card.action}</span>
                  <ArrowRight className="w-4 h-4 text-[#2C6E49] shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Interactive 16-Stage Connected Lifecycle Stepper Stream */}
        <section id="framework-16" className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E4DDD1] shadow-sm space-y-8 relative overflow-hidden">
            
            {/* Motif Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#2C6E49_0%,#C98A2C_50%,#B5502D_100%)]"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4DDD1] pb-6 pt-2">
              <div>
                <span className="text-xs font-extrabold text-[#2C6E49] uppercase tracking-wider block">
                  SIH 26043 ARCHITECTURE FRAMEWORK
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#201C18] mt-1">
                  Connected 16-Stage Solution Lifecycle Stream
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                  Every societal challenge moves through 4 macro-phases and 16 transparent, audit-logged stages from citizen report to verified closure.
                </p>
              </div>

              <div className="px-4 py-2 bg-[#211D19] text-white rounded-xl text-xs font-mono font-bold shrink-0 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#2C6E49] animate-pulse"></span>
                <span>16 Accountable Stages</span>
              </div>
            </div>

            {/* 4 Macro-Phase Interactive Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {macroPhases.map((mp, pIdx) => {
                const isActive = activePhaseIndex === pIdx;
                return (
                  <button
                    key={pIdx}
                    onClick={() => setActivePhaseIndex(pIdx)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? `${mp.color} border-2 shadow-xs`
                        : 'bg-[#FAF8F4] border-[#E4DDD1] hover:bg-[#F3EDE2] text-[#201C18]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#E4DDD1] shadow-2xs">
                        {mp.badge}
                      </span>
                      <span className="text-xs font-bold font-mono">
                        {pIdx + 1}/4
                      </span>
                    </div>
                    <p className="text-sm font-bold mt-2 font-heading">
                      {mp.phase}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Connected Stage Nodes for Currently Selected Phase */}
            <div className="bg-[#FAF8F4] p-5 rounded-2xl border border-[#E4DDD1] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#201C18] uppercase">
                  {macroPhases[activePhaseIndex].phase} — Stage Pipeline
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Click stage to inspect details
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {macroPhases[activePhaseIndex].stages.map((st, sIdx) => (
                  <div
                    key={st.stage}
                    className="bg-white p-4 rounded-xl border border-[#E4DDD1] shadow-2xs space-y-2 relative group hover:border-[#2C6E49] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-full bg-[#211D19] text-white text-xs font-black flex items-center justify-center font-mono">
                        {st.stage}
                      </span>
                      {sIdx < macroPhases[activePhaseIndex].stages.length - 1 && (
                        <span className="text-[#C4BDB0] font-bold text-sm hidden lg:inline">→</span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-[#201C18] font-heading">
                      {st.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {st.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

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

 main
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
