import React, { useState, useRef } from 'react';
import { 
  Home, FileText, MessageSquare, MessagesSquare, Trophy, 
  User, LogOut, Globe, ChevronDown, HelpCircle 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage, JHARKHAND_LANGUAGES } from '../../i18n/translations';
import { NotificationBellDropdown } from '../notifications/NotificationBellDropdown';

export type CitizenTab = 'home' | 'my-reports' | 'community-feed' | 'region-chat' | 'leaderboard' | 'profile' | 'help';

interface CitizenNavbarProps {
  activeTab: CitizenTab;
  onTabChange: (tab: CitizenTab) => void;
  onOpenReportModal?: () => void;
  onOpenAuth?: () => void;
  onOpenUniversityPortal?: () => void;
  onLogout?: () => void;
  onNavigateLanding?: () => void;
  currentLang?: SupportedLanguage;
  onLangChange?: (lang: SupportedLanguage) => void;
  userDisplayName?: string;
  userEmail?: string;
  userPhoto?: string;
}

export const CitizenNavbar: React.FC<CitizenNavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAuth,
  onOpenUniversityPortal: _onOpenUniversityPortal,
  onLogout,
  onNavigateLanding,
  currentLang,
  onLangChange,
  userDisplayName = '',
  userPhoto,
}) => {
  const { t } = useLanguage();
  const [_fontSize, _setFontSize] = useState<'normal' | 'large' | 'small'>('normal');
  const [_isDropdownOpen, _setIsDropdownOpen] = useState<boolean>(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const currentLangMeta = JHARKHAND_LANGUAGES.find(l => l.code === currentLang) || JHARKHAND_LANGUAGES[0];

  const navItems: { id: CitizenTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.nav.home, icon: <Home className="w-4 h-4" /> },
    { id: 'my-reports', label: t.nav.myReports, icon: <FileText className="w-4 h-4" /> },
    { id: 'community-feed', label: t.nav.communityFeed, icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'region-chat', label: t.nav.regionChat, icon: <MessagesSquare className="w-4 h-4" /> },
    { id: 'leaderboard', label: t.nav.leaderboard, icon: <Trophy className="w-4 h-4" /> },
    { id: 'help', label: 'Help & Guide', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-[100] bg-[#FAF8F4] text-[#201C18] border-b border-[#E4DDD1] shadow-2xs px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Tightly Lock Up Logo & NIVAARAN Title */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center space-x-1 shrink-0 cursor-pointer select-none"
        >
          <img src="/logo.png" alt="NIVAARAN Logo" className="h-8 sm:h-9 w-auto object-contain shrink-0 -mr-0.5" />
          <span className="text-lg sm:text-xl font-black font-heading text-[#201C18] tracking-tight whitespace-nowrap leading-none">
            NIVAARAN
          </span>
        </div>

        {/* High-Contrast Citizen Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-[#EAE4D8] p-1 rounded-xl border border-[#E4DDD1]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2C6E49] text-white shadow-2xs'
                    : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#DFD8CA]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions & Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Language Switcher Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center bg-[#EAE4D8] px-1.5 py-0.5 rounded border border-[#D5CDBF] cursor-pointer hover:bg-[#E4DDD1] transition-colors"
            >
              <Globe className="w-3 h-3 text-[#2C6E49] mr-1 shrink-0" />
              <span className="text-[10px] font-bold text-[#201C18]">{currentLangMeta?.nativeName || 'English'}</span>
              <ChevronDown className={`w-3 h-3 ml-0.5 text-[#6A6155] transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-[#E4DDD1] rounded-xl shadow-xl py-1.5 z-[120] max-h-72 overflow-y-auto">
                {JHARKHAND_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      if (onLangChange) onLangChange(lang.code);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      currentLang === lang.code 
                        ? 'bg-[#2C6E49]/10 text-[#2C6E49] font-bold' 
                        : 'text-[#201C18] hover:bg-[#FAF8F4] hover:text-[#2C6E49]'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[9px] text-[#9A9084]">{lang.region}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Notification Bell */}
          <NotificationBellDropdown userRole="citizen" userDistrict="Ranchi" />

          {/* Login or User Profile Button */}
          {userDisplayName && userDisplayName !== 'Guest' && userDisplayName !== '' ? (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onTabChange('profile')}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg border transition-all flex items-center space-x-1.5 whitespace-nowrap shadow-2xs ${
                  activeTab === 'profile'
                    ? 'bg-[#2C6E49] text-white border-[#2C6E49]'
                    : 'bg-[#EAE4D8] hover:bg-[#DFD8CA] text-[#201C18] border-[#E4DDD1]'
                }`}
              >
                {userPhoto ? (
                  <img src={userPhoto} alt={userDisplayName} className="w-4 h-4 rounded-full object-cover border border-emerald-600/40 shrink-0" />
                ) : (
                  <User className="w-3.5 h-3.5 shrink-0 text-[#C98A2C]" />
                )}
                <span className="whitespace-nowrap">{userDisplayName}</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigateLanding) {
                    onNavigateLanding();
                  } else {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('portal');
                    url.searchParams.delete('tab');
                    url.searchParams.set('view', 'landing');
                    window.history.pushState({ view: 'landing' }, '', url.toString());
                    window.dispatchEvent(new Event('popstate'));
                  }
                }}
                className="px-2.5 py-1.5 bg-[#FAF8F4] hover:bg-[#EAE4D8] border border-[#E4DDD1] text-[#4A433B] hover:text-[#201C18] rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                title="Return to Public Landing Page"
              >
                <Home className="w-3.5 h-3.5 text-[#2C6E49] shrink-0" />
                <span className="hidden sm:inline">Landing Page</span>
              </button>

              <button
                onClick={async () => {
                  if (onLogout) {
                    await onLogout();
                  }
                  const url = new URL(window.location.href);
                  url.searchParams.delete('portal');
                  url.searchParams.delete('tab');
                  url.searchParams.set('view', 'landing');
                  window.history.pushState({}, '', url.toString());
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="px-2.5 py-1.5 bg-[#B5502D] hover:bg-[#9c4323] text-white rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                title="Sign Out & Return to Landing Page"
              >
                <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="hidden sm:inline">{t.nav.signOut}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => {
                  if (onNavigateLanding) {
                    onNavigateLanding();
                  } else {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('portal');
                    url.searchParams.delete('tab');
                    url.searchParams.set('view', 'landing');
                    window.history.pushState({ view: 'landing' }, '', url.toString());
                    window.dispatchEvent(new Event('popstate'));
                  }
                }}
                className="px-2.5 py-1.5 bg-[#FAF8F4] hover:bg-[#EAE4D8] border border-[#E4DDD1] text-[#4A433B] hover:text-[#201C18] rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                title="Return to Public Landing Page"
              >
                <Home className="w-3.5 h-3.5 text-[#2C6E49] shrink-0" />
                <span className="inline">Landing Page</span>
              </button>
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-black rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{t.nav.signIn}</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Nav Tabs */}
      <div className="md:hidden flex items-center justify-start border-t border-[#E4DDD1] pt-2 mt-2 overflow-x-auto no-scrollbar scrollbar-none scroll-smooth gap-1.5 pb-1">
        <button
          onClick={() => {
            if (onNavigateLanding) {
              onNavigateLanding();
            } else {
              const url = new URL(window.location.href);
              url.searchParams.delete('portal');
              url.searchParams.delete('tab');
              url.searchParams.set('view', 'landing');
              window.history.pushState({ view: 'landing' }, '', url.toString());
              window.dispatchEvent(new Event('popstate'));
            }
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1 whitespace-nowrap text-[#2C6E49] bg-emerald-50 border border-emerald-200 shrink-0 cursor-pointer"
          title="Return to Landing Page"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Landing</span>
        </button>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1 whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#2C6E49] text-white shadow-2xs'
                  : 'text-[#4A433B] bg-[#EAE4D8] hover:bg-[#DFD8CA]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
