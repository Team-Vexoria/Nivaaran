import React from 'react';
import { LogIn } from 'lucide-react';

interface PublicNavbarProps {
  onOpenAuth: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ onOpenAuth }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-[100] bg-[#0b132b] text-white border-b border-slate-800 shadow-md px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* NIVAARAN Logo & Official Title */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center space-x-2 cursor-pointer select-none"
        >
          <img src="/logo.png" alt="NIVAARAN Logo" className="h-9 sm:h-10 w-auto object-contain shrink-0" />
          <div>
            <span className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight leading-none block">
              NIVAARAN
            </span>
            <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase block">
              Government of Jharkhand
            </span>
          </div>
        </div>

        {/* Public Ecosystem Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold text-slate-200">
          <button 
            onClick={() => scrollToSection('role-gateways')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Role Portals
          </button>
          <button 
            onClick={() => scrollToSection('gis-section')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            24 Districts GIS
          </button>
          <button 
            onClick={() => scrollToSection('framework-16')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            16-Stage Lifecycle
          </button>
          <button 
            onClick={() => scrollToSection('university-network')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            University R&D Labs
          </button>
          <button 
            onClick={() => scrollToSection('state-impact')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            State Impact
          </button>
        </nav>

        {/* Single Clean Sign In / Portal Login Action */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
          >
            <LogIn className="w-4 h-4 shrink-0 text-white" />
            <span>Sign In / Portal Login</span>
          </button>
        </div>

      </div>
    </header>
  );
};
