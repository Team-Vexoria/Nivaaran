import React, { useState } from 'react';
import { LocationDecisionModal } from './components/onboarding/LocationDecisionModal';
import { IndiaDiscoveryMap } from './components/discovery/IndiaDiscoveryMap';
import { useOnboarding } from './hooks/useOnboarding';
import { MapPin } from 'lucide-react';

/**
 * LOKIVA Travel Platform - Main Integration Component
 * 
 * This component demonstrates how to integrate the onboarding and discovery system
 * into your existing application.
 */
export const LoKivaIntegration: React.FC = () => {
  const { showModal, setShowModal, completeOnboarding } = useOnboarding();
  const [showDiscoveryMap, setShowDiscoveryMap] = useState(false);

  const handleKnownDestination = () => {
    completeOnboarding();
    setShowModal(false);
    // Redirect to search page or scroll to search component
    window.location.href = '/explore';
  };

  const handleExploreIndia = () => {
    completeOnboarding();
    setShowModal(false);
    setShowDiscoveryMap(true);
  };

  const handleCloseModal = () => {
    completeOnboarding();
    setShowModal(false);
  };

  const handleCloseMap = () => {
    setShowDiscoveryMap(false);
  };

  const handleOpenMapManually = () => {
    setShowDiscoveryMap(true);
  };

  return (
    <>
      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Hero Section */}
        <div className="relative h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
          
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">LOKIVA</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-2xl mx-auto">
              Your gateway to exploring India's most breathtaking destinations
            </p>
            
            {/* Manual trigger button for returning users */}
            <button
              onClick={handleOpenMapManually}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <MapPin size={20} />
              <span>Explore Interactive Map</span>
            </button>
          </div>
        </div>

        {/* More content here... */}
      </div>

      {/* Onboarding Modal - Shows on first visit */}
      <LocationDecisionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSelectKnownDestination={handleKnownDestination}
        onSelectExplore={handleExploreIndia}
      />

      {/* Interactive Discovery Map */}
      <IndiaDiscoveryMap
        isOpen={showDiscoveryMap}
        onClose={handleCloseMap}
      />
    </>
  );
};

export default LoKivaIntegration;
