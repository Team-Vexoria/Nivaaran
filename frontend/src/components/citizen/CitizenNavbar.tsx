import React from 'react';
import { 
  Home, FileText, MessageSquare, MessagesSquare, Trophy, 
  User, LogOut 
} from 'lucide-react';
import { TRANSLATIONS, SupportedLanguage } from '../../i18n/translations';

export type CitizenTab = 'home' | 'my-reports' | 'community-feed' | 'region-chat' | 'leaderboard' | 'profile';

interface CitizenNavbarProps {
  activeTab: CitizenTab;
  onTabChange: (tab: CitizenTab) => void;
  onOpenReportModal?: () => void;
  onOpenAuth?: () => void;
  onOpenUniversityPortal?: () => void;
  currentLang?: SupportedLanguage;
  onLangChange?: (lang: SupportedLanguage) => void;
  userDisplayName?: string;
  userEmail?: string;
}

export const CitizenNavbar: React.FC<CitizenNavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenReportModal: _onOpenReportModal,
  onOpenAuth: _onOpenAuth,
  onOpenUniversityPortal: _onOpenUniversityPortal,
  currentLang = 'en',
  onLangChange: _onLangChange,
  userDisplayName = '',
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const navItems: { id: CitizenTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.navHome, icon: <Home className="w-4 h-4" /> },
    { id: 'my-reports', label: t.navMyReports, icon: <FileText className="w-4 h-4" /> },
    { id: 'community-feed', label: t.navCommunityFeed, icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'region-chat', label: t.navRegionChat, icon: <MessagesSquare className="w-4 h-4" /> },
    { id: 'leaderboard', label: t.navLeaderboard, icon: <Trophy className="w-4 h-4" /> },
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
                <User className="w-3.5 h-3.5 shrink-0 text-[#C98A2C]" />
                <span className="whitespace-nowrap">{userDisplayName}</span>
              </button>

              <button
                onClick={() => onTabChange('profile')}
                className="px-2.5 py-1.5 bg-[#B5502D] hover:bg-[#9c4323] text-white rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                title="Manage Account & Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="hidden sm:inline">{t.navLogout}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={_onOpenAuth}
              className="px-3.5 py-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-black rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t.signIn}</span>
            </button>
          )}

        </div>

      </div>

      {/* Mobile Nav Tabs */}
      <div className="md:hidden flex items-center justify-between border-t border-[#E4DDD1] pt-2 mt-2 overflow-x-auto gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1 whitespace-nowrap ${
                isActive
                  ? 'bg-[#2C6E49] text-white'
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
