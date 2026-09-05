import React from 'react';
import { motion } from 'framer-motion';
import { Place } from '../../lib/placesData';
import { Badge } from '../ui/Badge';
import { ExternalLink, IndianRupee } from 'lucide-react';
import { cardHover } from '../../utils/animations';

interface LocationCardProps {
  place: Place;
  onExplore: (place: Place) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({ place, onExplore }) => {
  const categoryVariantMap: Record<Place['category'], any> = {
    'Heritage & History': 'heritage',
    'Spiritual': 'spiritual',
    'Nature': 'nature',
    'Adventure': 'adventure',
    'Cultural': 'cultural',
    'Beach': 'beach',
    'Wildlife': 'wildlife'
  };

  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={cardHover}
      onClick={() => onExplore(place)}
    >
      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-xl">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-500/20 to-purple-600/20">
          <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
            Image: {place.name}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
              {place.name}
            </h3>
          </div>

          <Badge variant={categoryVariantMap[place.category]}>
            {place.category}
          </Badge>

          <p className="text-white/60 text-sm mt-3 mb-4 line-clamp-2">
            {place.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              {place.entryFee === 'FREE ENTRY' ? (
                <span className="text-green-400">FREE ENTRY</span>
              ) : (
                <>
                  <IndianRupee size={16} />
                  <span>{place.entryFee.replace('₹', '')}</span>
                </>
              )}
            </div>

            <button className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors">
              <span>Explore</span>
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
