import React, { useState, useMemo } from 'react';
import { 
  Building2, UserCheck, GraduationCap, CheckCircle2, Layers, FileText, 
  Users, Award, LogOut, Handshake, FlaskConical, Search, Copy, Check, X, ShieldCheck,
  MessageSquare, IndianRupee
} from 'lucide-react';
import { 
  UniversityDoc, getUniversityEmail, getTestingInstitutionsList 
} from '../../services/universityData';
import { NotificationBellDropdown } from '../notifications/NotificationBellDropdown';

export type UniversityTab = 'intake-queue' | 'team-builder' | 'proposals' | 'student-workspace' | 'industry-collab' | 'outcomes' | 'messages' | 'pfms';
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
  const [isTestingModalOpen, setIsTestingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopyEmail = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const testingInstitutions = useMemo(() => {
    const all = getTestingInstitutionsList();
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase().trim();
    return all.filter(item => 
      item.uni.name.toLowerCase().includes(q) ||
      (item.uni.shortName && item.uni.shortName.toLowerCase().includes(q)) ||
      item.uni.district.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-[100] bg-[#FAF8F4] text-[#201C18] border-b border-[#E4DDD1] shadow-2xs px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Logo and Portal Branding */}
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

        {/* Institution Badge, Testing Switcher, and Role Switcher */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Institutional Access Badge */}
          <div className="px-3 py-1.5 bg-[#EAE4D8] text-[#201C18] border border-[#E4DDD1] rounded-xl text-xs flex items-center space-x-2 shadow-2xs select-none">
            <Building2 className="w-4 h-4 text-[#2C6E49] shrink-0" />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="truncate max-w-[130px] sm:max-w-[180px] font-extrabold text-xs text-[#201C18]">{selectedUniversity.shortName}</span>
                <span className="text-[9px] font-black bg-[#2C6E49]/10 text-[#2C6E49] px-1.5 py-0.5 rounded border border-[#2C6E49]/20 hidden sm:inline">VERIFIED HEI</span>
              </div>
              <span className="text-[10px] font-mono text-[#6A6155] truncate max-w-[140px] sm:max-w-[190px]">{getUniversityEmail(selectedUniversity)}</span>
            </div>
          </div>

          {/* Dedicated Testing Accounts Switcher */}
          <button
            onClick={() => setIsTestingModalOpen(true)}
            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Open testing accounts directory"
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="hidden md:inline font-bold">Testing Accounts</span>
            <span className="md:hidden font-bold">Test</span>
          </button>

          {/* Real-time Notification Bell */}
          <NotificationBellDropdown userRole="university" userDistrict={selectedUniversity.district} />

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

          <button
            onClick={() => onTabChange('industry-collab')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'industry-collab'
                ? 'bg-[#2C6E49] text-white shadow-2xs'
                : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
            }`}
          >
            <Handshake className="w-3.5 h-3.5 text-[#C98A2C]" />
            <span>5. Industry / CSR Collaboration Requests</span>
          </button>

          <button
            onClick={() => onTabChange('outcomes')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'outcomes'
                ? 'bg-[#2C6E49] text-white shadow-2xs'
                : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#2C6E49]" />
            <span>6. Innovation & IP Registry</span>
          </button>

          <button
            onClick={() => onTabChange('messages')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'messages'
                ? 'bg-[#2C6E49] text-white shadow-2xs'
                : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#2C6E49]" />
            <span>7. Stakeholder Comms</span>
          </button>

          <button
            onClick={() => onTabChange('pfms')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'pfms'
                ? 'bg-[#2C6E49] text-white shadow-2xs'
                : 'text-[#4A433B] hover:text-[#201C18] hover:bg-[#EAE4D8]'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5 text-[#2C6E49]" />
            <span>8. PFMS Grant Ledger</span>
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

      {/* Testing Accounts Directory Modal */}
      {isTestingModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white border border-[#E4DDD1] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E4DDD1] bg-[#FAF8F4] flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 border border-amber-200 rounded-xl text-amber-800 shrink-0">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black font-heading text-[#201C18]">
                      Higher Education Institution Testing Directory
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                      QA Sandbox
                    </span>
                  </div>
                  <p className="text-xs text-[#6A6155] mt-1 leading-relaxed">
                    Test college specific workflows and deterministic matching. Each institution is provisioned with its authorized testing credentials.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTestingModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8A7F72] hover:text-[#201C18] hover:bg-[#EAE4D8] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick BIT Mesra Highlight Banner */}
            <div className="px-4 sm:px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>BIT Mesra testing account:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-mono text-[11px] font-bold">bitmesera@nivaaran.com</code>
                </span>
              </div>
              <button
                onClick={(e) => handleCopyEmail('bitmesera@nivaaran.com', e)}
                className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copiedEmail === 'bitmesera@nivaaran.com' ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3 text-emerald-700" />}
                <span>{copiedEmail === 'bitmesera@nivaaran.com' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Search Filter */}
            <div className="p-3 sm:p-4 border-b border-[#E4DDD1] bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8A7F72] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by college name, district, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#201C18] focus:outline-none focus:border-[#2C6E49]"
                />
              </div>
            </div>

            {/* Colleges List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              {testingInstitutions.map((item) => {
                const isActive = selectedUniversity.id === item.uni.id;
                return (
                  <div
                    key={item.uni.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActive 
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs' 
                        : 'bg-white border-[#E4DDD1] hover:border-[#C4BDB0] hover:bg-[#FAF8F4]'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs text-[#201C18] truncate">{item.uni.shortName}</span>
                        <span className="text-[10px] text-[#6A6155] font-semibold">{item.uni.district} District</span>
                        <span className="text-[10px] text-slate-400">· {item.uni.departments.length} Depts</span>
                        {isActive && (
                          <span className="text-[10px] font-extrabold bg-[#2C6E49] text-white px-2 py-0.5 rounded-full">
                            Active Session
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5A5247] line-clamp-1">{item.uni.name}</p>
                      
                      {/* Email pill */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] font-mono font-bold text-[#2C6E49] bg-[#2C6E49]/10 border border-[#2C6E49]/20 px-2 py-0.5 rounded">
                          {item.email}
                        </span>
                        <button
                          onClick={(e) => handleCopyEmail(item.email, e)}
                          className="p-1 text-[#8A7F72] hover:text-[#201C18] hover:bg-[#EAE4D8] rounded transition-colors"
                          title="Copy email address"
                        >
                          {copiedEmail === item.email ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isActive ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-[#2C6E49] px-3 py-1.5 bg-white border border-emerald-300 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-[#2C6E49]" />
                          <span>Connected</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            onUniversityChange(item.uni);
                            setIsTestingModalOpen(false);
                          }}
                          className="w-full sm:w-auto px-3.5 py-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                        >
                          <span>Switch College</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-[#E4DDD1] bg-[#FAF8F4] flex items-center justify-between text-xs text-[#6A6155]">
              <span>Showing {testingInstitutions.length} verified institution test profiles</span>
              <button
                onClick={() => setIsTestingModalOpen(false)}
                className="px-3 py-1.5 bg-white border border-[#E4DDD1] text-[#201C18] font-bold rounded-lg hover:bg-[#EAE4D8] transition-colors cursor-pointer text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
