import React from 'react';
import { Building2, UserCheck, GraduationCap, CheckCircle2, ChevronDown, Layers, FileText, Users, Award, LogOut } from 'lucide-react';
import { JHARKHAND_UNIVERSITIES, UniversityDoc } from '../../services/universityData';

export type UniversityTab = 'intake-queue' | 'team-builder' | 'proposals' | 'student-workspace';
export type UserRoleType = 'admin' | 'faculty' | 'student';

interface UniversityNavbarProps {
  selectedUniversity: UniversityDoc;
  onUniversityChange: (uni: UniversityDoc) => void;
  userRole: UserRoleType;
  onRoleChange: (role: UserRoleType) => void;
  activeTab: UniversityTab;
  onTabChange: (tab: UniversityTab) => void;
  onNavigateHome: () => void;
  onLogout?: () => void;
}

export const UniversityNavbar: React.FC<UniversityNavbarProps> = ({
  selectedUniversity,
  onUniversityChange,
  userRole,
  onRoleChange,
  activeTab,
  onTabChange,
  onNavigateHome,
  onLogout,
}) => {
  const [isUniDropdownOpen, setIsUniDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-[100] bg-slate-900 text-white border-b border-slate-800 shadow-md px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Logo & Portal Branding */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center space-x-2 shrink-0 cursor-pointer select-none"
        >
          <img src="/logo.png" alt="NIVAARAN Logo" className="h-8 sm:h-9 w-auto object-contain shrink-0" />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg sm:text-xl font-black font-heading text-white tracking-tight leading-none">
                NIVAARAN
              </span>
              <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                HEI Portal
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold block">
              University R&D Orchestration
            </span>
          </div>
        </div>

        {/* Institution Selector & Role Switcher */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* University Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUniDropdownOpen(!isUniDropdownOpen)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[200px] font-bold">{selectedUniversity.shortName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isUniDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-2xl py-2 z-50 max-h-80 overflow-y-auto"
                onMouseLeave={() => setIsUniDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Select Higher Education Institution
                </div>
                {JHARKHAND_UNIVERSITIES.map((uni) => (
                  <button
                    key={uni.id}
                    onClick={() => {
                      onUniversityChange(uni);
                      setIsUniDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      selectedUniversity.id === uni.id ? 'bg-slate-800 text-emerald-400 font-extrabold' : 'text-slate-200 font-medium'
                    }`}
                  >
                    <div>
                      <span className="block font-bold text-xs">{uni.shortName}</span>
                      <span className="text-[10px] text-slate-400 block">{uni.district} District · {uni.departments.length} Depts</span>
                    </div>
                    {selectedUniversity.id === uni.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Switcher Pill */}
          <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => onRoleChange('admin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                userRole === 'admin' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => onRoleChange('faculty')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                userRole === 'faculty' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Faculty</span>
            </button>
            <button
              onClick={() => {
                onRoleChange('student');
                onTabChange('student-workspace');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                userRole === 'student' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>Student</span>
            </button>
          </div>

        </div>

      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-t border-slate-800 pt-2 mt-2 overflow-x-auto gap-2 text-xs">
        <nav className="flex items-center space-x-1">
          <button
            onClick={() => onTabChange('intake-queue')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'intake-queue'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Matched Intake Queue</span>
          </button>

          <button
            onClick={() => onTabChange('team-builder')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'team-builder'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2. Multidisciplinary Team Builder</span>
          </button>

          <button
            onClick={() => onTabChange('proposals')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'proposals'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. Technical Proposals & Milestones</span>
          </button>

          <button
            onClick={() => onTabChange('student-workspace')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'student-workspace'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>4. Student R&D Workspace</span>
          </button>
        </nav>

        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              if (onLogout) {
                await onLogout();
              }
              const url = new URL(window.location.href);
              url.searchParams.delete('portal');
              url.searchParams.set('tab', 'home');
              window.history.pushState({ tab: 'home' }, '', url.toString());
              window.dispatchEvent(new Event('popstate'));
              onNavigateHome();
            }}
            className="text-[11px] font-extrabold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors shrink-0 flex items-center space-x-1 cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Sign Out & Return Home</span>
          </button>
        </div>
      </div>
    </header>
  );
};
