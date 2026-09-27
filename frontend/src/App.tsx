import React, { Suspense, lazy, useState } from 'react';
import { AuthProvider, useAuth, UserRole } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

// Code-split every portal so only the active one is fetched per login.
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const CitizenPortal = lazy(() => import('./pages/portals/CitizenPortal').then(m => ({ default: m.CitizenPortal })));
const GovPortal = lazy(() => import('./pages/portals/GovPortal').then(m => ({ default: m.GovPortal })));
const UnivPortal = lazy(() => import('./pages/portals/UniversityPortal').then(m => ({ default: m.UniversityPortal })));
const IndustryPortal = lazy(() => import('./pages/portals/IndustryPortal').then(m => ({ default: m.IndustryPortal })));
const AdminPortal = lazy(() => import('./pages/portals/AdminPortal').then(m => ({ default: m.AdminPortal })));
const CommunityPortal = lazy(() => import('./pages/portals/CommunityPortal').then(m => ({ default: m.CommunityPortal })));
const PRIPortal = lazy(() => import('./pages/portals/PRIPortal').then(m => ({ default: m.PRIPortal })));
const ULBPortal = lazy(() => import('./pages/portals/ULBPortal').then(m => ({ default: m.ULBPortal })));
const LabPortal = lazy(() => import('./pages/portals/LabPortal').then(m => ({ default: m.LabPortal })));

const UNIVERSITY_ROLES: UserRole[] = ['University Admin', 'Faculty / Mentor', 'Student'];
const INDUSTRY_ROLES: UserRole[] = ['Industry / MSME', 'CSR Organization'];

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [showAuthPage, setShowAuthPage] = useState<boolean>(false);
  const [viewLanding, setViewLanding] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'landing';
  });

  React.useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setViewLanding(params.get('view') === 'landing');
    };
    const handleCustomLanding = () => {
      setViewLanding(true);
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('nivaaran_navigate_landing', handleCustomLanding);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('nivaaran_navigate_landing', handleCustomLanding);
    };
  }, []);

  if (!currentUser || viewLanding) {
    if (showAuthPage) {
      return <AuthPage onBackToHome={() => setShowAuthPage(false)} />;
    }
    return (
      <LandingPage
        onOpenAuth={() => {
          if (currentUser) {
            const url = new URL(window.location.href);
            url.searchParams.delete('view');
            window.history.pushState({}, '', url.toString());
            setViewLanding(false);
          } else {
            setShowAuthPage(true);
          }
        }}
      />
    );
  }

  const role = currentUser.role;

  return (
    <>
      {role === 'Citizen' && (
        <ProtectedRoute allowedRoles={['Citizen']}>
          <ErrorBoundary>
            <CitizenPortal />
          </ErrorBoundary>
        </ProtectedRoute>
      )}

      {role === 'Government Department' && (
        <ProtectedRoute allowedRoles={['Government Department']}>
          <ErrorBoundary>
            <GovPortal />
          </ErrorBoundary>
        </ProtectedRoute>
      )}

      {UNIVERSITY_ROLES.includes(role) && (
        <ProtectedRoute allowedRoles={UNIVERSITY_ROLES}>
          <ErrorBoundary>
            <UnivPortal />
          </ErrorBoundary>
        </ProtectedRoute>
      )}

      {INDUSTRY_ROLES.includes(role) && (
        <ProtectedRoute allowedRoles={INDUSTRY_ROLES}>
          <ErrorBoundary>
            <IndustryPortal />
          </ErrorBoundary>
        </ProtectedRoute>
      )}

      {role === 'Community / NGO' && (
        <ProtectedRoute allowedRoles={['Community / NGO']}>
          <ErrorBoundary>
            <CommunityPortal />
          </ErrorBoundary>
        </ProtectedRoute>
      )}

      {role === 'PRI (Panchayat)' && (
        <ProtectedRoute allowedRoles={['PRI (Panchayat)']}>
          <ErrorBoundary>
            <PRIPortal />
          </ErrorBoundary>
        </ProtectedRoute>
      )}

      {role === 'ULB (Urban Local Body)' && (
        <ProtectedRoute allowedRoles={['ULB (Urban Local Body)']}>
          <ErrorBoundary>
            <ULBPortal />
          </ErrorBoundary>
        </ProtectedRoute>
      )}

      {role === 'Research Lab / Industry Lab' && (
        <ProtectedRoute allowedRoles={['Research Lab / Industry Lab']}>
          <ErrorBoundary>
            <LabPortal />
          </ErrorBoundary>
        </ProtectedRoute>
      )}

      {role === 'Platform Super Admin' && (
        <ProtectedRoute allowedRoles={['Platform Super Admin']}>
          <ErrorBoundary>
            <AdminPortal />
          </ErrorBoundary>
        </ProtectedRoute>
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <AppContent />
        </Suspense>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
