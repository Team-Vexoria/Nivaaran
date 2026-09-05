import React, { useState } from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { usePOIImage } from '../../hooks/usePOIImage';

export interface POIData {
  id?: string;
  name: string;
  city?: string;
  location?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  imageSource?: 'wikidata_p18' | 'wikipedia_canonical' | 'wikimedia_commons' | 'google_places' | 'fallback';
  imageAttribution?: string;
}

interface ExplorePOICardProps {
  poi: POIData;
  onSelect?: (poi: POIData) => void;
}

export const ExplorePOICard: React.FC<ExplorePOICardProps> = ({ poi, onSelect }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Dynamically resolve photo if not pre-populated by backend
  const { imageUrl: dynamicImageUrl, loading: dynamicLoading } = usePOIImage(
    !poi.imageUrl ? poi.name : '',
    !poi.imageUrl ? poi.city || poi.location : undefined
  );

  const activeImageUrl = poi.imageUrl || dynamicImageUrl;
  const activeAttribution = poi.imageAttribution || (dynamicImageUrl ? 'Verified Landmark Photograph' : undefined);
  const isLoading = !poi.imageUrl && dynamicLoading;

  const cityName = poi.city || poi.location || 'Explore';
  const categoryName = poi.category || 'Landmark';

  return (
    <div
      onClick={() => onSelect && onSelect(poi)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* ── Image Header ── */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
        {/* Skeleton Shimmer when loading */}
        {(isLoading || (!imageLoaded && !imageError && !!activeImageUrl)) && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse z-10" />
        )}

        {/* Dynamic Verified Photo */}
        {!imageError && activeImageUrl ? (
          <img
            src={activeImageUrl}
            alt={`${poi.name}, ${cityName}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          /* Graceful Themed Fallback Graphic */
          <div className="w-full h-full bg-gradient-to-br from-[#1E3A5F] via-[#2A4365] to-[#0F766E] flex flex-col items-center justify-center p-6 text-center text-white relative">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-2 border border-white/20">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/90">
              {cityName}
            </span>
            <span className="text-sm font-bold text-white line-clamp-1 mt-0.5">
              {poi.name}
            </span>
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-3 left-3 z-20">
          <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold rounded-full border border-white/20 shadow-xs">
            {categoryName}
          </span>
        </div>

        {/* Attribution Badge (Subtle on Hover) */}
        {activeAttribution && !imageError && (
          <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] text-slate-300 truncate max-w-[80%]">
            {activeAttribution}
          </div>
        )}
      </div>

      {/* ── Card Content ── */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center text-xs font-medium text-slate-500 mb-1">
            <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
            <span className="truncate">{cityName}</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[#1E3A5F] transition-colors line-clamp-1">
            {poi.name}
          </h3>
        </div>

        {poi.description && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {poi.description}
          </p>
        )}
      </div>
    </div>
  );
};
