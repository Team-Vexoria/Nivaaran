import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CitizenNavbar, CitizenTab } from '../components/citizen/CitizenNavbar';
import { CitizenHomeTab } from '../components/citizen/CitizenHomeTab';
import { CitizenMyReportsTab } from '../components/citizen/CitizenMyReportsTab';
import { CitizenCommunityFeedTab } from '../components/citizen/CitizenCommunityFeedTab';
import { CitizenRegionChatTab } from '../components/citizen/CitizenRegionChatTab';
import { CitizenLeaderboardTab } from '../components/citizen/CitizenLeaderboardTab';
import { CitizenProfileTab } from '../components/citizen/CitizenProfileTab';
import { UniversityPortal } from './portals/UniversityPortal';
import { QuickReportModal } from '../components/QuickReportModal';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { currentUser } = useAuth();
  const { currentLang, setLanguage } = useLanguage();
  const [currentPortal, setCurrentPortal] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('portal') || 'citizen';
  });

  const getInitialTab = (): CitizenTab => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as CitizenTab;
    if (tabParam && ['home', 'my-reports', 'community-feed', 'region-chat', 'leaderboard', 'profile'].includes(tabParam)) {
      return tabParam;
    }
    return 'home';
  };

  const [activeTab, setActiveTabState] = useState<CitizenTab>(getInitialTab);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Push new tab to browser history so Back button navigates between sub-routes
  const handleTabChange = (newTab: CitizenTab) => {
    setActiveTabState(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newTab);
    url.searchParams.delete('portal');
    setCurrentPortal('citizen');
    window.history.pushState({ tab: newTab, portal: 'citizen' }, '', url.toString());
  };

  // Handle browser Back / Forward buttons seamlessly
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const params = new URLSearchParams(window.location.search);
      const portalParam = params.get('portal');
      if (portalParam) {
        setCurrentPortal(portalParam);
      } else {
        setCurrentPortal('citizen');
      }

      if (e.state && e.state.tab) {
        setActiveTabState(e.state.tab as CitizenTab);
      } else {
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

  if (currentPortal === 'university') {
    return <UniversityPortal />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased selection:bg-slate-900 selection:text-white">
      
      {/* 5-Route Citizen Navbar */}
      <CitizenNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAuth={onOpenAuth}
        onOpenUniversityPortal={() => {
          setCurrentPortal('university');
          const url = new URL(window.location.href);
          url.searchParams.set('portal', 'university');
          window.history.pushState({ portal: 'university' }, '', url.toString());
        }}
        currentLang={currentLang}
        onLangChange={setLanguage}
        userDisplayName={currentUser?.displayName || ''}
        userEmail={currentUser?.email || ''}
      />

      {/* Main Tab View Stream */}
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
          />
        )}

        {activeTab === 'community-feed' && (
          <CitizenCommunityFeedTab />
        )}

        {activeTab === 'region-chat' && (
          <CitizenRegionChatTab />
        )}

        {activeTab === 'leaderboard' && (
          <CitizenLeaderboardTab />
        )}

        {activeTab === 'profile' && (
          <CitizenProfileTab
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onTabChange={handleTabChange}
          />
        )}
      </main>

      {/* Official Government Footer */}
      <footer className="bg-slate-900 text-slate-200 pt-12 pb-8 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid md:grid-cols-4 gap-8 text-xs text-slate-400">
            <div className="space-y-3">
              <div className="flex items-center space-x-1">
                <img src="/logo.png" alt="NIVAARAN Logo" className="h-8 w-auto object-contain shrink-0 -mr-0.5" />
                <span className="font-bold text-base text-white font-heading tracking-tight">NIVAARAN</span>
              </div>
              <p className="leading-relaxed text-slate-400 text-xs">
                NIVAARAN — Jharkhand Citizen Societal Innovation Portal. Directorate of Higher & Technical Education, Government of Jharkhand.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Portal Login Links</h5>
              <ul className="space-y-1.5">
                <li><button onClick={onOpenAuth} className="hover:text-white transition-colors">Citizen & Community Portal</button></li>
                <li><button onClick={onOpenAuth} className="hover:text-white transition-colors">Government Officer Portal</button></li>
                <li><button onClick={onOpenAuth} className="hover:text-white transition-colors">University & Academic Portal</button></li>
                <li><button onClick={onOpenAuth} className="hover:text-white transition-colors">Industry & CSR Marketplace</button></li>
                <li><button onClick={onOpenAuth} className="hover:text-white transition-colors">Platform Super Admin</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Report Categories</h5>
              <ul className="space-y-1.5">
                <li>• Flood & River Basin Hazards</li>
                <li>• Drought & Drinking Water Shortage</li>
                <li>• Road Cracks & Landslide Hazards</li>
                <li>• Forest & Industrial Fire Emergencies</li>
                <li>• Rural & Urban Infrastructure Damage</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">State Emergency Helplines</h5>
              <p className="leading-relaxed text-slate-400">
                State Emergency Operations Centre: <strong>1070</strong><br />
                National Emergency Response: <strong>112</strong><br />
                Directorate of Higher & Technical Education, Nepal House, Doranda, Ranchi - 834002
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
            <span>© 2026 Government of Jharkhand • All Rights Reserved</span>
            <span>Verified Citizen Intake & Public Audit Ledger</span>
          </div>
        </div>
      </footer>

      {/* Quick Report & Evidence Modal */}
      <QuickReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
