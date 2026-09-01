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
    <header className="sticky top-0 z-[100] bg-[#FAF8F4] text-[#201C18] border-b border-[#E4DDD1] shadow-2xs px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Logo & Portal Branding */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center space-x-2 shrink-0 cursor-pointer select-none"
        >
          <img src="/logo.png" alt="NIVAARAN Logo" className="h-8 sm:h-9 w-auto object-contain shrink-0" />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg sm:text-xl font-black font-heading text-[#201C18] tracking-tight leading-none">
                NIVAARAN
              </span>
              <span className="text-[10px] font-extrabold bg-[#EAE4D8] text-[#C98A2C] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#E4DDD1]">
                HEI Portal
              </span>
            </div>
            <span className="text-[10px] text-[#5A5247] font-semibold block">
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
              className="px-3 py-1.5 bg-[#EAE4D8] hover:bg-[#DFD8CA] text-[#201C18] border border-[#E4DDD1] rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5 text-[#2C6E49] shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[200px] font-bold">{selectedUniversity.shortName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6A6155] shrink-0" />
            </button>

            {isUniDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white border border-[#E4DDD1] text-[#201C18] rounded-xl shadow-2xl py-2 z-50 max-h-80 overflow-y-auto"
                onMouseLeave={() => setIsUniDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold text-[#6A6155] uppercase tracking-wider border-b border-[#E4DDD1]">
                  Select Higher Education Institution
                </div>
                {JHARKHAND_UNIVERSITIES.map((uni) => (
                  <button
                    key={uni.id}
                    onClick={() => {
                      onUniversityChange(uni);
                      setIsUniDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#FAF8F4] transition-colors ${
                      selectedUniversity.id === uni.id ? 'bg-[#FAF8F4] text-[#2C6E49] font-extrabold' : 'text-[#201C18] font-medium'
                    }`}
                  >
                    <div>
                      <span className="block font-bold text-xs">{uni.shortName}</span>
                      <span className="text-[10px] text-slate-500 block">{uni.district} District · {uni.departments.length} Depts</span>
                    </div>
                    {selectedUniversity.id === uni.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#2C6E49] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Switcher Pill */}
          <div className="hidden sm:flex items-center bg-[#EAE4D8] p-1 rounded-xl border border-[#E4DDD1] text-xs">
            <button
              onClick={() => onRoleChange('admin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                userRole === 'admin' ? 'bg-[#2C6E49] text-white shadow-2xs' : 'text-[#4A433B] hover:text-[#201C18]'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => {
                onRoleChange('faculty');
                // Faculty: keep current tab unless on student-workspace, jump to intake
                if (activeTab === 'student-workspace') onTabChange('intake-queue');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                userRole === 'faculty' ? 'bg-[#2C6E49] text-white shadow-2xs' : 'text-[#4A433B] hover:text-[#201C18]'
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
                userRole === 'student' ? 'bg-[#2C6E49] text-white shadow-2xs' : 'text-[#4A433B] hover:text-[#201C18]'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>Student</span>
            </button>
          </div>

        </div>

      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-t border-[#E4DDD1] pt-2 mt-2 overflow-x-auto gap-2 text-xs">
        <nav className="flex items-center space-x-1">
          {/* Admin + Faculty: Intake Queue */}
          {userRole !== 'student' && (
            <button
              onClick={() => onTabChange('intake-queue')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'intake-queue'
                  ? 'bg-[#2C6E49] text-white shadow-2xs'
                  : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>1. Matched Intake Queue</span>
            </button>
          )}

          {/* Admin + Faculty: Team Builder */}
          {userRole !== 'student' && (
            <button
              onClick={() => onTabChange('team-builder')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'team-builder'
                  ? 'bg-[#2C6E49] text-white shadow-2xs'
                  : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2. Multidisciplinary Team Builder</span>
            </button>
          )}

          {/* Admin + Faculty: Proposals */}
          {userRole !== 'student' && (
            <button
              onClick={() => onTabChange('proposals')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'proposals'
                  ? 'bg-[#2C6E49] text-white shadow-2xs'
                  : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>3. Technical Proposals & Milestones</span>
            </button>
          )}

          {/* All roles: Student Workspace */}
          <button
            onClick={() => onTabChange('student-workspace')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'student-workspace'
                ? 'bg-[#2C6E49] text-white shadow-2xs'
                : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#C98A2C]" />
            <span>{userRole === 'student' ? 'My R&D Workspace' : '4. Student R&D Workspace'}</span>
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
            className="text-[11px] font-extrabold text-white bg-[#B5502D] hover:bg-[#9c4323] px-3 py-1.5 rounded-lg transition-colors shrink-0 flex items-center space-x-1 cursor-pointer active:scale-95 shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 text-white" />
            <span>Sign Out & Return Home</span>
          </button>
        </div>
      </div>
    </header>
  );
};
