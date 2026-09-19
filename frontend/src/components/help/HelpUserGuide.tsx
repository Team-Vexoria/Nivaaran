import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, FileText, AlertTriangle, ChevronDown,
  Bell, User, ShieldCheck, HelpCircle, Phone, Mail,
  Building2, Sparkles, LifeBuoy,
  Lock, Camera, Check, X, Award,
  Send, ShieldAlert, MessageSquare, Globe
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getHelpTranslations } from '../../i18n/helpGuideTranslations';
import { JHARKHAND_LANGUAGES, SupportedLanguage } from '../../i18n/translations';

interface HelpUserGuideProps {
  onNavigateHome?: () => void;
  onNavigateLandingPage?: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenReportModal?: () => void;
  onOpenTracking?: (reportId?: string) => void;
  onOpenAuth?: () => void;
}

export const HelpUserGuide: React.FC<HelpUserGuideProps> = ({
  onNavigateHome,
  onNavigateLandingPage,
  onNavigateTab,
  onOpenReportModal,
  onOpenTracking,
  onOpenAuth,
}) => {
  const { currentLang, setLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Multilingual translations for Help & User Guide
  const ht = useMemo(() => getHelpTranslations(currentLang), [currentLang]);
  const currentLangMeta = useMemo(() => {
    return JHARKHAND_LANGUAGES.find(l => l.code === currentLang) || JHARKHAND_LANGUAGES[0];
  }, [currentLang]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReturnToLanding = () => {
    if (onNavigateLandingPage) {
      onNavigateLandingPage();
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('portal');
    url.searchParams.delete('tab');
    url.searchParams.set('view', 'landing');
    window.history.pushState({ view: 'landing' }, '', url.toString());
    window.dispatchEvent(new Event('popstate'));
    window.dispatchEvent(new CustomEvent('nivaaran_navigate_landing'));
  };

  const scrollToSection = (id: string) => {
    if (searchQuery.trim()) {
      setSearchQuery('');
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // FAQs from active language
  const faqs = ht.sectionI.faqs;

  // Filter FAQs and sections by search query
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase().trim();
    return faqs.filter(f => 
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

  const matchesSearch = (text: string): boolean => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackText('');
      setFeedbackSent(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#201C18] flex flex-col font-sans antialiased selection:bg-[#2C6E49] selection:text-white">
      
      {/* ── Top Header Strip / Breadcrumb ── */}
      <div className="bg-white border-b border-[#E4DDD1] px-4 sm:px-8 py-3 relative z-20 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            <button
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                else if (onNavigateTab) onNavigateTab('home');
                else window.history.back();
              }}
              className="px-3 py-1.5 bg-[#FAF8F4] hover:bg-[#EAE4D8] border border-[#E4DDD1] rounded-xl text-xs font-bold text-[#4A433B] hover:text-[#201C18] transition-colors flex items-center space-x-1.5 cursor-pointer active:scale-95 shadow-2xs"
              title="Return to previous dashboard"
            >
              <span>←</span>
              <span>{ht.nav.backToDashboard}</span>
            </button>

            <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-[#E4DDD1]">
              <div className="w-8 h-8 rounded-xl bg-[#2C6E49]/10 border border-[#2C6E49]/30 flex items-center justify-center text-[#2C6E49]">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-[#2C6E49] uppercase tracking-wider block leading-none">
                  {ht.nav.supportCentre}
                </span>
                <span className="text-[10px] text-[#6A6155] font-semibold">
                  {ht.nav.supportSubtitle}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Direct Language Switcher within Guide */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center space-x-1.5 bg-[#FAF8F4] hover:bg-[#EAE4D8] border border-[#E4DDD1] px-2.5 py-1 rounded-xl text-xs font-bold text-[#201C18] cursor-pointer shadow-2xs transition-colors"
                title="Change Language for User Guide"
              >
                <Globe className="w-3.5 h-3.5 text-[#2C6E49] shrink-0" />
                <span>{currentLangMeta.nativeName}</span>
                <ChevronDown className={`w-3 h-3 text-[#6A6155] transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white border border-[#E4DDD1] rounded-2xl shadow-xl py-2 z-50 max-h-72 overflow-y-auto">
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#8A7F72] border-b border-[#F0EBE0]">
                    Jharkhand Official Regional Languages
                  </div>
                  {JHARKHAND_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as SupportedLanguage);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        currentLang === lang.code 
                          ? 'bg-[#2C6E49]/10 text-[#2C6E49] font-bold' 
                          : 'text-[#201C18] hover:bg-[#FAF8F4] hover:text-[#2C6E49]'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] text-[#9A9084]">{lang.region}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-bold text-[#2C6E49] bg-[#2C6E49]/10 border border-[#2C6E49]/20 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              <span>{ht.nav.verifiedGovGuide}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Hero / Page Header ── */}
      <div className="bg-gradient-to-b from-white via-[#FAF8F4] to-[#F5EFEB] border-b border-[#E4DDD1] px-4 sm:px-8 py-10 sm:py-14 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FFF8EC] border border-[#F0D99A] text-[#C98A2C] rounded-full text-xs font-extrabold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{ht.hero.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-heading text-[#201C18] tracking-tight">
            {ht.hero.title}
          </h1>
          <p className="text-sm sm:text-base text-[#5A5247] max-w-2xl mx-auto leading-relaxed font-medium">
            {ht.hero.subtitle}
          </p>

          {/* ── Section 4: Search Help Field ── */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-[#8A7F72] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={ht.hero.searchPlaceholder}
                className="w-full pl-12 pr-10 py-3.5 bg-white border-2 border-[#E4DDD1] focus:border-[#2C6E49] focus:outline-none rounded-2xl text-xs sm:text-sm text-[#201C18] placeholder-[#8A7F72] shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A7F72] hover:text-[#201C18] p-1 rounded-lg cursor-pointer"
                  title={ht.hero.clearSearch}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="flex items-center justify-between text-xs text-[#6A6155] px-2 pt-2">
                <span>
                  {ht.hero.filteringBy} <strong className="text-[#201C18]">"{searchQuery}"</strong>
                </span>
                <span>
                  {filteredFaqs.length} {ht.hero.faqsMatched}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 5: Quick Help Cards (Jump directly to key tasks) ── */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 -mt-6 z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          
          <button
            onClick={() => scrollToSection('section-report')}
            className="p-4 bg-white border border-[#E4DDD1] hover:border-[#2C6E49] rounded-2xl text-left shadow-xs hover:shadow-md transition-all group cursor-pointer active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#2C6E49] flex items-center justify-center font-bold mb-2 group-hover:bg-[#2C6E49] group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-[#201C18] group-hover:text-[#2C6E49] transition-colors font-heading">
              {ht.quickCards.reportTitle}
            </h4>
            <p className="text-[11px] text-[#6A6155] mt-1 leading-snug line-clamp-2">
              {ht.quickCards.reportDesc}
            </p>
          </button>

          <button
            onClick={() => scrollToSection('section-track')}
            className="p-4 bg-white border border-[#E4DDD1] hover:border-[#2C6E49] rounded-2xl text-left shadow-xs hover:shadow-md transition-all group cursor-pointer active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-2 group-hover:bg-blue-700 group-hover:text-white transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-[#201C18] group-hover:text-[#2C6E49] transition-colors font-heading">
              {ht.quickCards.trackTitle}
            </h4>
            <p className="text-[11px] text-[#6A6155] mt-1 leading-snug line-clamp-2">
              {ht.quickCards.trackDesc}
            </p>
          </button>

          <button
            onClick={() => scrollToSection('section-notifications')}
            className="p-4 bg-white border border-[#E4DDD1] hover:border-[#2C6E49] rounded-2xl text-left shadow-xs hover:shadow-md transition-all group cursor-pointer active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#C98A2C] flex items-center justify-center font-bold mb-2 group-hover:bg-[#C98A2C] group-hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-[#201C18] group-hover:text-[#2C6E49] transition-colors font-heading">
              {ht.quickCards.notifTitle}
            </h4>
            <p className="text-[11px] text-[#6A6155] mt-1 leading-snug line-clamp-2">
              {ht.quickCards.notifDesc}
            </p>
          </button>

          <button
            onClick={() => scrollToSection('section-profile')}
            className="p-4 bg-white border border-[#E4DDD1] hover:border-[#2C6E49] rounded-2xl text-left shadow-xs hover:shadow-md transition-all group cursor-pointer active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-2 group-hover:bg-purple-700 group-hover:text-white transition-colors">
              <User className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-[#201C18] group-hover:text-[#2C6E49] transition-colors font-heading">
              {ht.quickCards.profileTitle}
            </h4>
            <p className="text-[11px] text-[#6A6155] mt-1 leading-snug line-clamp-2">
              {ht.quickCards.profileDesc}
            </p>
          </button>

          <button
            onClick={() => scrollToSection('section-faqs')}
            className="p-4 bg-white border border-[#E4DDD1] hover:border-[#2C6E49] rounded-2xl text-left shadow-xs hover:shadow-md transition-all group cursor-pointer active:scale-95 col-span-2 sm:col-span-1"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-2 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-[#201C18] group-hover:text-[#2C6E49] transition-colors font-heading">
              {ht.quickCards.faqsTitle}
            </h4>
            <p className="text-[11px] text-[#6A6155] mt-1 leading-snug line-clamp-2">
              {ht.quickCards.faqsDesc}
            </p>
          </button>

        </div>
      </div>

      {/* ── Main Documentation Content Stream ── */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-10 space-y-12">

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION A: GETTING STARTED
           ══════════════════════════════════════════════════════════════════════ */}
        {matchesSearch('getting started account navigation overview nivaaran शुरुआत परिचय') && (
          <section id="section-getting-started" className="space-y-4 scroll-mt-24">
            <div className="flex items-center space-x-2 border-b border-[#E4DDD1] pb-3">
              <Sparkles className="w-5 h-5 text-[#2C6E49]" />
              <h2 className="text-lg sm:text-xl font-black text-[#201C18] font-heading">
                {ht.sectionA.heading}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#2C6E49] text-xs font-black flex items-center justify-center">1</span>
                  <h3 className="font-extrabold text-sm text-[#201C18]">{ht.sectionA.q1Title}</h3>
                </div>
                <p className="text-xs text-[#5A5247] leading-relaxed">
                  {ht.sectionA.q1Desc}
                </p>
              </div>

              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#2C6E49] text-xs font-black flex items-center justify-center">2</span>
                  <h3 className="font-extrabold text-sm text-[#201C18]">{ht.sectionA.q2Title}</h3>
                </div>
                <ul className="text-xs text-[#5A5247] space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li><strong className="text-[#201C18]">{ht.sectionA.q2Citizens.split(':')[0]}:</strong>{ht.sectionA.q2Citizens.split(':')[1] || ht.sectionA.q2Citizens}</li>
                  <li><strong className="text-[#201C18]">{ht.sectionA.q2Gov.split(':')[0]}:</strong>{ht.sectionA.q2Gov.split(':')[1] || ht.sectionA.q2Gov}</li>
                  <li><strong className="text-[#201C18]">{ht.sectionA.q2Univ.split(':')[0]}:</strong>{ht.sectionA.q2Univ.split(':')[1] || ht.sectionA.q2Univ}</li>
                  <li><strong className="text-[#201C18]">{ht.sectionA.q2Csr.split(':')[0]}:</strong>{ht.sectionA.q2Csr.split(':')[1] || ht.sectionA.q2Csr}</li>
                </ul>
              </div>

              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#2C6E49] text-xs font-black flex items-center justify-center">3</span>
                  <h3 className="font-extrabold text-sm text-[#201C18]">{ht.sectionA.q3Title}</h3>
                </div>
                <p className="text-xs text-[#5A5247] leading-relaxed">
                  {ht.sectionA.q3Desc}
                </p>
              </div>

              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#2C6E49] text-xs font-black flex items-center justify-center">4</span>
                  <h3 className="font-extrabold text-sm text-[#201C18]">{ht.sectionA.q4Title}</h3>
                </div>
                <p className="text-xs text-[#5A5247] leading-relaxed">
                  {ht.sectionA.q4Desc}
                </p>
              </div>

            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION B: REPORT A CIVIC ISSUE
           ══════════════════════════════════════════════════════════════════════ */}
        {matchesSearch('report issue civic category location evidence complaint समस्या दर्ज') && (
          <section id="section-report" className="space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#2C6E49]" />
                <h2 className="text-lg sm:text-xl font-black text-[#201C18] font-heading">
                  {ht.sectionB.heading}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('my-reports');
                    else if (onOpenAuth) onOpenAuth();
                    else handleReturnToLanding();
                  }}
                  className="hidden sm:inline-flex px-3 py-1.5 bg-white hover:bg-[#FAF8F4] border border-[#E4DDD1] text-[#201C18] text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                  title={ht.sectionB.btnMyReports}
                >
                  <span>{ht.sectionB.btnMyReports}</span>
                </button>
                <button
                  onClick={() => {
                    if (onOpenReportModal) onOpenReportModal();
                    else if (onOpenAuth) onOpenAuth();
                    else handleReturnToLanding();
                  }}
                  className="px-3.5 py-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                  title={ht.sectionB.btnReportNow}
                >
                  <span>{ht.sectionB.btnReportNow}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[#5A5247] leading-relaxed">
              {ht.sectionB.subtext}
            </p>

            {/* 8 Step-by-Step Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ht.sectionB.steps.map((s, idx) => (
                <div key={idx} className="bg-white border border-[#E4DDD1] rounded-2xl p-4 space-y-2 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#2C6E49] px-2 py-0.5 rounded">
                    {s.step}
                  </span>
                  <h4 className="font-extrabold text-xs text-[#201C18]">{s.title}</h4>
                  <p className="text-[11px] text-[#6A6155] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Guidelines Banner */}
            <div className="bg-[#FFF8EC] border border-[#F0D99A] rounded-2xl p-4 space-y-2 text-xs">
              <h4 className="font-black text-[#C98A2C] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#C98A2C]" />
                {ht.sectionB.guidelinesTitle}
              </h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-[#5A5247]">
                <div>
                  <strong className="text-[#201C18] block">{ht.sectionB.g1Title}</strong>
                  <span>{ht.sectionB.g1Desc}</span>
                </div>
                <div>
                  <strong className="text-[#201C18] block">{ht.sectionB.g2Title}</strong>
                  <span>{ht.sectionB.g2Desc}</span>
                </div>
                <div>
                  <strong className="text-[#201C18] block">{ht.sectionB.g3Title}</strong>
                  <span>{ht.sectionB.g3Desc}</span>
                </div>
                <div>
                  <strong className="text-[#201C18] block">{ht.sectionB.g4Title}</strong>
                  <span>{ht.sectionB.g4Desc}</span>
                </div>
              </div>
            </div>
          </section>
        )}


        {/* ══════════════════════════════════════════════════════════════════════
            SECTION C: TRACK YOUR COMPLAINT & STATUS MEANINGS
           ══════════════════════════════════════════════════════════════════════ */}
        {matchesSearch('track your complaint status review verified assigned in progress resolved rejected closed स्थिति ट्रैक') && (
        <section id="section-track" className="space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-3">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-[#2C6E49]" />
              <h2 className="text-lg sm:text-xl font-black text-[#201C18] font-heading">
                {ht.sectionC.heading}
              </h2>
            </div>
            <button
              onClick={() => {
                if (onOpenTracking) onOpenTracking();
                else handleReturnToLanding();
              }}
              className="px-3.5 py-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
              title={ht.sectionC.btnOpenTracker}
            >
              <span>{ht.sectionC.btnOpenTracker}</span>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-xs text-[#5A5247]">
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-4 space-y-2 shadow-2xs">
              <h4 className="font-black text-[#201C18] text-sm">{ht.sectionC.card1Title}</h4>
              <p className="leading-relaxed">
                {ht.sectionC.card1Desc}
              </p>
            </div>
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-4 space-y-2 shadow-2xs">
              <h4 className="font-black text-[#201C18] text-sm">{ht.sectionC.card2Title}</h4>
              <p className="leading-relaxed">
                {ht.sectionC.card2Desc}
              </p>
            </div>
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-4 space-y-2 shadow-2xs">
              <h4 className="font-black text-[#201C18] text-sm">{ht.sectionC.card3Title}</h4>
              <p className="leading-relaxed">
                {ht.sectionC.card3Desc}
              </p>
            </div>
          </div>

          {/* Status Dictionary Cards */}
          <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-3 shadow-2xs">
            <h3 className="font-black text-sm text-[#201C18] uppercase tracking-wider font-heading">
              {ht.sectionC.dictTitle}
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              
              <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl flex items-start space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                <div>
                  <strong className="text-[#201C18] block text-xs">{ht.sectionC.statuses.submitted.name}</strong>
                  <span className="text-[#6A6155] text-[11px] leading-relaxed">
                    {ht.sectionC.statuses.submitted.desc}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl flex items-start space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                <div>
                  <strong className="text-[#201C18] block text-xs">{ht.sectionC.statuses.underReview.name}</strong>
                  <span className="text-[#6A6155] text-[11px] leading-relaxed">
                    {ht.sectionC.statuses.underReview.desc}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl flex items-start space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0"></span>
                <div>
                  <strong className="text-[#201C18] block text-xs">{ht.sectionC.statuses.verified.name}</strong>
                  <span className="text-[#6A6155] text-[11px] leading-relaxed">
                    {ht.sectionC.statuses.verified.desc}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl flex items-start space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 mt-1 shrink-0"></span>
                <div>
                  <strong className="text-[#201C18] block text-xs">{ht.sectionC.statuses.assigned.name}</strong>
                  <span className="text-[#6A6155] text-[11px] leading-relaxed">
                    {ht.sectionC.statuses.assigned.desc}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl flex items-start space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1 shrink-0"></span>
                <div>
                  <strong className="text-[#201C18] block text-xs">{ht.sectionC.statuses.inProgress.name}</strong>
                  <span className="text-[#6A6155] text-[11px] leading-relaxed">
                    {ht.sectionC.statuses.inProgress.desc}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl flex items-start space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2C6E49] mt-1 shrink-0"></span>
                <div>
                  <strong className="text-[#201C18] block text-xs">{ht.sectionC.statuses.resolved.name}</strong>
                  <span className="text-[#6A6155] text-[11px] leading-relaxed">
                    {ht.sectionC.statuses.resolved.desc}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl flex items-start space-x-2.5 sm:col-span-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shrink-0"></span>
                <div>
                  <strong className="text-[#201C18] block text-xs">{ht.sectionC.statuses.rejected.name}</strong>
                  <span className="text-[#6A6155] text-[11px] leading-relaxed">
                    {ht.sectionC.statuses.rejected.desc}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>
        )}


        {/* ══════════════════════════════════════════════════════════════════════
            SECTION D & E: NOTIFICATIONS & PROFILE MANAGEMENT
           ══════════════════════════════════════════════════════════════════════ */}
        {matchesSearch('notifications profile manage account settings personal photo सूचनाएं प्रोफ़ाइल') && (
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Section D: Notifications */}
          <section id="section-notifications" className="space-y-3 scroll-mt-24">
            <div className="flex items-center space-x-2 border-b border-[#E4DDD1] pb-2">
              <Bell className="w-5 h-5 text-[#2C6E49]" />
              <h2 className="text-base sm:text-lg font-black text-[#201C18] font-heading">
                {ht.sectionD.heading}
              </h2>
            </div>
            
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-3 text-xs shadow-2xs text-[#5A5247]">
              <p className="leading-relaxed">
                {ht.sectionD.intro}
              </p>
              <ul className="space-y-2 list-disc pl-4">
                <li><strong className="text-[#201C18]">{ht.sectionD.b1Title}</strong> {ht.sectionD.b1Desc}</li>
                <li><strong className="text-[#201C18]">{ht.sectionD.b2Title}</strong> {ht.sectionD.b2Desc}</li>
                <li><strong className="text-[#201C18]">{ht.sectionD.b3Title}</strong> {ht.sectionD.b3Desc}</li>
                <li><strong className="text-[#201C18]">{ht.sectionD.b4Title}</strong> {ht.sectionD.b4Desc}</li>
              </ul>
            </div>
          </section>

          {/* Section E: Profile */}
          <section id="section-profile" className="space-y-3 scroll-mt-24">
            <div className="flex items-center space-x-2 border-b border-[#E4DDD1] pb-2">
              <User className="w-5 h-5 text-[#2C6E49]" />
              <h2 className="text-base sm:text-lg font-black text-[#201C18] font-heading">
                {ht.sectionE.heading}
              </h2>
            </div>

            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-3 text-xs shadow-2xs text-[#5A5247]">
              <p className="leading-relaxed">
                {ht.sectionE.intro}
              </p>
              <ul className="space-y-2 list-disc pl-4">
                <li><strong className="text-[#201C18]">{ht.sectionE.b1Title}</strong> {ht.sectionE.b1Desc}</li>
                <li><strong className="text-[#201C18]">{ht.sectionE.b2Title}</strong> {ht.sectionE.b2Desc}</li>
                <li><strong className="text-[#201C18]">{ht.sectionE.b3Title}</strong> {ht.sectionE.b3Desc}</li>
                <li><strong className="text-[#201C18]">{ht.sectionE.b4Title}</strong> {ht.sectionE.b4Desc}</li>
              </ul>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('profile');
                    else if (onOpenAuth) onOpenAuth();
                    else handleReturnToLanding();
                  }}
                  className="px-3.5 py-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                  title={ht.sectionE.btnGoProfile}
                >
                  <span>{ht.sectionE.btnGoProfile}</span>
                </button>
              </div>
            </div>
          </section>

        </div>
        )}


        {/* ══════════════════════════════════════════════════════════════════════
            SECTION F & G: EVIDENCE UPLOAD & GOVT RESOLUTION
           ══════════════════════════════════════════════════════════════════════ */}
        {matchesSearch('evidence upload photo video audio format limits government official response resolution साक्ष्य सरकारी') && (
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Section F: Evidence Upload */}
          <section id="section-evidence" className="space-y-3 scroll-mt-24">
            <div className="flex items-center space-x-2 border-b border-[#E4DDD1] pb-2">
              <Camera className="w-5 h-5 text-[#2C6E49]" />
              <h2 className="text-base sm:text-lg font-black text-[#201C18] font-heading">
                {ht.sectionF.heading}
              </h2>
            </div>

            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-3 text-xs shadow-2xs text-[#5A5247]">
              <p className="leading-relaxed">
                {ht.sectionF.intro}
              </p>
              <div className="space-y-2">
                <div className="p-2.5 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl">
                  <strong className="text-[#201C18] block">{ht.sectionF.f1Title}</strong>
                  <span className="text-[11px] text-[#6A6155]">{ht.sectionF.f1Desc}</span>
                </div>
                <div className="p-2.5 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl">
                  <strong className="text-[#201C18] block">{ht.sectionF.f2Title}</strong>
                  <span className="text-[11px] text-[#6A6155]">{ht.sectionF.f2Desc}</span>
                </div>
                <div className="p-2.5 bg-[#FFF8EC] border border-[#F0D99A] rounded-xl text-[#C98A2C]">
                  <strong className="block font-bold">{ht.sectionF.f3Title}</strong>
                  <span className="text-[11px]">{ht.sectionF.f3Desc}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section G: Govt Response & Resolution */}
          <section id="section-resolution" className="space-y-3 scroll-mt-24">
            <div className="flex items-center space-x-2 border-b border-[#E4DDD1] pb-2">
              <Award className="w-5 h-5 text-[#2C6E49]" />
              <h2 className="text-base sm:text-lg font-black text-[#201C18] font-heading">
                {ht.sectionG.heading}
              </h2>
            </div>

            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-3 text-xs shadow-2xs text-[#5A5247]">
              <p className="leading-relaxed">
                {ht.sectionG.intro}
              </p>
              <ul className="space-y-2 list-disc pl-4">
                <li><strong className="text-[#201C18]">{ht.sectionG.b1Title}</strong> {ht.sectionG.b1Desc}</li>
                <li><strong className="text-[#201C18]">{ht.sectionG.b2Title}</strong> {ht.sectionG.b2Desc}</li>
                <li><strong className="text-[#201C18]">{ht.sectionG.b3Title}</strong> {ht.sectionG.b3Desc}</li>
                <li><strong className="text-[#201C18]">{ht.sectionG.b4Title}</strong> {ht.sectionG.b4Desc}</li>
              </ul>
            </div>
          </section>

        </div>
        )}


        {/* ══════════════════════════════════════════════════════════════════════
            SECTION H: SAFETY & PRIVACY
           ══════════════════════════════════════════════════════════════════════ */}
        {matchesSearch('safety privacy passwords fraud guidelines सुरक्षा गोपनीयता नियम') && (
        <section id="section-safety" className="space-y-3 scroll-mt-24">
          <div className="flex items-center space-x-2 border-b border-[#E4DDD1] pb-2">
            <Lock className="w-5 h-5 text-[#2C6E49]" />
            <h2 className="text-base sm:text-lg font-black text-[#201C18] font-heading">
              {ht.sectionH.heading}
            </h2>
          </div>

          <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              
              <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl space-y-1">
                <div className="flex items-center space-x-2 text-[#B5502D]">
                  <Lock className="w-4 h-4" />
                  <strong className="font-extrabold text-[#201C18]">{ht.sectionH.c1Title}</strong>
                </div>
                <p className="text-[11px] text-[#6A6155] leading-relaxed">
                  {ht.sectionH.c1Desc}
                </p>
              </div>

              <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl space-y-1">
                <div className="flex items-center space-x-2 text-[#2C6E49]">
                  <ShieldCheck className="w-4 h-4" />
                  <strong className="font-extrabold text-[#201C18]">{ht.sectionH.c2Title}</strong>
                </div>
                <p className="text-[11px] text-[#6A6155] leading-relaxed">
                  {ht.sectionH.c2Desc}
                </p>
              </div>

              <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl space-y-1">
                <div className="flex items-center space-x-2 text-[#C98A2C]">
                  <AlertTriangle className="w-4 h-4" />
                  <strong className="font-extrabold text-[#201C18]">{ht.sectionH.c3Title}</strong>
                </div>
                <p className="text-[11px] text-[#6A6155] leading-relaxed">
                  {ht.sectionH.c3Desc}
                </p>
              </div>

            </div>
          </div>
        </section>
        )}


        {/* ══════════════════════════════════════════════════════════════════════
            SECTION I: FREQUENTLY ASKED QUESTIONS (EXPANDABLE ACCORDION)
           ══════════════════════════════════════════════════════════════════════ */}
        <section id="section-faqs" className="space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-[#2C6E49]" />
              <h2 className="text-lg sm:text-xl font-black text-[#201C18] font-heading">
                {ht.sectionI.heading}
              </h2>
            </div>
            <span className="text-xs text-[#6A6155] font-bold">
              {ht.sectionI.showingFaqs.replace('{count}', filteredFaqs.length.toString()).replace('{total}', faqs.length.toString())}
            </span>
          </div>

          <div className="space-y-2.5">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#E4DDD1] rounded-2xl space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-xs text-[#201C18]">{ht.sectionI.noFaqsMatch}</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-[#2C6E49] hover:underline cursor-pointer"
                >
                  {ht.sectionI.clearFilter}
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={faq.id}
                    className={`bg-white border rounded-2xl transition-all shadow-2xs overflow-hidden ${
                      isOpen ? 'border-[#2C6E49] ring-1 ring-[#2C6E49]/20' : 'border-[#E4DDD1] hover:border-[#C4BDB0]'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span className="font-extrabold text-xs sm:text-sm text-[#201C18] flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#EAE4D8] text-[#5A5247] text-[10px] font-black flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        {faq.question}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[#8A7F72] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2C6E49]' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-4 pt-1 text-xs text-[#5A5247] leading-relaxed border-t border-[#F0EBE0] bg-[#FAF8F4]/50">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════════════
            SECTION J: CONTACT / GET SUPPORT ("Need More Help?" Card)
           ══════════════════════════════════════════════════════════════════════ */}
        {matchesSearch('contact support help phone helpline email technical issue सहायता संपर्क') && (
        <section id="section-contact" className="space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-3">
            <div className="flex items-center space-x-2">
              <LifeBuoy className="w-5 h-5 text-[#2C6E49]" />
              <h2 className="text-lg sm:text-xl font-black text-[#201C18] font-heading">
                {ht.sectionJ.heading}
              </h2>
            </div>
            <button
              onClick={() => {
                if (onOpenAuth) onOpenAuth();
                else handleReturnToLanding();
              }}
              className="px-3.5 py-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
              title={ht.sectionJ.btnAuth}
            >
              <span>{ht.sectionJ.btnAuth}</span>
            </button>
          </div>

          <div className="bg-gradient-to-br from-white via-[#FAF8F4] to-[#F5EFEB] border-2 border-[#E4DDD1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#2C6E49]/10 text-[#2C6E49] px-2.5 py-0.5 rounded-full">
                {ht.sectionJ.deptBadge}
              </span>
              <h3 className="text-xl font-black text-[#201C18] mt-2 font-heading">
                {ht.sectionJ.title}
              </h3>
              <p className="text-xs text-[#5A5247] mt-1 leading-relaxed">
                {ht.sectionJ.subtitle}
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              
              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#2C6E49] flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-[#201C18]">{ht.sectionJ.h1Title}</h4>
                <p className="text-[11px] text-[#6A6155] leading-relaxed">
                  {ht.sectionJ.h1Desc}
                </p>
                <div className="pt-1">
                  <a href="tel:1070" className="font-mono font-black text-[#2C6E49] hover:underline block text-sm">
                    1070 / 181
                  </a>
                  <span className="text-[10px] text-slate-400">{ht.sectionJ.h1Note}</span>
                </div>
              </div>

              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-[#201C18]">{ht.sectionJ.h2Title}</h4>
                <p className="text-[11px] text-[#6A6155] leading-relaxed">
                  {ht.sectionJ.h2Desc}
                </p>
                <div className="pt-1">
                  <span className="font-mono font-bold text-[#201C18] block text-[11px] truncate">
                    support@nivaaran.jharkhand.gov.in
                  </span>
                  <span className="text-[10px] text-slate-400">{ht.sectionJ.h2Note}</span>
                </div>
              </div>

              <div className="bg-white border border-[#E4DDD1] rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#C98A2C] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-[#201C18]">{ht.sectionJ.h3Title}</h4>
                <p className="text-[11px] text-[#6A6155] leading-relaxed">
                  {ht.sectionJ.h3Desc}
                </p>
                <div className="pt-1">
                  <span className="font-bold text-[#201C18] block text-[11px]">
                    Collectorate Building, Ranchi / District HQ
                  </span>
                  <span className="text-[10px] text-slate-400">{ht.sectionJ.h3Note}</span>
                </div>
              </div>

            </div>

            {/* Quick Feedback Form inside Support Card */}
            <div className="border-t border-[#E4DDD1] pt-5">
              <form onSubmit={handleSendFeedback} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#201C18] flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#2C6E49]" />
                    <span>{ht.sectionJ.feedbackLabel}</span>
                  </label>
                  {feedbackSent && (
                    <span className="text-xs font-bold text-[#2C6E49] flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Check className="w-3.5 h-3.5" />
                      <span>{ht.sectionJ.feedbackSuccess}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={ht.sectionJ.feedbackPlaceholder}
                    className="flex-1 px-4 py-2.5 bg-white border border-[#E4DDD1] rounded-xl text-xs text-[#201C18] focus:outline-none focus:border-[#2C6E49]"
                  />
                  <button
                    type="submit"
                    disabled={!feedbackText.trim()}
                    className="px-5 py-2.5 bg-[#2C6E49] hover:bg-[#23583a] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-2xs transition-all shrink-0 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{ht.sectionJ.feedbackSubmit}</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        </section>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-[#E4DDD1] bg-white py-6 px-4 text-center text-xs text-[#6A6155]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Nivaaran Logo" className="h-6 w-auto object-contain" />
            <span className="font-extrabold text-[#201C18]">{ht.footer.title}</span>
            <span className="text-[#8A7F72]">· {ht.footer.subline}</span>
          </div>
          <p className="text-[11px]">
            {ht.footer.govtLine}
          </p>
        </div>
      </footer>

    </div>
  );
};
