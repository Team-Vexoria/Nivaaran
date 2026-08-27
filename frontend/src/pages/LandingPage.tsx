import React, { useState } from 'react';
import { 
  Camera, MapPin, ArrowRight, User, CheckCircle2, 
  ChevronRight, Building2, Cpu, ShieldCheck, Activity,
  Globe, ChevronDown
} from 'lucide-react';
import { QuickReportModal } from '../components/QuickReportModal';
import { 
  JHARKHAND_LANGUAGES, TRANSLATIONS, SupportedLanguage 
} from '../i18n/translations';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const currentLangObj = JHARKHAND_LANGUAGES.find(l => l.code === currentLang) || JHARKHAND_LANGUAGES[0];

  const currentChallenges = t.challenges || TRANSLATIONS.en.challenges;
  const currentHeis = t.heis || TRANSLATIONS.en.heis;

  const filteredChallenges = activeCategoryFilter === 'All'
    ? currentChallenges
    : currentChallenges.filter(c => c.category.toLowerCase().includes(activeCategoryFilter.toLowerCase()) || activeCategoryFilter === 'All');

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased selection:bg-slate-900 selection:text-white">
      
      {/* 1. Compact Single-Line Navbar (Clean & Height-Restricted) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Clean Title */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-base shadow-xs shrink-0">
              N
            </div>
            <span className="text-lg font-bold font-heading text-slate-900 tracking-tight whitespace-nowrap">
              NIVAARAN
            </span>
          </div>

          {/* Navigation Links (Single-Line Navbar Only) */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-slate-600 shrink-0">
            <a href="#featured-challenges" className="hover:text-slate-900 transition-colors whitespace-nowrap">{t.exploreChallenges}</a>
            <a href="#lifecycle-spotlight" className="hover:text-slate-900 transition-colors whitespace-nowrap">{t.lifecycle}</a>
            <a href="#institutions" className="hover:text-slate-900 transition-colors whitespace-nowrap">{t.universities}</a>
            <a href="#csr-marketplace" className="hover:text-slate-900 transition-colors whitespace-nowrap">{t.industryMarketplace}</a>
            <a href="#impact" className="hover:text-slate-900 transition-colors whitespace-nowrap">{t.impactLedger}</a>
          </nav>

          {/* Language Selector & Single-Line Action Buttons */}
          <div className="flex items-center space-x-2.5 shrink-0">
            
            {/* Jharkhand Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors whitespace-nowrap"
                title="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-medium whitespace-nowrap">{currentLangObj.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isLangDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 max-h-80 overflow-y-auto"
                  onMouseLeave={() => setIsLangDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Jharkhand Languages
                  </div>
                  {JHARKHAND_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        currentLang === lang.code ? 'bg-slate-50 text-slate-900 font-bold' : 'text-slate-600'
                      }`}
                    >
                      <div>
                        <span className="block whitespace-nowrap">{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400 block">{lang.region}</span>
                      </div>
                      {currentLang === lang.code && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Single Line Primary Action */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 whitespace-nowrap"
            >
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t.reportProblem}</span>
            </button>

            {/* Single Line Secondary Action */}
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center space-x-1.5 whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t.signIn}</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section (Responsive & Fully Readable) */}
      <main className="flex-1">
        <section className="pt-14 pb-12 px-6 border-b border-slate-200 bg-slate-50/50">
          <div className="max-w-5xl mx-auto text-center space-y-5">
            
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-heading text-slate-900 tracking-tight leading-[1.12] max-w-4xl mx-auto">
              {t.title}
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              {t.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center space-x-2.5 active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>{t.heroCtaPrimary}</span>
              </button>

              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm rounded-xl border border-slate-300 shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                <span>{t.heroCtaSecondary}</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Clean 4-Stat Metric Grid */}
            <div className="pt-8 max-w-4xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                
                <div className="p-4 text-center">
                  <span className="text-2xl font-black font-heading text-slate-900 block">24 / 24</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-1 leading-snug">{t.districtsCovered}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{t.districtsSub}</span>
                </div>

                <div className="p-4 text-center">
                  <span className="text-2xl font-black font-heading text-emerald-700 block">48+</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-1 leading-snug">{t.heiLabs}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{t.heiLabsSub}</span>
                </div>

                <div className="p-4 text-center">
                  <span className="text-2xl font-black font-heading text-slate-900 block">16 Stages</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-1 leading-snug">{t.lifecycleTitle}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{t.lifecycleSub}</span>
                </div>

                <div className="p-4 text-center">
                  <span className="text-2xl font-black font-heading text-slate-900 block">100%</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-1 leading-snug">{t.outcomesTitle}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{t.outcomesSub}</span>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 3. Live Incident & 16-Stage Spotlight Showcase */}
        <section id="lifecycle-spotlight" className="py-12 px-6 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                  <Activity className="w-4 h-4" />
                  <span>{t.spotlightBadge}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-slate-900">
                  {t.spotlightTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-1 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                  <span>{t.spotlightLocation}</span>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  {t.spotlightActiveStage}
                </span>
              </div>
            </div>

            {/* Structured Step Progress Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5">
              
              {/* 4 Major Lifecycle Phases Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="border-b-2 border-emerald-600 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{t.phase1Title}</span>
                  <span className="font-bold text-slate-900 block leading-snug">{t.phase1Sub}</span>
                  <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">{t.phase1Status}</span>
                </div>

                <div className="border-b-2 border-emerald-600 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{t.phase2Title}</span>
                  <span className="font-bold text-slate-900 block leading-snug">{t.phase2Sub}</span>
                  <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">{t.phase2Status}</span>
                </div>

                <div className="border-b-2 border-slate-300 pb-2 opacity-60">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{t.phase3Title}</span>
                  <span className="font-bold text-slate-900 block leading-snug">{t.phase3Sub}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{t.phase3Status}</span>
                </div>

                <div className="border-b-2 border-slate-300 pb-2 opacity-60">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{t.phase4Title}</span>
                  <span className="font-bold text-slate-900 block leading-snug">{t.phase4Sub}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{t.phase4Status}</span>
                </div>
              </div>

              {/* Progress Detail Table */}
              <div className="grid md:grid-cols-3 gap-4 text-xs pt-1">
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium block">{t.assignedUnitLabel}</span>
                  <p className="font-bold text-slate-900 text-sm">{t.assignedUnitName}</p>
                  <p className="text-[11px] text-slate-500">{t.assignedUnitDept}</p>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium block">{t.csrPartnerLabel}</span>
                  <p className="font-bold text-slate-900 text-sm">{t.csrPartnerName}</p>
                  <p className="text-[11px] text-slate-500">{t.csrPartnerGrant}</p>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium block">{t.beneficiariesLabel}</span>
                  <p className="font-bold text-emerald-700 text-sm">{t.beneficiariesCount}</p>
                  <p className="text-[11px] text-slate-500">{t.beneficiariesZone}</p>
                </div>
              </div>

              {/* Action Link */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-slate-200 gap-3">
                <span className="text-xs text-slate-500">
                  {t.spotlightAuditNote}
                </span>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  <span>{t.spotlightCta}</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* 4. Active Societal Challenges Grid */}
        <section id="featured-challenges" className="py-12 px-6 border-b border-slate-200 bg-slate-50/50">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.activeChallengesSub}</span>
                <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-slate-900">
                  {t.activeChallengesTitle}
                </h2>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 text-xs bg-white p-1 rounded-lg border border-slate-200">
                {[
                  { id: 'All', label: t.allFilter },
                  { id: 'Flooding', label: t.floodingFilter },
                  { id: 'Drought', label: t.droughtFilter },
                  { id: 'Mine Subsidence', label: t.mineSubsidenceFilter },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeCategoryFilter === cat.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Challenges Grid */}
            <div className="grid md:grid-cols-3 gap-5">
              {filteredChallenges.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {item.id}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" /> {item.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>{t.locationLabel}</span>
                      <span className="font-semibold text-slate-800 flex items-center truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 mr-1 text-amber-500 shrink-0" /> {item.district} ({item.block})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span>{t.matchedHeiLabel}</span>
                      <span className="font-semibold text-slate-900 text-right truncate max-w-[180px]">{item.matchedHEI}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span>{t.affectedPopLabel}</span>
                      <span className="font-bold text-slate-900">{item.peopleAffected}</span>
                    </div>

                    <button
                      onClick={onOpenAuth}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center space-x-1 mt-1"
                    >
                      <span>{t.viewTeamCta}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Higher Education Research Network */}
        <section id="institutions" className="py-12 px-6 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-1.5 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{t.heiBadge}</span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-slate-900">
                {t.heiTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.heiSubtitle}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentHeis.map((hei, i) => (
                <div key={i} className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-200 flex items-start space-x-3.5 shadow-xs">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {hei.name.substring(0, 3)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{hei.name}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{hei.focus}</p>
                    <span className="inline-block text-[10px] text-slate-400 font-mono mt-1">{hei.node}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Industry & CSR Marketplace */}
        <section id="csr-marketplace" className="py-12 px-6 border-b border-slate-200 bg-slate-50/50">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="text-center space-y-1.5 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.csrBadge}</span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-slate-900">
                {t.csrTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.csrSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-2">
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                <Building2 className="w-5 h-5 text-slate-700" />
                <h4 className="font-bold text-sm text-slate-900">{t.csrCard1Title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.csrCard1Desc}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                <Cpu className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-sm text-slate-900">{t.csrCard2Title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.csrCard2Desc}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                <ShieldCheck className="w-5 h-5 text-slate-700" />
                <h4 className="font-bold text-sm text-slate-900">{t.csrCard3Title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.csrCard3Desc}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Official Government Footer */}
      <footer className="bg-slate-900 text-slate-200 pt-12 pb-8 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid md:grid-cols-4 gap-8 text-xs text-slate-400">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-white text-slate-900 font-black rounded-lg flex items-center justify-center text-sm">N</div>
                <span className="font-bold text-base text-white font-heading">NIVAARAN</span>
              </div>
              <p className="leading-relaxed text-slate-400 text-xs">
                {t.footerAbout}
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">{t.footerRolePortals}</h5>
              <ul className="space-y-1.5">
                <li><button onClick={onOpenAuth} className="hover:text-white transition-colors">Citizen & Community Portal</button></li>
                <li><button onClick={onOpenAuth} className="hover:text-white transition-colors">Government Officer Portal</button></li>
                <li><button onClick={onOpenAuth} className="hover:text-white transition-colors">University & Academic Portal</button></li>
                <li><button onClick={onOpenAuth} className="hover:text-white transition-colors">Industry & CSR Marketplace</button></li>
                <li><button onClick={onOpenAuth} className="hover:text-white transition-colors">Platform Super Admin</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">{t.footerFocusAreas}</h5>
              <ul className="space-y-1.5">
                <li>• Flood & River Basin IoT Warning</li>
                <li>• Drought & Groundwater Depletion</li>
                <li>• Mine Subsidence & Geotechnical Stability</li>
                <li>• Forest & Industrial Fire Telemetry</li>
                <li>• Rural & Urban Critical Infrastructure</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">{t.footerHelplines}</h5>
              <p className="leading-relaxed text-slate-400">
                State Emergency Operations Centre: <strong>1070</strong><br />
                National Emergency Response: <strong>112</strong><br />
                Directorate of Higher & Technical Education, Nepal House, Doranda, Ranchi - 834002
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
            <span>{t.footerRights}</span>
            <span>{t.footerSecurity}</span>
          </div>
        </div>
      </footer>

      {/* Quick Report & Evidence Modal */}
      <QuickReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
