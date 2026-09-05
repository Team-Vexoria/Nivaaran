import React from 'react';
import { X, MapPin, Sparkles, Clock, Calendar, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { LandmarkPOI, StateRegionData } from '../../data/indiaDiscoveryData';

interface DiscoveryDrawerProps {
  landmark?: LandmarkPOI | null;
  state?: StateRegionData | null;
  onClose: () => void;
  onExploreCity?: (cityName: string) => void;
}

export const DiscoveryDrawer: React.FC<DiscoveryDrawerProps> = ({
  landmark,
  state,
  onClose,
  onExploreCity,
}) => {
  if (!landmark && !state) return null;

  const handleExplore = (targetCity: string) => {
    if (onExploreCity) {
      onExploreCity(targetCity);
    } else {
      window.location.href = `/explore?city=${encodeURIComponent(targetCity)}`;
    }
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[420px] z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div className="bg-[#121B2B]/95 backdrop-blur-xl border border-white/15 text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-all"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
        
        {landmark ? (
          <div>
            <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
              <img
                src={landmark.image}
                alt={landmark.name}
                className="w-full h-full object-cover brightness-90 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121B2B] via-transparent to-black/30" />

              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span
                  style={{ backgroundColor: `${landmark.categoryColor}25`, borderColor: landmark.categoryColor, color: '#FFFFFF' }}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-full border backdrop-blur-md shadow-xs flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  {landmark.category}
                </span>
              </div>

              {landmark.verified && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Sight
                </div>
              )}

              <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                {landmark.rating}
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center text-xs text-amber-200/90 font-medium mb-0.5">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" />
                  <span>{landmark.city}, {landmark.state}</span>
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">{landmark.name}</h3>
                <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">{landmark.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Entry</span>
                  <span className="text-xs font-bold text-emerald-400 block truncate">{landmark.entryFee}</span>
                </div>
                <div className="space-y-0.5 border-x border-white/10 px-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> Time
                  </span>
                  <span className="text-xs font-semibold text-white block truncate">{landmark.duration}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                    <Calendar className="w-2.5 h-2.5" /> Best Season
                  </span>
                  <span className="text-xs font-semibold text-amber-200 block truncate">{landmark.bestTime}</span>
                </div>
              </div>

              <button
                onClick={() => handleExplore(landmark.city)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4A373] via-[#E9C46A] to-[#F4A261] text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <span>Explore Full Itinerary in {landmark.city}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : state ? (
          <div>
            <div className="relative h-36 w-full bg-slate-900 overflow-hidden">
              <img src={state.bannerImage} alt={state.name} className="w-full h-full object-cover brightness-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121B2B] via-transparent to-black/30" />
              <div className="absolute bottom-3 left-4">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{state.zone} India Region</span>
                <h3 className="text-xl font-black text-white">{state.name}</h3>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">{state.description}</p>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Famous For</span>
                <div className="flex flex-wrap gap-1.5">
                  {state.popularFor.map((item, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[11px] font-medium border border-white/10">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleExplore(state.capital || state.name)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#264653] text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Discover All {state.name} Sights ({state.topPlacesCount})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
