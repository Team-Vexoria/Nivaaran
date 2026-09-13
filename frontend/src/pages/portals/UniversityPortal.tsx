import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JHARKHAND_UNIVERSITIES, UniversityDoc, DepartmentInfo, getUniversityByEmail } from '../../services/universityData';
import { UniversityNavbar, UniversityTab, UserRoleType } from '../../components/university/UniversityNavbar';
import { UniversityIntakeTab } from '../../components/university/UniversityIntakeTab';
import { MultidisciplinaryTeamTab } from '../../components/university/MultidisciplinaryTeamTab';
import { ProposalManagerTab } from '../../components/university/ProposalManagerTab';
import { StudentWorkspaceTab } from '../../components/university/StudentWorkspaceTab';
import { ChallengeDoc } from '../../services/firebaseService';

import { CollaborationReviewPanel } from '../../components/university/CollaborationReviewPanel';
import { InnovationOutcomesTracker } from '../../components/analytics/InnovationOutcomesTracker';
import { CrossPortalMessagingHub } from '../../components/communication/CrossPortalMessagingHub';

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

  const [userRole, setUserRole] = useState<UserRoleType>('admin');
  const [activeTab, setActiveTab] = useState<UniversityTab>('intake-queue');
  const [activeChallengeForTeam, setActiveChallengeForTeam] = useState<ChallengeDoc | null>(null);
  const [selectedDeptForTeam, setSelectedDeptForTeam] = useState<DepartmentInfo | null>(null);
  const [activeProposalChallengeId, setActiveProposalChallengeId] = useState<string>('');

  useEffect(() => {
    if (currentUser?.email) {
      const matched = getUniversityByEmail(currentUser.email);
      if (matched && matched.id !== selectedUniversity.id) {
        setSelectedUniversity(matched);
        setActiveChallengeForTeam(null);
        localStorage.setItem('nivaaran_active_university_id', matched.id);
      }
    }
  }, [currentUser?.email]);

  const handleUniversityChange = (uni: UniversityDoc) => {
    setSelectedUniversity(uni);
    setActiveChallengeForTeam(null);
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
    setActiveChallengeForTeam(challenge);
    setSelectedDeptForTeam(dept);
    setActiveTab('team-builder');
  };

  const handleProceedToProposal = (challengeId: string) => {
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
          />
        )}

        {activeTab === 'team-builder' && (
          <MultidisciplinaryTeamTab
            university={selectedUniversity}
            activeChallenge={activeChallengeForTeam}
            selectedDept={selectedDeptForTeam}
            onProceedToProposal={handleProceedToProposal}
          />
        )}

        {activeTab === 'proposals' && (
          <ProposalManagerTab
            university={selectedUniversity}
            activeChallengeId={activeProposalChallengeId}
            onProposalSubmitted={handleProposalSubmitted}
          />
        )}

        {activeTab === 'student-workspace' && (
          <StudentWorkspaceTab
            university={selectedUniversity}
          />
        )}

        {activeTab === 'industry-collab' && (
          <CollaborationReviewPanel />
        )}

        {activeTab === 'outcomes' && (
          <InnovationOutcomesTracker
            userRole="university"
            defaultHEI={selectedUniversity.name}
          />
        )}

        {activeTab === 'messages' && (
          <CrossPortalMessagingHub
            currentRole="university"
            currentUserName={`${selectedUniversity.shortName} Nodal Officer`}
            userHEI={selectedUniversity.name}
          />
        )}
      </main>

    </div>
  );
};
