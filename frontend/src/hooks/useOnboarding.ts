import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'has_onboarded_lokiva';

export const useOnboarding = () => {
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    // Check localStorage on mount
    const onboardingStatus = localStorage.getItem(ONBOARDING_KEY);
    
    if (onboardingStatus === 'true') {
      setHasOnboarded(true);
      setShowModal(false);
    } else {
      setHasOnboarded(false);
      setShowModal(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setHasOnboarded(true);
    setShowModal(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setHasOnboarded(false);
    setShowModal(true);
  };

  const openDiscoveryMap = () => {
    setShowModal(true);
  };

  return {
    hasOnboarded,
    showModal,
    completeOnboarding,
    resetOnboarding,
    openDiscoveryMap,
    setShowModal
  };
};
