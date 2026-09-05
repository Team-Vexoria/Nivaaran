import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  Compass,
  Layers,
  X,
} from 'lucide-react';
import {
  INDIA_STATES_DATA,
  POPULAR_LANDMARKS,
  ZONES,
  CATEGORIES,
  ZoneType,
  LandmarkPOI,
  StateRegionData,
} from '../../data/indiaDiscoveryData';
import { INDIA_CENTER, INDIA_BOUNDS, STATE_CENTERS } from '../../data/indiaGeoData';
import { LANDMARK_GPS_COORDINATES, MAJOR_DISTRICTS, DistrictInfo } from '../../data/landmarkCoordinates';
import { DiscoveryDrawer } from './DiscoveryDrawer';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon paths for bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons for different categories
const createCustomIcon = (color: string, isHidden: boolean = false) => {
  const svgIcon = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" 
            fill="${color}" stroke="#fff" stroke-width="2"/>
      ${isHidden ? '<circle cx="16" cy="16" r="6" fill="#fff"/><text x="16" y="20" text-anchor="middle" fill="' + color + '" font-size="12" font-weight="bold">★</text>' : '<circle cx="16" cy="16" r="5" fill="#fff"/>'}
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
    className: 'custom-map-marker',
  });
};

// Map view controller component
const MapViewController: React.FC<{
  center: [number, number];
  zoom: number;
}> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [center, zoom, map]);
  
  return null;
};

type ViewLevel = 'country' | 'state' | 'district';

interface IndiaDiscoveryMapProps {
  onSelectLandmark?: (landmark: LandmarkPOI) => void;
  onExploreCity?: (cityName: string) => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const IndiaDiscoveryMap: React.FC<IndiaDiscoveryMapProps> = ({
  onSelectLandmark,
  onExploreCity,
  className = '',
  isOpen = true,
  onClose,
}) => {
  const [viewLevel, setViewLevel] = useState<ViewLevel>('country');
  const [selectedZone, setSelectedZone] = useState<ZoneType>('All India');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [selectedLandmark, setSelectedLandmark] = useState<LandmarkPOI | null>(null);
  const [selectedState, setSelectedState] = useState<StateRegionData | null>(null);
  const [_selectedDistrict, setSelectedDistrict] = useState<DistrictInfo | null>(null);
  
  const mapRef = useRef<L.Map | null>(null);
  
  // Dynamic map center and zoom based on view level
  const [mapCenter, setMapCenter] = useState<[number, number]>([INDIA_CENTER.lat, INDIA_CENTER.lng]);
  const [mapZoom, setMapZoom] = useState<number>(5);

  // Filtered data based on zone, category, and search
  const filteredStates = useMemo(() => {
    return INDIA_STATES_DATA.filter((state) => {
      const matchZone = selectedZone === 'All India' || state.zone === selectedZone;
      const matchSearch =
        !searchQuery ||
        state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        state.capital.toLowerCase().includes(searchQuery.toLowerCase());
      return matchZone && matchSearch;
    });
  }, [selectedZone, searchQuery]);

  const filteredLandmarks = useMemo(() => {
    return POPULAR_LANDMARKS.filter((item) => {
      const matchZone =
        selectedZone === 'All India' ||
        INDIA_STATES_DATA.find((s) => s.name === item.state)?.zone === selectedZone;
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.state.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Also filter by selected state if in state view
      const matchState = !selectedState || item.state === selectedState.name;
      
      return matchZone && matchCategory && matchSearch && matchState;
    });
  }, [selectedZone, selectedCategory, searchQuery, selectedState]);

  const filteredDistricts = useMemo(() => {
    if (!selectedState) return [];
    return MAJOR_DISTRICTS.filter(d => d.state === selectedState.name);
  }, [selectedState]);

  // Handlers for zoom and navigation
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleResetZoom = () => {
    setViewLevel('country');
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedLandmark(null);
    setMapCenter([INDIA_CENTER.lat, INDIA_CENTER.lng]);
    setMapZoom(5);
  };

  const handleStateClick = (state: StateRegionData) => {
    const stateCenter = STATE_CENTERS[state.name];
    if (stateCenter) {
      setSelectedState(state);
      setSelectedLandmark(null);
      setSelectedDistrict(null);
      setViewLevel('state');
      setMapCenter([stateCenter.lat, stateCenter.lng]);
      setMapZoom(7);
    }
  };

  const handleDistrictClick = (district: DistrictInfo) => {
    setSelectedDistrict(district);
    setSelectedLandmark(null);
    setViewLevel('district');
    setMapCenter([district.coordinates.lat, district.coordinates.lng]);
    setMapZoom(10);
  };

  const handleLandmarkClick = (landmark: LandmarkPOI) => {
    setSelectedLandmark(landmark);
    if (onSelectLandmark) {
      onSelectLandmark(landmark);
    }
  };

  const handleCloseDrawer = () => {
    setSelectedLandmark(null);
    setSelectedState(null);
  };

  const handleExplore = (cityName: string) => {
    if (onExploreCity) {
      onExploreCity(cityName);
    }
  };

  // Step navigation
  const handleStepClick = (level: ViewLevel) => {
    if (level === 'country') {
      handleResetZoom();
    } else if (level === 'state' && selectedState) {
      handleStateClick(selectedState);
    }
    setViewLevel(level);
  };

  // Get GPS coordinates for landmark
  const getLandmarkGPS = (landmark: LandmarkPOI): [number, number] => {
    const gps = LANDMARK_GPS_COORDINATES[landmark.id];
    if (gps) {
      return [gps.lat, gps.lng];
    }
    // Fallback: use state center
    const stateCenter = STATE_CENTERS[landmark.state];
    if (stateCenter) {
      return [stateCenter.lat + (Math.random() - 0.5) * 0.5, stateCenter.lng + (Math.random() - 0.5) * 0.5];
    }
    return [INDIA_CENTER.lat, INDIA_CENTER.lng];
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-[#0A101D] ${className}`}>
      {/* Close button for modal mode */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[1000] p-2.5 rounded-xl bg-[#121B2B]/90 backdrop-blur-xl border border-white/15 text-white hover:bg-white/20 active:scale-95 transition-all shadow-xl"
          title="Close Map"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Top Floating Header */}
      <div className="absolute top-4 left-4 right-4 z-[900] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-none">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#121B2B]/90 backdrop-blur-xl border border-white/15 shadow-lg">
            <Compass className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block leading-none">
                NIVAARAN DISCOVERY
              </span>
              <span className="text-sm font-black text-white leading-tight">
                Interactive India Map
              </span>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sight, city, or state..."
              className="w-full sm:w-60 pl-9 pr-3 py-2 text-xs rounded-2xl bg-[#121B2B]/90 backdrop-blur-xl border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/80 shadow-lg transition-all"
            />
          </div>
        </div>

        {/* Zone filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 pointer-events-auto scrollbar-none">
          {ZONES.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                selectedZone === zone
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-[#121B2B]/80 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-md'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Category Chips */}
      <div className="absolute top-28 md:top-20 left-4 right-4 z-[900] flex items-center gap-1.5 overflow-x-auto pb-1 pointer-events-auto scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap border flex items-center gap-1.5 ${
              selectedCategory === cat.value
                ? 'bg-white/20 text-white border-white/40 backdrop-blur-md shadow-xs'
                : 'bg-[#121B2B]/70 text-slate-400 border-white/5 hover:text-slate-200 hover:bg-white/10 backdrop-blur-md'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: cat.color }}
            />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Step Navigation */}
      <div className="absolute top-44 md:top-32 left-4 z-[900] flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => handleStepClick('country')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
            viewLevel === 'country'
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-[#121B2B]/80 text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <Layers className="w-3 h-3" />
          1. States
        </button>
        <button
          onClick={() => selectedState && handleStepClick('state')}
          disabled={!selectedState}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
            viewLevel === 'state'
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-[#121B2B]/80 text-slate-300 border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          <Layers className="w-3 h-3" />
          2. Districts
        </button>
        <button
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
            viewLevel === 'district'
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-[#121B2B]/80 text-slate-300 border-white/10'
          }`}
        >
          <MapPin className="w-3 h-3" />
          3. Places
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 left-6 z-[900] flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="p-2.5 rounded-xl bg-[#121B2B]/90 backdrop-blur-xl border border-white/15 text-white hover:bg-white/20 active:scale-95 transition-all shadow-xl"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 rounded-xl bg-[#121B2B]/90 backdrop-blur-xl border border-white/15 text-white hover:bg-white/20 active:scale-95 transition-all shadow-xl"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2.5 rounded-xl bg-[#121B2B]/90 backdrop-blur-xl border border-white/15 text-amber-400 hover:bg-white/20 active:scale-95 transition-all shadow-xl"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={[INDIA_CENTER.lat, INDIA_CENTER.lng]}
        zoom={5}
        ref={mapRef}
        style={{ height: '100%', width: '100%', background: '#0A101D' }}
        zoomControl={false}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={0.7}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        <MapViewController center={mapCenter} zoom={mapZoom} />

        {/* State Markers (shown in country view) */}
        {viewLevel === 'country' && filteredStates.map((state) => {
          const center = STATE_CENTERS[state.name];
          if (!center) return null;
          return (
            <CircleMarker
              key={state.id}
              center={[center.lat, center.lng]}
              radius={8}
              fillColor="#F4A261"
              fillOpacity={0.8}
              color="#fff"
              weight={2}
              eventHandlers={{
                click: () => handleStateClick(state),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                <div className="text-xs font-bold">
                  <div className="text-amber-900">{state.name}</div>
                  <div className="text-[10px] text-slate-600">{state.capital}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* District Markers (shown in state view) */}
        {viewLevel === 'state' && filteredDistricts.map((district) => (
          <CircleMarker
            key={district.name}
            center={[district.coordinates.lat, district.coordinates.lng]}
            radius={6}
            fillColor="#2A9D8F"
            fillOpacity={0.7}
            color="#fff"
            weight={2}
            eventHandlers={{
              click: () => handleDistrictClick(district),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div className="text-xs font-bold text-teal-900">{district.name}</div>
            </Tooltip>
          </CircleMarker>
        ))}

        {/* Landmark Markers (shown at all zoom levels based on filters) */}
        {filteredLandmarks.map((landmark) => {
          const position = getLandmarkGPS(landmark);
          const icon = createCustomIcon(landmark.categoryColor);
          
          return (
            <Marker
              key={landmark.id}
              position={position}
              icon={icon}
              eventHandlers={{
                click: () => handleLandmarkClick(landmark),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-slate-900">{landmark.name}</div>
                  <div className="text-xs text-slate-600">{landmark.city}, {landmark.state}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">{landmark.entryFee}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Discovery Drawer */}
      {(selectedLandmark || selectedState) && (
        <DiscoveryDrawer
          landmark={selectedLandmark}
          state={selectedState}
          onClose={handleCloseDrawer}
          onExploreCity={handleExplore}
        />
      )}
    </div>
  );
};

