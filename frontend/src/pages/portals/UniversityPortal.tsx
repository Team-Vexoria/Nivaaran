import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JHARKHAND_UNIVERSITIES, UniversityDoc, DepartmentInfo } from '../../services/universityData';
import { UniversityNavbar, UniversityTab, UserRoleType } from '../../components/university/UniversityNavbar';
import { UniversityIntakeTab } from '../../components/university/UniversityIntakeTab';
import { MultidisciplinaryTeamTab } from '../../components/university/MultidisciplinaryTeamTab';
import { ProposalManagerTab } from '../../components/university/ProposalManagerTab';
import { StudentWorkspaceTab } from '../../components/university/StudentWorkspaceTab';
import { ChallengeDoc } from '../../services/firebaseService';

interface UniversityPortalProps {
  onNavigateHome?: () => void;
}

export const UniversityPortal: React.FC<UniversityPortalProps> = ({ onNavigateHome }) => {
  const { logout } = useAuth();
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityDoc>(JHARKHAND_UNIVERSITIES[0]);
  const [userRole, setUserRole] = useState<UserRoleType>('admin');
  const [activeTab, setActiveTab] = useState<UniversityTab>('intake-queue');
  const [activeChallengeForTeam, setActiveChallengeForTeam] = useState<ChallengeDoc | null>(null);
  const [selectedDeptForTeam, setSelectedDeptForTeam] = useState<DepartmentInfo | null>(null);
  const [activeProposalChallengeId, setActiveProposalChallengeId] = useState<string>('');

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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased selection:bg-slate-900 selection:text-white">
      
      {/* Top Navbar */}
      <UniversityNavbar
        selectedUniversity={selectedUniversity}
        onUniversityChange={(uni) => {
          setSelectedUniversity(uni);
          setActiveChallengeForTeam(null);
        }}
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
      </main>

    </div>
  );
};
