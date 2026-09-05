import React from 'react';
import { MapPin, Search, Sparkles, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectKnownDestination: () => void;
  onSelectExplore: () => void;
}

export const LocationDecisionModal: React.FC<Props> = ({
  isOpen, onClose, onSelectKnownDestination, onSelectExplore
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-4xl pointer-events-auto">
          <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-pink-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white">
              <X size={24} />
            </button>
            <div className="relative z-10 p-8 md:p-12">
              <div className="text-center mb-8 md:mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-4 md:mb-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  <Sparkles size={32} className="text-white" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 font-heading">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">LOKIVA</span>
                </h2>
                <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
                  Your journey to discover India's hidden gems starts here. How would you like to begin?
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                <button
                  onClick={onSelectKnownDestination}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/20 p-6 md:p-8 text-left hover:border-amber-500/50 transition-all transform hover:-translate-y-1"
                >
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20">
                      <Search size={24} className="text-amber-400" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                      I Know Where I Want to Go
                    </h3>
                    <p className="text-sm md:text-base text-white/60">
                      Jump straight to search and find your destination
                    </p>
                  </div>
                </button>
                <button
                  onClick={onSelectExplore}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-sm border border-purple-500/30 p-6 md:p-8 text-left hover:border-purple-500/60 transition-all transform hover:-translate-y-1"
                >
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20">
                      <MapPin size={24} className="text-purple-400" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      Help Me Decide / Explore India
                    </h3>
                    <p className="text-sm md:text-base text-white/60">
                      Discover hidden gems through interactive map
                    </p>
                  </div>
                </button>
              </div>
              <div className="text-center mt-6 md:mt-8">
                <button onClick={onClose} className="text-white/50 hover:text-white/80 text-sm transition-colors">
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
