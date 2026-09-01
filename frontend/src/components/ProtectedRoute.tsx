import React from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="flex items-center space-x-3 text-nivaaran-primary">
          <div className="w-6 h-6 border-2 border-nivaaran-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Authenticating user portal...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl border border-sand max-w-md w-full text-center space-y-4 shadow-md">
          <div className="w-12 h-12 bg-nivaaran-accent/10 text-nivaaran-accent rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-nivaaran-primary">Authentication Required</h2>
          <p className="text-sm text-charcoal/70">
            Please sign in to access this NIVAARAN portal.
          </p>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl border border-terracotta/30 max-w-md w-full text-center space-y-4 shadow-md">
          <div className="w-12 h-12 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-terracotta">Access Denied (RBAC Restricted)</h2>
          <p className="text-sm text-charcoal/70">
            Your role (<strong className="text-nivaaran-primary">{currentUser.role}</strong>) does not have permission to view this portal.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
