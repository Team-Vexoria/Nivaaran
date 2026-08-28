import React, { useState, useEffect } from 'react';
import { PublicNavbar } from '../components/PublicNavbar';
import { UniversityPortal } from './portals/UniversityPortal';
import { 
  Building2, ShieldCheck, UserCheck, ArrowRight, Cpu, ArrowUpRight
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

  const lifecycleStages = [
    { stage: 1, name: 'Submission', desc: 'Geotagged Photo/Video Evidence' },
    { stage: 2, name: 'AI Understanding', desc: 'Classification & Priority Factors' },
    { stage: 3, name: 'Validation', desc: 'Govt Officer Verification' },
    { stage: 4, name: 'Deduplication', desc: 'Cluster Geo Links' },
    { stage: 5, name: 'Prioritization', desc: 'Severity Scoring' },
    { stage: 6, name: 'HEI Matching', desc: 'University Match Scores' },
    { stage: 7, name: 'Acceptance', desc: 'University R&D Agreement' },
    { stage: 8, name: 'Team Formation', desc: 'Multidisciplinary Roster' },
    { stage: 9, name: 'Proposal', desc: 'Milestone & Budget Plan' },
    { stage: 10, name: 'Industry Collab', desc: 'Hardware & Grant Request' },
    { stage: 11, name: 'Prototype', desc: 'IoT & Telemetry Hardware' },
    { stage: 12, name: 'Pilot Testing', desc: 'Panchayat Ground Trial' },
    { stage: 13, name: 'Outcome Audit', desc: 'Verification Report' },
    { stage: 14, name: 'Deployment', desc: 'Statewide Installation' },
    { stage: 15, name: 'Impact Ledger', desc: 'Before/After Audit Proof' },
    { stage: 16, name: 'Closure', desc: 'Knowledge Package' },
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased selection:bg-[#059669] selection:text-white">
      
      {/* 1. Public Header Navbar (Preserved Crisp Civic Blue Header) */}
      <PublicNavbar onOpenAuth={onOpenAuth} />

      <main className="flex-1 space-y-16 pb-20">
        
        {/* 2. Public Grand Hero Section (Clean 1st Viewport Frame) */}
        <section className="min-h-[calc(100vh-65px)] flex flex-col justify-center bg-[#fafafa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] text-slate-900 py-12 px-6 border-b border-slate-200 relative overflow-hidden">
          
          <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10 my-auto">
            
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-tight max-w-4xl mx-auto text-slate-900">
              Report Local Community Problems. Get Verified University and Government Solutions.
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed font-normal">
              Citizens report local floods, water crisis, road damage, or school safety hazards across Jharkhand. Government officers and university research teams build verified solutions for your community.
            </p>

            {/* Primary Action Area */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3.5 shadow-sm transition-all rounded-lg flex items-center justify-center space-x-2 cursor-pointer text-xs sm:text-sm"
              >
                <span>Access Portal Logins</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('framework-16');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 font-semibold px-6 py-3.5 rounded-lg shadow-2xs transition-all flex items-center justify-center space-x-2 cursor-pointer text-xs sm:text-sm"
              >
                <span>View 16-Stage Solution Process</span>
              </button>
            </div>

            {/* Metrics Ticker (Positioned Cleanly Above 1st Frame Bottom Line) */}
            <div className="w-full max-w-5xl mx-auto mt-8 bg-white/90 border border-slate-200/90 rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-left shadow-2xs">
              
              <div className="p-3 space-y-0.5">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-heading">1,284</p>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Incidents Logged</p>
                <p className="text-[11px] text-emerald-700 font-medium">Across 24 Districts</p>
              </div>

              <div className="p-3 space-y-0.5 md:pl-6">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-heading">48+</p>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Active R&D Labs</p>
                <p className="text-[11px] text-slate-600 font-medium">BIT Mesra, IIT ISM, NIT & BAU</p>
              </div>

              <div className="p-3 space-y-0.5 md:pl-6">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-heading">94.8%</p>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Verification Rate</p>
                <p className="text-[11px] text-emerald-700 font-medium">GPS & Photo Audit Verified</p>
              </div>

              <div className="p-3 space-y-0.5 md:pl-6">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-heading">14 Days</p>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Avg Resolution Time</p>
                <p className="text-[11px] text-emerald-700 font-medium">Fast Track Solution Pipeline</p>
              </div>

            </div>

          </div>
        </section>

        {/* 3. Role Portals Gateway Grid */}
        <section id="role-gateways" className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-[#059669] uppercase tracking-wider block">
              Multi-Stakeholder Access
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-[#0F172A]">
              Select Your Role to Access Portal
            </h2>
            <p className="text-xs sm:text-sm text-[#475569]">
              Strict RBAC authorization tailored specifically for government officers, university researchers, industry CSR, and citizens.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleGateways.map((card, idx) => (
              <div 
                key={idx}
                onClick={onOpenAuth}
                className={`p-6 rounded-2xl border ${card.bg} transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between space-y-5 cursor-pointer group`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-white shadow-2xs border border-slate-100">
                      {card.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/80 border border-slate-200 text-slate-700">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900 font-heading group-hover:text-emerald-700 transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-extrabold text-slate-900 group-hover:text-emerald-700">
                  <span>{card.action}</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Interactive 16-Stage Solution Pipeline */}
        <section id="framework-16" className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block">
                  SIH 26043 Architecture Framework
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 mt-1">
                  End-to-End 16-Stage Solution Lifecycle Engine
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Every societal challenge moves through a structured, audit-logged pipeline with explicit human approval checkpoints.
                </p>
              </div>

              <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-mono font-bold shrink-0">
                16 Accountable Stages
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {lifecycleStages.map((st) => (
                <div 
                  key={st.stage} 
                  className="bg-slate-50 hover:bg-emerald-50/60 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                      {st.stage}
                    </span>
                  </div>
                  <span className="block font-bold text-xs text-slate-900 leading-tight font-heading">
                    {st.name}
                  </span>
                  <span className="block text-[10px] text-slate-500 leading-tight">
                    {st.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. 24 Districts GIS & Partner Universities */}
        <section id="university-network" className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-purple-700 uppercase tracking-wider block">
              Higher Education & Research Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
              Partner Universities & Specialization Nodes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Connecting university engineering capabilities directly with real ground problems across Jharkhand districts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {universityNodes.map((u, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                  <Building2 className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 font-heading">{u.name}</h4>
                    <span className="text-[10px] font-bold text-purple-700">{u.node}</span>
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
        <section id="state-impact" className="bg-slate-50 py-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10 relative overflow-hidden border-t-4 border-t-emerald-500 space-y-6">
              
              <div>
                <span className="text-emerald-700 font-semibold tracking-wider text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-3">
                  PUBLIC ACCOUNTABILITY & AUDIT LEDGER
                </span>
                <h2 className="text-slate-900 text-3xl font-bold tracking-tight font-heading">
                  Statewide Verified Impact
                </h2>
                <p className="text-slate-600 text-base max-w-2xl mt-2">
                  100% geotagged validation, transparent audit logs, and verified tree sapling rewards distributed across Jharkhand.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-5 space-y-2">
                  <span className="text-slate-500 text-sm font-medium block">Geotagged Audits</span>
                  <p className="text-slate-900 font-extrabold text-3xl font-heading">100% Proven</p>
                  <span className="text-emerald-600 text-xs font-bold block">GPS Audit Geotags</span>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-5 space-y-2">
                  <span className="text-slate-500 text-sm font-medium block">Districts Connected</span>
                  <p className="text-slate-900 font-extrabold text-3xl font-heading">24 / 24</p>
                  <span className="text-emerald-600 text-xs font-bold block">Statewide Coverage</span>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-5 space-y-2">
                  <span className="text-slate-500 text-sm font-medium block">Citizen Rewards</span>
                  <p className="text-slate-900 font-extrabold text-3xl font-heading">3,420+ Saplings</p>
                  <span className="text-emerald-600 text-xs font-bold block">Tree Vouchers Issued</span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* 7. Official Government Footer */}
      <footer className="bg-[#0b132b] text-slate-300 pt-12 pb-8 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid md:grid-cols-4 gap-8 text-xs text-slate-400">
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="NIVAARAN Logo" className="h-8 w-auto object-contain" />
                <span className="font-extrabold text-base text-white font-heading">NIVAARAN</span>
              </div>
              <p className="leading-relaxed text-slate-400 text-sm">
                Jharkhand Societal Challenge & Innovation Network. Smart India Hackathon Problem Statement 26043.
              </p>
              <p className="text-xs text-slate-500">
                Department of Higher & Technical Education, Government of Jharkhand.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-slate-300 font-semibold text-xs tracking-wider uppercase block">
                Portal Role Entrances
              </span>
              <ul className="space-y-2 text-sm">
                <li><button onClick={onOpenAuth} className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">Government Department Portal</button></li>
                <li><button onClick={onOpenAuth} className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">University & Student Portal</button></li>
                <li><button onClick={onOpenAuth} className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">Industry & CSR Network</button></li>
                <li><button onClick={onOpenAuth} className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">Citizen & Community Intake</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-slate-300 font-semibold text-xs tracking-wider uppercase block">
                Disaster Focus Domains
              </span>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Flooding & Basin Telemetry</li>
                <li>Drought & Groundwater Recharge</li>
                <li>Mine Hazards & Soil Displacement</li>
                <li>Roads & Infrastructure Damage</li>
                <li>School & Health Public Safety</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-slate-300 font-semibold text-xs tracking-wider uppercase block">
                State Helplines
              </span>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>State Emergency Helpline: 1070</li>
                <li>Disaster Management Cell: 0651-2400220</li>
                <li>Higher Education Dept: Ranchi</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <span>© 2026 Government of Jharkhand • All Rights Reserved</span>
            <span className="font-mono text-xs text-slate-400">NIVAARAN Platform v2.0 • SIH 26043</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
