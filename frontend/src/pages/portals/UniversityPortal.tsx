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

  const assignedChallenge: ChallengeDoc | null = React.useMemo(() => {
    if (selectedChallengeId) {
      const match = challenges.find(c => c.id === selectedChallengeId || c.reportId === selectedChallengeId);
      if (match && isAssignedToSelectedUni(match.assignedHEI)) return match;
    }
    if (activeChallengeForTeam && isAssignedToSelectedUni(activeChallengeForTeam.assignedHEI)) {
      return activeChallengeForTeam;
    }
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
