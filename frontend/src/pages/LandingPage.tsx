import React, { useState, useEffect, useMemo } from 'react';
import { PublicNavbar } from '../components/PublicNavbar';
import { UniversityPortal } from './portals/UniversityPortal';
import { JharkhandMapExplorer } from '../components/map/JharkhandMapExplorer';
import {
  Building2, ShieldCheck, UserCheck, ArrowRight, Cpu
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { workflowStore, STORE_EVENT } from '../services/workflowStore';
import { getStageForStatus } from '../services/workflowLifecycle';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { currentLang, setLanguage, t } = useLanguage();
  const [currentPortal, setCurrentPortal] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('portal') || '';
  });

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

  // Live subscription to workflowStore so hero stats reflect real activity.
  const [wfChallenges, setWfChallenges] = useState(workflowStore.getChallenges());
  useEffect(() => {
    const handler = () => setWfChallenges(workflowStore.getChallenges());
    window.addEventListener(STORE_EVENT, handler);
    return () => window.removeEventListener(STORE_EVENT, handler);
  }, []);

  // Live civic-impact ticker numbers derived from the store (with seed fallbacks).
  const liveTickerStats = useMemo(() => {
    const total = wfChallenges.length;
    const resolved = wfChallenges.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
    const govVerified = wfChallenges.filter(c => {
      const stage = getStageForStatus(c.status)?.stageNumber ?? 0;
      return stage >= 3;
    }).length;
    const verifiedDistricts = new Set(wfChallenges.filter(c => c.district).map(c => c.district)).size;
    const verificationRate = total > 0 ? Math.round((govVerified / total) * 100) : 94;
    return {
      total: total || 1284,
      resolved,
      verifiedDistricts: verifiedDistricts || 24,
      verificationRate: verificationRate || 94,
    };
  }, [wfChallenges]);

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
      phase: t.landing.phase1,
      badge: t.landing.phase1Badge,
      color: 'border-[#2C6E49] text-[#2C6E49] bg-[#2C6E49]/10',
      stages: [
        { stage: 1, name: t.landing.s1Name, desc: t.landing.s1Desc },
        { stage: 2, name: t.landing.s2Name, desc: t.landing.s2Desc },
        { stage: 3, name: t.landing.s3Name, desc: t.landing.s3Desc },
        { stage: 4, name: t.landing.s4Name, desc: t.landing.s4Desc },
        { stage: 5, name: t.landing.s5Name, desc: t.landing.s5Desc },
      ]
    },
    {
      phase: t.landing.phase2,
      badge: t.landing.phase2Badge,
      color: 'border-[#C98A2C] text-[#C98A2C] bg-[#C98A2C]/10',
      stages: [
        { stage: 6, name: t.landing.s6Name, desc: t.landing.s6Desc },
        { stage: 7, name: t.landing.s7Name, desc: t.landing.s7Desc },
        { stage: 8, name: t.landing.s8Name, desc: t.landing.s8Desc },
        { stage: 9, name: t.landing.s9Name, desc: t.landing.s9Desc },
      ]
    },
    {
      phase: t.landing.phase3,
      badge: t.landing.phase3Badge,
      color: 'border-[#B5502D] text-[#B5502D] bg-[#B5502D]/10',
      stages: [
        { stage: 10, name: t.landing.s10Name, desc: t.landing.s10Desc },
        { stage: 11, name: t.landing.s11Name, desc: t.landing.s11Desc },
        { stage: 12, name: t.landing.s12Name, desc: t.landing.s12Desc },
        { stage: 13, name: t.landing.s13Name, desc: t.landing.s13Desc },
      ]
    },
    {
      phase: t.landing.phase4,
      badge: t.landing.phase4Badge,
      color: 'border-[#2C6E49] text-[#2C6E49] bg-[#2C6E49]/10',
      stages: [
        { stage: 14, name: t.landing.s14Name, desc: t.landing.s14Desc },
        { stage: 15, name: t.landing.s15Name, desc: t.landing.s15Desc },
        { stage: 16, name: t.landing.s16Name, desc: t.landing.s16Desc },
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
      <PublicNavbar onOpenAuth={onOpenAuth} onNavigatePortal={handleNavigatePortal} currentLang={currentLang} onLangChange={setLanguage} />

      <main className="flex-1 space-y-16 pb-20">
        
        {/* 2. Public Institutional Hero Section (Full 1st Frame Height) */}
        <section className="bg-[#FAF8F4] bg-[radial-gradient(#E4DDD1_1px,transparent_1px)] [background-size:16px_16px] text-[#201C18] min-h-[calc(100vh-84px)] flex flex-col justify-center py-8 sm:py-12 px-6 border-b border-[#E4DDD1] relative overflow-hidden">
          
          {/* Subtle Motif Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#2C6E49_0%,#C98A2C_50%,#B5502D_100%)]"></div>

          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 my-auto">
            
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-[#201C18] tracking-tight leading-tight max-w-4xl mx-auto">
              {t.landing.heroMainTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-[#4A433B] text-sm sm:text-base leading-relaxed font-normal max-w-3xl mx-auto">
              {t.landing.heroSubtitle}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto bg-[#2C6E49] hover:bg-[#23583a] text-white font-semibold px-6 py-3.5 shadow-sm transition-all rounded-lg flex items-center justify-center space-x-2 cursor-pointer text-xs sm:text-sm"
              >
                <span>{t.landing.heroCtaPortals}</span>
                <ArrowRight className="w-4 h-4 shrink-0 text-white" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('framework-16');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-white border border-[#E4DDD1] text-[#201C18] hover:bg-[#F3EDE2] hover:border-[#C4BDB0] font-semibold px-6 py-3.5 rounded-lg shadow-2xs transition-all flex items-center justify-center space-x-2 cursor-pointer text-xs sm:text-sm"
              >
                <span>{t.landing.heroCtaLifecycle}</span>
              </button>
            </div>

            {/* Integrated Monolithic Civic Impact Ticker Strip */}
            <div className="w-full max-w-5xl mx-auto mt-8 bg-white border border-[#E4DDD1] rounded-xl p-4 sm:p-5 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E4DDD1] text-left shadow-2xs relative z-10">
              
              <div className="p-3 space-y-0.5">
                <p className="text-2xl sm:text-3xl font-bold text-[#201C18] tracking-tight font-heading">{liveTickerStats.verifiedDistricts} / 24</p>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">{t.landing.tickerDistrictsLabel}</p>
                <p className="text-[11px] text-[#2C6E49] font-medium">{t.landing.tickerDistrictsNote}</p>
              </div>

              <div className="p-3 space-y-0.5 md:pl-6">
                <p className="text-2xl sm:text-3xl font-bold text-[#201C18] tracking-tight font-heading">48</p>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">{t.landing.tickerLabsLabel}</p>
                <p className="text-[11px] text-slate-600 font-medium">{t.landing.tickerLabsNote}</p>
              </div>

              <div className="p-3 space-y-0.5 md:pl-6">
                <p className="text-2xl sm:text-3xl font-bold text-[#201C18] tracking-tight font-heading">{liveTickerStats.verificationRate}%</p>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">{t.landing.tickerAuditLabel}</p>
                <p className="text-[11px] text-[#2C6E49] font-medium">{t.landing.tickerAuditNote}</p>
              </div>

              <div className="p-3 space-y-0.5 md:pl-6">
                <p className="text-2xl sm:text-3xl font-bold text-[#201C18] tracking-tight font-heading">14 Days</p>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">{t.landing.tickerResolutionLabel}</p>
                <p className="text-[11px] text-[#2C6E49] font-medium">{t.landing.tickerResolutionNote}</p>
              </div>

            </div>

          </div>
        </section>

        {/* 3. Role Portals Gateway Tree Diagram */}
        <section id="role-gateways" className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-[#2C6E49] uppercase tracking-wider block">
              {t.landing.portalSectionBadge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-[#201C18]">
              {t.landing.portalSectionTitle}
            </h2>
          </div>

          {/* Tree Diagram */}
          <div className="flex flex-col items-center">

            {/* Root Hub Node */}
            <div className="bg-white border-2 border-[#2C6E49] text-[#201C18] px-8 py-3 rounded-2xl shadow-sm flex items-center justify-center relative z-10">
              <p className="font-black text-base font-heading tracking-tight text-[#201C18]">{t.landing.portalRootLabel}</p>
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
                      <span className="text-[10px] font-bold text-[#4A433B] bg-[#FAF8F4] px-2 py-0.5 rounded-full border border-[#E4DDD1]">{t.landing.govTag}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black font-heading text-[#201C18] group-hover:text-[#1D4ED8] transition-colors leading-tight">{t.landing.govTitle}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{t.landing.govDesc}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] font-extrabold text-[#1D4ED8] group-hover:translate-x-1 transition-transform">
                      <span>{t.landing.portalEnter}</span>
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
                      <span className="text-[10px] font-bold text-[#4A433B] bg-[#FAF8F4] px-2 py-0.5 rounded-full border border-[#E4DDD1]">{t.landing.uniTag}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black font-heading text-[#201C18] group-hover:text-purple-600 transition-colors leading-tight">{t.landing.uniTitle}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{t.landing.uniDesc}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] font-extrabold text-purple-600 group-hover:translate-x-1 transition-transform">
                      <span>{t.landing.portalEnter}</span>
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
                      <span className="text-[10px] font-bold text-[#4A433B] bg-[#FAF8F4] px-2 py-0.5 rounded-full border border-[#E4DDD1]">{t.landing.industryTag}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black font-heading text-[#201C18] group-hover:text-[#C98A2C] transition-colors leading-tight">{t.landing.industryTitle}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{t.landing.industryDesc}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] font-extrabold text-[#C98A2C] group-hover:translate-x-1 transition-transform">
                      <span>{t.landing.portalEnter}</span>
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
                      <span className="text-[10px] font-bold text-[#4A433B] bg-[#FAF8F4] px-2 py-0.5 rounded-full border border-[#E4DDD1]">{t.landing.citizenTag}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black font-heading text-[#201C18] group-hover:text-[#2C6E49] transition-colors leading-tight">{t.landing.citizenTitle}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{t.landing.citizenDesc}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] font-extrabold text-[#2C6E49] group-hover:translate-x-1 transition-transform">
                      <span>{t.landing.citizenReport}</span>
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
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#201C18]">{t.landing.lifecycleTitle}</h2>
            </div>
            <div className="px-3.5 py-1.5 bg-[#2C6E49]/10 text-[#2C6E49] border border-[#2C6E49]/30 rounded-xl text-xs font-mono font-bold shrink-0 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#2C6E49]"></span>
              <span>{t.landing.lifecycleAuditTrail}</span>
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
                      {mp.stages.length} {t.landing.lifecycleConnectedStages}
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
              {t.landing.uniSectionBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#201C18]">
              {t.landing.uniSectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t.landing.uniSectionSubtitle}
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
                  <strong>{t.landing.uniFocusArea}</strong> {u.domain}
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
                  {t.landing.impactBadge}
                </span>
                <h2 className="text-[#201C18] text-3xl font-bold tracking-tight font-heading">
                  {t.landing.impactTitle}
                </h2>
                <p className="text-slate-600 text-base max-w-2xl mt-2">
                  {t.landing.impactSubtitle}
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-[#FAF8F4] rounded-xl border border-[#E4DDD1] p-5 space-y-2">
                  <span className="text-slate-500 text-sm font-medium block">{t.landing.impactGeotaggedLabel}</span>
                  <p className="text-[#201C18] font-extrabold text-3xl font-heading">{t.landing.impactGeotaggedValue}</p>
                  <span className="text-[#2C6E49] text-xs font-bold block">{t.landing.impactGeotaggedNote}</span>
                </div>

                <div className="bg-[#FAF8F4] rounded-xl border border-[#E4DDD1] p-5 space-y-2">
                  <span className="text-slate-500 text-sm font-medium block">{t.landing.impactDistrictsLabel}</span>
                  <p className="text-[#201C18] font-extrabold text-3xl font-heading">{t.landing.impactDistrictsValue}</p>
                  <span className="text-[#2C6E49] text-xs font-bold block">{t.landing.impactDistrictsNote}</span>
                </div>

                <div className="bg-[#FAF8F4] rounded-xl border border-[#E4DDD1] p-5 space-y-2">
                  <span className="text-slate-500 text-sm font-medium block">{t.landing.impactRewardsLabel}</span>
                  <p className="text-[#201C18] font-extrabold text-3xl font-heading">{t.landing.impactRewardsValue}</p>
                  <span className="text-[#2C6E49] text-xs font-bold block">{t.landing.impactRewardsNote}</span>
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
                {t.landing.footerTagline}
              </p>
              <p className="text-xs text-slate-400">
                {t.landing.footerDept}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[#C98A2C] font-extrabold text-xs tracking-wider uppercase block">
                {t.landing.footerRoleEntrances}
              </span>
              <ul className="space-y-2 text-sm">
                <li><button onClick={onOpenAuth} className="text-slate-300 hover:text-white transition-colors cursor-pointer">{t.landing.footerGovPortal}</button></li>
                <li><button onClick={onOpenAuth} className="text-slate-300 hover:text-white transition-colors cursor-pointer">{t.landing.footerUniPortal}</button></li>
                <li><button onClick={onOpenAuth} className="text-slate-300 hover:text-white transition-colors cursor-pointer">{t.landing.footerIndustryPortal}</button></li>
                <li><button onClick={onOpenAuth} className="text-slate-300 hover:text-white transition-colors cursor-pointer">{t.landing.footerCitizenPortal}</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[#C98A2C] font-extrabold text-xs tracking-wider uppercase block">
                {t.landing.footerDomains}
              </span>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>{t.landing.footerDomain1}</li>
                <li>{t.landing.footerDomain2}</li>
                <li>{t.landing.footerDomain3}</li>
                <li>{t.landing.footerDomain4}</li>
                <li>{t.landing.footerDomain5}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[#C98A2C] font-extrabold text-xs tracking-wider uppercase block">
                {t.landing.footerHelplines}
              </span>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>{t.landing.footerEmergency}</li>
                <li>{t.landing.footerDisasterCell}</li>
                <li>{t.landing.footerHigherEdDept}</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-[#3D4550] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <span>{t.landing.footerCopyright}</span>
            <span className="font-mono text-xs text-slate-300">NIVAARAN Platform v2.0 • SIH 26043</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
