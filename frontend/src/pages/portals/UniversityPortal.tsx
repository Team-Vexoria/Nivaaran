import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JHARKHAND_UNIVERSITIES, UniversityDoc, DepartmentInfo, getUniversityByEmail } from '../../services/universityData';
import { UniversityNavbar, UniversityTab, UserRoleType } from '../../components/university/UniversityNavbar';
import { UniversityIntakeTab } from '../../components/university/UniversityIntakeTab';
import { MultidisciplinaryTeamTab } from '../../components/university/MultidisciplinaryTeamTab';
import { ProposalManagerTab } from '../../components/university/ProposalManagerTab';
import { StudentWorkspaceTab } from '../../components/university/StudentWorkspaceTab';
import { 
  ChallengeDoc, ProjectDoc, 
  subscribeToChallenges, subscribeToProjects 
} from '../../services/firebaseService';
import { isAssignedToUniversity } from '../../services/heiMatchingEngine';

import { CollaborationReviewPanel } from '../../components/university/CollaborationReviewPanel';
import { InnovationOutcomesTracker } from '../../components/analytics/InnovationOutcomesTracker';
import { CrossPortalMessagingHub } from '../../components/communication/CrossPortalMessagingHub';
import { PFMSDisbursementLedger } from '../../components/gov/PFMSDisbursementLedger';
import { Building2 } from 'lucide-react';
import { HelpUserGuide } from '../../components/help/HelpUserGuide';

interface UniversityPortalProps {
  onNavigateHome?: () => void;
}

export const UniversityPortal: React.FC<UniversityPortalProps> = ({ onNavigateHome }) => {
  const { logout, currentUser } = useAuth();
  
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityDoc>(() => {
    // 1. If logged in with an official college email such as bitmesera@nivaaran.com
    if (currentUser?.email) {
      const matchedByEmail = getUniversityByEmail(currentUser.email);
      if (matchedByEmail) return matchedByEmail;
    }
    // 2. If stored in testing session
    const savedId = localStorage.getItem('nivaaran_active_university_id');
    if (savedId) {
      const matchedById = JHARKHAND_UNIVERSITIES.find(u => u.id === savedId);
      if (matchedById) return matchedById;
    }
    // 3. Default to BIT Mesra or first university
    const bitMesra = JHARKHAND_UNIVERSITIES.find(u => u.id === 'UNI-BIT-MESRA');
    return bitMesra || JHARKHAND_UNIVERSITIES[0];
  });

  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);

  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(() => {
    return localStorage.getItem('nivaaran_active_challenge_id') || '';
  });

  useEffect(() => {
    const unsubProjects = subscribeToProjects(setProjects);
    const unsubChallenges = subscribeToChallenges(setChallenges);
    return () => {
      unsubProjects();
      unsubChallenges();
    };
  }, []);

  const isAssignedToSelectedUni = (nameOrId: string | undefined): boolean => {
    return isAssignedToUniversity(nameOrId, selectedUniversity);
  };

  const assignedProject: ProjectDoc | null = React.useMemo(() => {
    const direct = projects.find(p => isAssignedToSelectedUni(p.universityId) || isAssignedToSelectedUni(p.universityName));
    if (direct) return direct;

    const uniChallengeIds = new Set(
      challenges.filter(c => isAssignedToSelectedUni(c.assignedHEI)).map(c => c.id || c.reportId)
    );
    const byChallenge = projects.find(p => uniChallengeIds.has(p.challengeId));
    if (byChallenge) return byChallenge;

    return null;
  }, [projects, challenges, selectedUniversity]);

  const isStudentUser = currentUser?.role === 'Student' || !!currentUser?.email?.toLowerCase().includes('student');

  const [userRole, setUserRole] = useState<UserRoleType>(() => isStudentUser ? 'student' : 'faculty');
  const [activeTab, setActiveTab] = useState<UniversityTab>(() => isStudentUser ? 'student-workspace' : 'intake-queue');
  const [activeChallengeForTeam, setActiveChallengeForTeam] = useState<ChallengeDoc | null>(null);
  const [selectedDeptForTeam, setSelectedDeptForTeam] = useState<DepartmentInfo | null>(null);
  const [activeProposalChallengeId, setActiveProposalChallengeId] = useState<string>(() => selectedChallengeId);

  const uniAllocatedChallenges = React.useMemo(() => {
    const list = challenges.filter(c => isAssignedToSelectedUni(c.assignedHEI));
    return list.sort((a, b) => {
      const isTupA = a.id === 'DEMO-CH-TUPUDANA' || a.reportId === 'NIV-JH-RNC-2026-0042';
      const isTupB = b.id === 'DEMO-CH-TUPUDANA' || b.reportId === 'NIV-JH-RNC-2026-0042';
      if (isTupA && !isTupB) return -1;
      if (!isTupA && isTupB) return 1;
      return 0;
    });
  }, [challenges, selectedUniversity]);

  const assignedChallenge: ChallengeDoc | null = React.useMemo(() => {
    if (selectedChallengeId) {
      const match = challenges.find(c => c.id === selectedChallengeId || c.reportId === selectedChallengeId);
      if (match && isAssignedToSelectedUni(match.assignedHEI)) return match;
    }
    if (activeChallengeForTeam && isAssignedToSelectedUni(activeChallengeForTeam.assignedHEI)) {
      return activeChallengeForTeam;
    }
    // Prioritize Tupudana culvert challenge if allocated to this university
    const tupudana = challenges.find(c => (c.id === 'DEMO-CH-TUPUDANA' || c.reportId === 'NIV-JH-RNC-2026-0042') && isAssignedToSelectedUni(c.assignedHEI));
    if (tupudana) return tupudana;

    // Prioritize challenge directly allocated to this university
    const directlyAllocated = challenges.find(c => isAssignedToSelectedUni(c.assignedHEI));
    if (directlyAllocated) return directlyAllocated;

    if (assignedProject) {
      const match = challenges.find(c => c.id === assignedProject.challengeId || c.reportId === assignedProject.challengeId);
      if (match) return match;
    }
    return null;
  }, [challenges, selectedChallengeId, activeChallengeForTeam, assignedProject, selectedUniversity]);

  useEffect(() => {
    if (!selectedChallengeId && assignedChallenge) {
      const id = assignedChallenge.id || assignedChallenge.reportId;
      if (id) {
        setSelectedChallengeId(id);
        localStorage.setItem('nivaaran_active_challenge_id', id);
      }
    }
  }, [assignedChallenge, selectedChallengeId]);

  useEffect(() => {
    if (currentUser) {
      const isStudent = currentUser.role === 'Student' || !!currentUser.email?.toLowerCase().includes('student');
      if (isStudent) {
        setUserRole('student');
        setActiveTab('student-workspace');
      }
    }
  }, [currentUser?.role, currentUser?.email]);

  useEffect(() => {
    if (currentUser?.email) {
      const matched = getUniversityByEmail(currentUser.email);
      if (matched && matched.id !== selectedUniversity.id) {
        setSelectedUniversity(matched);
        setActiveChallengeForTeam(null);
        setSelectedChallengeId('');
        setActiveProposalChallengeId('');
        localStorage.removeItem('nivaaran_active_challenge_id');
        localStorage.setItem('nivaaran_active_university_id', matched.id);
      }
    }
  }, [currentUser?.email]);

  const handleUniversityChange = (uni: UniversityDoc) => {
    setSelectedUniversity(uni);
    setActiveChallengeForTeam(null);
    setSelectedChallengeId('');
    setActiveProposalChallengeId('');
    localStorage.removeItem('nivaaran_active_challenge_id');
    localStorage.setItem('nivaaran_active_university_id', uni.id);
  };

  const handleReturnHome = async () => {
    if (logout) {
      await logout();
    }
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('portal');
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleAcceptAndProceedToTeam = (challenge: ChallengeDoc, dept: DepartmentInfo) => {
    const id = challenge.id || challenge.reportId;
    setSelectedChallengeId(id);
    localStorage.setItem('nivaaran_active_challenge_id', id);
    setActiveChallengeForTeam(challenge);
    setSelectedDeptForTeam(dept);
    setActiveTab('team-builder');
  };

  const handleNavigateToStage = (stageNumber: number, challenge: ChallengeDoc) => {
    const id = challenge.id || challenge.reportId;
    setSelectedChallengeId(id);
    localStorage.setItem('nivaaran_active_challenge_id', id);
    setActiveChallengeForTeam(challenge);

    if (stageNumber <= 8) {
      setActiveTab('team-builder');
    } else if (stageNumber === 9) {
      setActiveProposalChallengeId(id);
      setActiveTab('proposals');
    } else if (stageNumber === 10) {
      setActiveTab('industry-collab');
    } else if (stageNumber >= 11) {
      setActiveTab('student-workspace');
    }
  };

  const handleProceedToProposal = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    localStorage.setItem('nivaaran_active_challenge_id', challengeId);
    setActiveProposalChallengeId(challengeId);
    setActiveTab('proposals');
  };

  const handleProposalSubmitted = () => {
    setActiveTab('student-workspace');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#201C18] flex flex-col antialiased selection:bg-[#2C6E49] selection:text-white">
      
      {/* Top Navbar */}
      <UniversityNavbar
        selectedUniversity={selectedUniversity}
        onUniversityChange={handleUniversityChange}
        userRole={userRole}
        onRoleChange={setUserRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNavigateHome={handleReturnHome}
        onLogout={logout}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* Active Allocated Challenge Switcher Banner */}
        {uniAllocatedChallenges.length > 0 && (
          <div className="bg-white border border-[#E4DDD1] rounded-2xl p-3.5 sm:p-4 mb-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#2C6E49]/10 text-[#2C6E49] flex items-center justify-center shrink-0 border border-[#2C6E49]/20 shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#2C6E49] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active HEI R&amp;D Mandate
                  </span>
                  {assignedChallenge?.reportId && (
                    <span className="text-[10px] font-mono font-extrabold text-[#6A6155] bg-[#FAF8F4] px-2 py-0.5 rounded border border-[#E4DDD1]">
                      {assignedChallenge.reportId}
                    </span>
                  )}
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-200">
                    Stage {assignedChallenge?.stageNumber || 16}: {assignedChallenge?.status || 'Active'}
                  </span>
                  {assignedChallenge?.district && (
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 hidden sm:inline">
                      📍 {assignedChallenge.village ? `${assignedChallenge.village}, ` : ''}{assignedChallenge.district}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#201C18] truncate mt-1 font-heading">
                  {assignedChallenge?.title || 'Select Challenge to View'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <span className="text-xs font-extrabold text-[#6A6155] whitespace-nowrap hidden sm:inline">
                Assigned Problem:
              </span>
              <select
                aria-label="Select Assigned Problem"
                value={assignedChallenge?.id || assignedChallenge?.reportId || selectedChallengeId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setSelectedChallengeId(nextId);
                  localStorage.setItem('nivaaran_active_challenge_id', nextId);
                  const found = challenges.find(c => c.id === nextId || c.reportId === nextId);
                  if (found) setActiveChallengeForTeam(found);
                }}
                className="px-3.5 py-2 bg-[#FAF8F4] border-2 border-[#2C6E49]/40 rounded-xl text-xs font-black text-[#201C18] focus:ring-2 focus:ring-[#2C6E49] focus:outline-none cursor-pointer max-w-[280px] sm:max-w-[420px] truncate shadow-xs hover:border-[#2C6E49]"
              >
                {uniAllocatedChallenges.map(c => {
                  const id = c.id || c.reportId;
                  return (
                    <option key={id} value={id}>
                      {c.reportId ? `[${c.reportId}] ` : ''}{c.title}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'intake-queue' && (
          <UniversityIntakeTab
            university={selectedUniversity}
            onAcceptAndProceedToTeam={handleAcceptAndProceedToTeam}
            onNavigateToStage={handleNavigateToStage}
          />
        )}

        {activeTab === 'team-builder' && (
          <MultidisciplinaryTeamTab
            university={selectedUniversity}
            activeChallenge={assignedChallenge}
            selectedDept={selectedDeptForTeam}
            onProceedToProposal={handleProceedToProposal}
          />
        )}

        {activeTab === 'proposals' && (
          <ProposalManagerTab
            university={selectedUniversity}
            activeChallengeId={selectedChallengeId || activeProposalChallengeId}
            onProposalSubmitted={handleProposalSubmitted}
          />
        )}

        {activeTab === 'student-workspace' && (
          <StudentWorkspaceTab
            university={selectedUniversity}
            activeChallengeId={selectedChallengeId}
          />
        )}

        {activeTab === 'industry-collab' && (
          <CollaborationReviewPanel 
            activeChallenge={assignedChallenge}
            university={selectedUniversity}
          />
        )}

        {activeTab === 'outcomes' && (
          <InnovationOutcomesTracker
            userRole="university"
            defaultHEI={selectedUniversity.name}
            activeChallenge={assignedChallenge}
          />
        )}

        {activeTab === 'messages' && (
          <CrossPortalMessagingHub
            currentRole={userRole === 'student' ? 'student' : 'university'}
            currentUserName={userRole === 'student' ? 'Student R&D Lead' : `${selectedUniversity.shortName} Nodal Officer`}
            userHEI={selectedUniversity.name}
            activeChallenge={assignedChallenge}
          />
        )}

        {activeTab === 'pfms' && (
          <PFMSDisbursementLedger
            userRole="university"
            defaultHEI={selectedUniversity.name}
            activeChallenge={assignedChallenge}
          />
        )}

        {activeTab === 'help' && (
          <HelpUserGuide onNavigateHome={() => setActiveTab(userRole === 'student' ? 'student-workspace' : 'intake-queue')} />
        )}
      </main>

    </div>
  );
};
