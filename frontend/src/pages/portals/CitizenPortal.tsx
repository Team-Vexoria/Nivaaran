import React, { useState } from 'react';
import { CitizenNavbar, CitizenTab } from '../../components/citizen/CitizenNavbar';
import { CitizenHomeTab } from '../../components/citizen/CitizenHomeTab';
import { CitizenMyReportsTab } from '../../components/citizen/CitizenMyReportsTab';
import { CitizenCommunityFeedTab } from '../../components/citizen/CitizenCommunityFeedTab';
import { CitizenRegionChatTab } from '../../components/citizen/CitizenRegionChatTab';
import { CitizenLeaderboardTab } from '../../components/citizen/CitizenLeaderboardTab';
import { CitizenProfileTab } from '../../components/citizen/CitizenProfileTab';
import { QuickReportModal } from '../../components/QuickReportModal';
import { LiveEmergencyAlertBanner } from '../../components/LiveEmergencyAlertBanner';
import { PublicChallengeTracker } from '../../components/tracking/PublicChallengeTracker';
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
  const [trackingModal, setTrackingModal] = useState<{ isOpen: boolean; reportId?: string }>({
    isOpen: false,
    reportId: '',
  });

  const [citizenProfileName, setCitizenProfileName] = useState<string>(() => {
    try {
      const key = `nivaaran_citizen_profile_${currentUser?.uid || 'default'}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.displayName) return parsed.displayName;
      }
    } catch {
      // fallback
    }
    return currentUser?.displayName || 'Harshit Mishra';
  });

  const [citizenProfilePhoto, setCitizenProfilePhoto] = useState<string>(() => {
    try {
      const key = `nivaaran_citizen_profile_${currentUser?.uid || 'default'}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.photoUrl) return parsed.photoUrl;
      }
    } catch {
      // fallback
    }
    return currentUser?.photoURL || '';
  });

  React.useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      if (e?.detail?.displayName) {
        setCitizenProfileName(e.detail.displayName);
      }
      if (e?.detail?.photoUrl !== undefined) {
        setCitizenProfilePhoto(e.detail.photoUrl);
      }
    };
    window.addEventListener('nivaaran_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('nivaaran_profile_updated', handleProfileUpdate);
  }, []);

  React.useEffect(() => {
    if (currentUser?.displayName) {
      setCitizenProfileName(currentUser.displayName);
    }
    if (currentUser?.photoURL) {
      setCitizenProfilePhoto(currentUser.photoURL);
    }
  }, [currentUser?.displayName, currentUser?.photoURL]);

  const handleOpenTracking = (reportId?: string) => {
    setTrackingModal({
      isOpen: true,
      reportId: reportId || 'JH-2026-RNC-001',
    });
  };

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
      
      {/* Real-time Emergency Disaster Alert Banner */}
      <LiveEmergencyAlertBanner />

      {/* Citizen Navbar with User Session */}
      <CitizenNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAuth={() => {}}
        currentLang={currentLang}
        onLangChange={setLanguage}
        userDisplayName={citizenProfileName}
        userEmail={currentUser?.email || ''}
        userPhoto={citizenProfilePhoto}
      />

      {/* Main Tab Content Stream */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <CitizenHomeTab
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigateTab={handleTabChange}
            onOpenTracking={handleOpenTracking}
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
            userDisplayName={citizenProfileName}
            userEmail={currentUser?.email || 'harshit.mishra@jharkhand.gov.in'}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onTabChange={handleTabChange}
          />
        )}
      </main>

      {/* Public Challenge 16-Stage Audit Tracker Modal */}
      {trackingModal.isOpen && (
        <PublicChallengeTracker
          initialReportId={trackingModal.reportId}
          onClose={() => setTrackingModal({ isOpen: false, reportId: '' })}
        />
      )}

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
