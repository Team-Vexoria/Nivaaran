import React, { useState } from 'react';
import { CitizenNavbar, CitizenTab } from '../../components/citizen/CitizenNavbar';
import { CitizenHomeTab } from '../../components/citizen/CitizenHomeTab';
import { CitizenMyReportsTab } from '../../components/citizen/CitizenMyReportsTab';
import { CitizenCommunityFeedTab } from '../../components/citizen/CitizenCommunityFeedTab';
import { CitizenRegionChatTab } from '../../components/citizen/CitizenRegionChatTab';
import { CitizenLeaderboardTab } from '../../components/citizen/CitizenLeaderboardTab';
import { CitizenProfileTab } from '../../components/citizen/CitizenProfileTab';
import { QuickReportModal } from '../../components/QuickReportModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const CitizenPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentLang, setLanguage } = useLanguage();

  const getInitialTab = (): CitizenTab => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as CitizenTab;
    if (tabParam && ['home', 'my-reports', 'community-feed', 'region-chat', 'leaderboard', 'profile'].includes(tabParam)) {
      return tabParam;
    }
    return 'home';
  };

  const [activeTab, setActiveTabState] = useState<CitizenTab>(getInitialTab);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Push tab change to browser history so Back button navigates between views
  const handleTabChange = (newTab: CitizenTab) => {
    setActiveTabState(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newTab);
    window.history.pushState({ tab: newTab }, '', url.toString());
  };

  // Listen for browser Back / Forward events
  React.useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.tab) {
        setActiveTabState(e.state.tab as CitizenTab);
      } else {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') as CitizenTab;
        if (tabParam) {
          setActiveTabState(tabParam);
        } else {
          setActiveTabState('home');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased">
      
      {/* Citizen Navbar with User Session */}
      <CitizenNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAuth={() => {}}
        currentLang={currentLang}
        onLangChange={setLanguage}
        userDisplayName={currentUser?.displayName || 'Citizen User'}
        userEmail={currentUser?.email || ''}
      />

      {/* Main Tab Content Stream */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <CitizenHomeTab
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'my-reports' && (
          <CitizenMyReportsTab
            onOpenReportModal={() => setIsReportModalOpen(true)}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'community-feed' && (
          <CitizenCommunityFeedTab />
        )}

        {activeTab === 'region-chat' && (
          <CitizenRegionChatTab />
        )}

        {activeTab === 'leaderboard' && (
          <CitizenLeaderboardTab
            currentLang={currentLang}
          />
        )}

        {activeTab === 'profile' && (
          <CitizenProfileTab
            userDisplayName={currentUser?.displayName || 'Harshit Mishra'}
            userEmail={currentUser?.email || 'harshit.mishra@jharkhand.gov.in'}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onTabChange={handleTabChange}
          />
        )}
      </main>

      {/* Quick Report & Evidence Modal */}
      <QuickReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
          setIsReportModalOpen(false);
          setActiveTabState('my-reports');
        }}
      />
    </div>
  );
};
