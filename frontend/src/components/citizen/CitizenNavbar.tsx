import React from 'react';
import { 
  Home, FileText, MessageSquare, MessagesSquare, Trophy, 
  Camera, User, Building2, LogOut 
} from 'lucide-react';
import { SupportedLanguage } from '../../i18n/translations';

export type CitizenTab = 'home' | 'my-reports' | 'community-feed' | 'region-chat' | 'leaderboard' | 'profile';

interface CitizenNavbarProps {
  activeTab: CitizenTab;
  onTabChange: (tab: CitizenTab) => void;
  onOpenReportModal: () => void;
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
  onOpenReportModal,
  onOpenAuth: _onOpenAuth,
  onOpenUniversityPortal,
  currentLang: _currentLang,
  onLangChange: _onLangChange,
  userDisplayName = '',
}) => {

  const navItems: { id: CitizenTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'my-reports', label: 'My Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'community-feed', label: 'Community Feed', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'region-chat', label: 'Region Chat', icon: <MessagesSquare className="w-4 h-4" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-[100] bg-slate-900 text-white border-b border-slate-800 shadow-md px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Tightly Lock Up Logo & NIVAARAN Title */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center space-x-1 shrink-0 cursor-pointer select-none"
        >
          <img src="/logo.png" alt="NIVAARAN Logo" className="h-8 sm:h-9 w-auto object-contain shrink-0 -mr-0.5" />
          <span className="text-lg sm:text-xl font-black font-heading text-white tracking-tight whitespace-nowrap leading-none">
            NIVAARAN
          </span>
        </div>

        {/* High-Contrast Citizen Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-slate-700/80'
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
          
          {/* HEI Portal Direct Button */}
          <button
            onClick={() => {
              if (onOpenUniversityPortal) {
                onOpenUniversityPortal();
              } else {
                const url = new URL(window.location.href);
                url.searchParams.set('portal', 'university');
                window.history.pushState({ portal: 'university' }, '', url.toString());
                window.dispatchEvent(new Event('popstate'));
              }
            }}
            className="hidden lg:flex px-3 py-1.5 bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-700/80 rounded-lg text-xs font-bold items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>HEI R&D Portal</span>
          </button>

          {/* Primary Action Button: Report Problem */}
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black rounded-lg shadow-sm transition-all flex items-center space-x-1.5 active:scale-95 whitespace-nowrap"
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Report Problem</span>
          </button>

          {/* Login or User Profile Button */}
          {userDisplayName && userDisplayName !== 'Guest' && userDisplayName !== '' ? (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onTabChange('profile')}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg border transition-all flex items-center space-x-1.5 whitespace-nowrap shadow-2xs ${
                  activeTab === 'profile'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span className="whitespace-nowrap">{userDisplayName}</span>
              </button>

              <button
                onClick={() => onTabChange('profile')}
                className="px-2.5 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-700 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-colors whitespace-nowrap cursor-pointer"
                title="Manage Account & Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-red-300 shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={_onOpenAuth}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg shadow-sm transition-all flex items-center space-x-1.5 active:scale-95 whitespace-nowrap border border-emerald-500 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Sign In / Portal Login</span>
            </button>
          )}

        </div>

      </div>

      {/* Mobile Nav Tabs */}
      <div className="md:hidden flex items-center justify-between border-t border-slate-800 pt-2 mt-2 overflow-x-auto gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1 whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-200 bg-slate-800 hover:bg-slate-700'
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
