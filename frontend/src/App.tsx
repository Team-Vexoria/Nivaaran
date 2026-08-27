import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { CitizenPortal } from './pages/portals/CitizenPortal';
import { GovPortal } from './pages/portals/GovPortal';
import { UnivPortal } from './pages/portals/UnivPortal';
import { IndustryPortal } from './pages/portals/IndustryPortal';
import { AdminPortal } from './pages/portals/AdminPortal';
import { ProtectedRoute } from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [showAuthPage, setShowAuthPage] = useState<boolean>(false);

  if (!currentUser) {
    if (showAuthPage) {
      return <AuthPage onBackToHome={() => setShowAuthPage(false)} />;
    }
    return <LandingPage onOpenAuth={() => setShowAuthPage(true)} />;
  }

  return (
    <>
      {currentUser.role === 'Government Department' && (
        <ProtectedRoute allowedRoles={['Government Department']}>
          <GovPortal />
        </ProtectedRoute>
      )}

      {(currentUser.role === 'University Admin' || currentUser.role === 'Faculty / Mentor' || currentUser.role === 'Student') && (
        <ProtectedRoute allowedRoles={['University Admin', 'Faculty / Mentor', 'Student']}>
          <UnivPortal />
        </ProtectedRoute>
      )}

      {(currentUser.role === 'Industry / MSME' || currentUser.role === 'CSR Organization') && (
        <ProtectedRoute allowedRoles={['Industry / MSME', 'CSR Organization']}>
          <IndustryPortal />
        </ProtectedRoute>
      )}

      {currentUser.role === 'Platform Super Admin' && (
        <ProtectedRoute allowedRoles={['Platform Super Admin']}>
          <AdminPortal />
        </ProtectedRoute>
      )}

      {currentUser.role === 'Citizen' && (
        <ProtectedRoute allowedRoles={['Citizen']}>
          <CitizenPortal />
        </ProtectedRoute>
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
