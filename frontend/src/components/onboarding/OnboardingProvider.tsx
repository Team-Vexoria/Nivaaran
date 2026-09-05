import React, { createContext, useContext, ReactNode } from 'react';
import { useOnboarding } from '../../hooks/useOnboarding';

interface OnboardingContextType {
  hasOnboarded: boolean;
  showModal: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  openDiscoveryMap: () => void;
  setShowModal: (show: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const onboardingState = useOnboarding();

  return (
    <OnboardingContext.Provider value={onboardingState}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within OnboardingProvider');
  }
  return context;
};
