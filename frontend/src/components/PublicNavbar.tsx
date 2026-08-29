import React, { useState, useRef, useEffect } from 'react';
import { LogIn, PhoneCall, Globe, Eye, ChevronDown, Map } from 'lucide-react';
import { SupportedLanguage } from '../i18n/translations';

interface PublicNavbarProps {
  onOpenAuth: () => void;
  onNavigatePortal?: (portal: string) => void;
  currentLang?: SupportedLanguage;
  onLangChange?: (lang: SupportedLanguage) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ 
  onOpenAuth,
  onNavigatePortal,
  currentLang = 'en',
  onLangChange
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'small'>('normal');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    setIsDropdownOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFontSizeChange = (size: 'normal' | 'large' | 'small') => {
    setFontSize(size);
    const root = document.documentElement;
    if (size === 'large') {
      root.style.fontSize = '17px';
    } else if (size === 'small') {
      root.style.fontSize = '15px';
    } else {
      root.style.fontSize = '16px';
    }
  };

  return (
    <div className="w-full select-none sticky top-0 z-[100]">
      
      {/* 1. Primary Executive Nav (Light Warm Background #FAF8F4) */}
      <header className="bg-[#FAF8F4] text-[#201C18] border-b border-[#E4DDD1] shadow-2xs px-4 sm:px-8 h-14 flex items-center">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Wordmark on ONE line */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-2.5 cursor-pointer select-none"
          >
            <img src="/logo.png" alt="NIVAARAN Logo" className="h-8 w-auto object-contain shrink-0" />
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black font-heading text-[#201C18] tracking-tight leading-none block">
                NIVAARAN
              </span>
              <span className="text-[10px] bg-[#EAE4D8] text-[#C98A2C] font-extrabold px-1.5 py-0.5 rounded border border-[#E4DDD1]">
                JH-SAMADHAN
              </span>
            </div>
          </div>

          {/* Consolidated Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-[#4A433B]">
            
            {/* Top-Level Link 1 */}
            <button 
              onClick={() => scrollToSection('role-gateways')} 
              className="hover:text-[#2C6E49] transition-colors cursor-pointer"
            >
              Role Portals
            </button>

            {/* Top-Level Link 2 — Live Map */}
            <button
              onClick={() => {
                if (onNavigatePortal) {
                  onNavigatePortal('map');
                } else {
                  const url = new URL(window.location.href);
                  url.searchParams.set('portal', 'map');
                  window.history.pushState({ portal: 'map' }, '', url.toString());
                  window.dispatchEvent(new Event('popstate'));
                }
              }}
              className="hover:text-[#2C6E49] transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Explore Map</span>
            </button>

            {/* Top-Level Dropdown Link 3: Explore Platform */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="hover:text-[#2C6E49] transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>Explore Platform</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu (Light Theme) */}
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-[#E4DDD1] rounded-xl shadow-xl py-2 z-[110] text-xs">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (onNavigatePortal) {
                        onNavigatePortal('map');
                      } else {
                        const url = new URL(window.location.href);
                        url.searchParams.set('portal', 'map');
                        window.history.pushState({ portal: 'map' }, '', url.toString());
                        window.dispatchEvent(new Event('popstate'));
                      }
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#FAF8F4] text-[#201C18] hover:text-[#2C6E49] font-medium transition-colors block cursor-pointer"
                  >
                    24 Districts GIS Map 🗺️
                  </button>
                  <button
                    onClick={() => scrollToSection('framework-16')}
                    className="w-full text-left px-4 py-2 hover:bg-[#FAF8F4] text-[#201C18] hover:text-[#2C6E49] font-medium transition-colors block"
                  >
                    16-Stage Lifecycle Stream
                  </button>
                  <button
                    onClick={() => scrollToSection('university-network')}
                    className="w-full text-left px-4 py-2 hover:bg-[#FAF8F4] text-[#201C18] hover:text-[#2C6E49] font-medium transition-colors block"
                  >
                    University R&D Labs
                  </button>
                  <button
                    onClick={() => scrollToSection('state-impact')}
                    className="w-full text-left px-4 py-2 hover:bg-[#FAF8F4] text-[#201C18] hover:text-[#2C6E49] font-medium transition-colors block"
                  >
                    State Impact Ledger
                  </button>
                </div>
              )}
            </div>

          </nav>

          {/* Primary Action Button */}
          <div className="flex items-center">
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-[#2C6E49] hover:bg-[#23583a] text-white font-medium text-xs rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0 text-white" />
              <span>Sign In / Portal Login</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. GIGW Utility Strip (Placed BELOW the main navbar) */}
      <div className="bg-[#F3EDE2] text-[#4A433B] border-b border-[#E4DDD1] px-4 sm:px-8 h-7 flex items-center text-[11px]">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-2">
          
          {/* Left: Govt Mandate & Helpline */}
          <div className="flex items-center space-x-2.5">
            <span className="font-semibold text-[#201C18] flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2C6E49]"></span>
              Govt of Jharkhand
            </span>
            <span className="hidden md:inline text-[#C4BDB0]">·</span>
            <span className="hidden md:inline text-[#5A5247]">Dept of Higher & Technical Education</span>
            <span className="text-[#C4BDB0]">·</span>
            <a 
              href="tel:1070" 
              className="text-[#B5502D] font-bold hover:underline transition-colors flex items-center space-x-1"
            >
              <PhoneCall className="w-3 h-3 shrink-0" />
              <span>Helpline: 1070</span>
            </a>
          </div>

          {/* Right: Accessibility Controls & Language Toggle */}
          <div className="flex items-center space-x-3">
            
            {/* Skip to Main Content */}
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:px-2 focus:py-0.5 focus:bg-[#2C6E49] focus:text-white focus:rounded"
            >
              Skip to Content
            </a>

            {/* Font Size Adjusters: [ A- | A | A+ ] */}
            <div className="hidden sm:flex items-center space-x-1 bg-[#EAE4D8] px-1.5 py-0.5 rounded border border-[#D5CDBF]">
              <button 
                onClick={() => handleFontSizeChange('small')}
                className={`px-0.5 font-mono hover:text-[#201C18] transition-colors ${fontSize === 'small' ? 'text-[#2C6E49] font-bold' : 'text-[#6A6155]'}`}
                title="Decrease Font Size"
              >
                A-
              </button>
              <span className="text-[#C4BDB0] text-[9px]">|</span>
              <button 
                onClick={() => handleFontSizeChange('normal')}
                className={`px-0.5 font-mono hover:text-[#201C18] transition-colors ${fontSize === 'normal' ? 'text-[#2C6E49] font-bold' : 'text-[#6A6155]'}`}
                title="Default Font Size"
              >
                A
              </button>
              <span className="text-[#C4BDB0] text-[9px]">|</span>
              <button 
                onClick={() => handleFontSizeChange('large')}
                className={`px-0.5 font-mono hover:text-[#201C18] transition-colors ${fontSize === 'large' ? 'text-[#2C6E49] font-bold' : 'text-[#6A6155]'}`}
                title="Increase Font Size"
              >
                A+
              </button>
            </div>

            {/* High Contrast Indicator */}
            <span className="hidden lg:flex items-center space-x-1 text-[#6A6155]">
              <Eye className="w-3 h-3 text-[#6A6155]" />
              <span className="text-[10px]">GIGW</span>
            </span>

            {/* Language Switcher: [ English | हिन्दी ] */}
            <div className="flex items-center bg-[#EAE4D8] px-1.5 py-0.5 rounded border border-[#D5CDBF]">
              <Globe className="w-3 h-3 text-[#2C6E49] mr-1 shrink-0" />
              <button
                onClick={() => onLangChange && onLangChange('en')}
                className={`px-1 py-0.2 rounded text-[10px] font-bold transition-all ${
                  currentLang === 'en' ? 'bg-[#2C6E49] text-white' : 'text-[#4A433B] hover:text-[#201C18]'
                }`}
              >
                English
              </button>
              <span className="text-[#C4BDB0] mx-0.5">|</span>
              <button
                onClick={() => onLangChange && onLangChange('hi')}
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold transition-all ${
                  currentLang === 'hi' ? 'bg-[#2C6E49] text-white' : 'text-[#4A433B] hover:text-[#201C18]'
                }`}
              >
                हिन्दी
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
