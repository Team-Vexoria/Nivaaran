import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChallengeDoc } from '../../services/firebaseService';
import {
  DistrictStat,
  JHARKHAND_BOUNDS,
  JHARKHAND_CENTER,
  JHARKHAND_DISTRICT_CENTROIDS,
  JHARKHAND_HEI_LABS,
  JHARKHAND_DISASTER_ZONES,
  JHARKHAND_DISTRICT_RISK_INDEX,
  getSeverityColor,
} from '../../services/mapDataService';
import { ChallengePopupCard } from './ChallengePopupCard';
import ReactDOM from 'react-dom/client';
import { useLanguage, LanguageProvider } from '../../context/LanguageContext';
import { Layers, CloudRain, AlertTriangle, Building2, Droplets, Radio, ChevronDown } from 'lucide-react';

// Fix default Leaflet icon broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewportProps {
  challenges: ChallengeDoc[];
  districtStats: Record<string, DistrictStat>;
  selectedDistrict: string | null;
  onDistrictSelect: (district: string | null) => void;
  govtMode?: boolean;
  onValidate?: (challengeId: string) => void;
  onRequestEvidence?: (challengeId: string) => void;
}

function createPinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 14px; height: 14px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createCentroidIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 8px; height: 8px;
        background: #C98A2C;
        border: 2px solid white;
        border-radius: 50%;
        opacity: 0.7;
      "></div>`,
    iconSize: [8, 8],
    iconAnchor: [4, 4],
  });
}

function createHEILabIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 22px; height: 22px;
        background: #1E3A8A;
        border: 2px solid #60A5FA;
        border-radius: 6px;
        box-shadow: 0 3px 8px rgba(30,58,138,0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 11px;
        font-weight: 900;
      ">🏛️</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function createDisasterPinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 20px; height: 20px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 12px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        animation: pulse 1.8s infinite;
      ">⚠️</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export const MapViewport: React.FC<MapViewportProps> = ({
  challenges,
  districtStats,
  selectedDistrict,
  onDistrictSelect,
  govtMode = false,
  onValidate,
  onRequestEvidence,
}) => {
  const { t } = useLanguage();
  const mapRef = useRef<L.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const centroidLayerRef = useRef<L.LayerGroup | null>(null);
  const heiLabsLayerRef = useRef<L.LayerGroup | null>(null);
  const disasterZonesLayerRef = useRef<L.LayerGroup | null>(null);
  const weatherRadarLayerRef = useRef<L.TileLayer | null>(null);
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);

  // ── GIS Interactive Layer Controls State ──
  const [showIncidents, setShowIncidents] = useState(true);
  const [showHEILabs, setShowHEILabs] = useState(true);
  const [showDisasterZones, setShowDisasterZones] = useState(true);
  const [showWeatherRadar, setShowWeatherRadar] = useState(true);
  const [showRiskHeatmap, setShowRiskHeatmap] = useState(false);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  // Load GeoJSON once
  useEffect(() => {
    fetch('/jharkhand_districts.geojson')
      .then(r => r.json())
      .then(data => setGeoData(data))
      .catch(() => {
        console.warn('[MapViewport] GeoJSON not found, using centroid markers only.');
      });
  }, []);

  // Init map
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: JHARKHAND_CENTER,
      zoom: 7,
      minZoom: 6,
      maxZoom: 16,
      maxBounds: [[19.5, 81.5], [27.0, 89.5]],
      maxBoundsViscosity: 0.85,
      zoomControl: false,
    });

    // Custom positioned zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // High clarity CartoDB Voyager base map with OpenStreetMap data and authenticated API key
    const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY || 'cb1_2x3k_1_ad093820ec9951ca03fd4793';
    const cartoTileUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${cartoApiKey}`;
    L.tileLayer(cartoTileUrl, {
      attribution: '&copy; OpenStreetMap contributors, CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    map.fitBounds(JHARKHAND_BOUNDS);

    markersLayerRef.current = L.layerGroup().addTo(map);
    centroidLayerRef.current = L.layerGroup().addTo(map);
    heiLabsLayerRef.current = L.layerGroup().addTo(map);
    disasterZonesLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const resizeTimer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const resizeTimer2 = setTimeout(() => {
      map.invalidateSize();
    }, 350);

    return () => {
      clearTimeout(resizeTimer1);
      clearTimeout(resizeTimer2);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Live Weather Radar Layer Visibility
  useEffect(() => {
    const map = mapRef.current;
    const radar = weatherRadarLayerRef.current;
    if (!map || !radar) return;

    if (showWeatherRadar) {
      if (!map.hasLayer(radar)) radar.addTo(map);
    } else {
      if (map.hasLayer(radar)) map.removeLayer(radar);
    }
  }, [showWeatherRadar]);

  // Update GeoJSON choropleth layer (Incidents vs Risk Heatmap)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoData) return;

    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.remove();
    }

    const maxTotal = Math.max(...Object.values(districtStats).map(d => d.total), 1);

    geoJsonLayerRef.current = L.geoJSON(geoData, {
      style: (feature) => {
        const distName = feature?.properties?.district as string | undefined;
        const stat = distName ? districtStats[distName] : undefined;
        const count = stat?.total ?? 0;
        const isSelected = distName === selectedDistrict;
        const riskProfile = distName ? JHARKHAND_DISTRICT_RISK_INDEX[distName] : undefined;

        if (showRiskHeatmap && riskProfile) {
          // Color based on composite disaster risk score
          const riskColor =
            riskProfile.hazardLevel === 'CRITICAL' ? '#DC2626' :
            riskProfile.hazardLevel === 'HIGH'     ? '#EA580C' :
            riskProfile.hazardLevel === 'MODERATE' ? '#CA8A04' : '#16A34A';
          return {
            fillColor: riskColor,
            fillOpacity: isSelected ? 0.65 : 0.38,
            color: isSelected ? '#991B1B' : '#78350F',
            weight: isSelected ? 2.5 : 1.2,
            opacity: 0.9,
          };
        }

        const opacity = count > 0 ? 0.08 + (count / maxTotal) * 0.37 : 0.04;
        const fillColor =
          (stat?.critical ?? 0) > 0 ? '#B3261E' :
          (stat?.high ?? 0) > 0     ? '#B45309' :
          (stat?.medium ?? 0) > 0   ? '#C98A2C' :
          count > 0                  ? '#2C6E49' : '#B0A89A';

        return {
          fillColor,
          fillOpacity: isSelected ? Math.min(opacity + 0.2, 0.65) : opacity,
          color: isSelected ? '#2C6E49' : '#C4BDB0',
          weight: isSelected ? 2.5 : 1,
          opacity: 1,
        };
      },
      onEachFeature: (feature, layer) => {
        const distName = feature.properties?.district as string;
        const stat = districtStats[distName];
        const riskProfile = JHARKHAND_DISTRICT_RISK_INDEX[distName];

        layer.on('click', () => {
          lastGeoClickRef.current = distName;
          onDistrictSelect(distName === selectedDistrict ? null : distName);
          const centroid = JHARKHAND_DISTRICT_CENTROIDS[distName];
          if (centroid) map.flyTo([centroid.lat, centroid.lng], 9, { duration: 0.8 });
        });

        layer.on('mouseover', (e) => {
          (e.target as L.Path).setStyle({ weight: 2.5, color: '#1E3A8A' });
          let tooltipContent = `<strong>${distName} District</strong><br/>`;
          if (showRiskHeatmap && riskProfile) {
            tooltipContent += `
              <div class="text-[11px] leading-tight pt-1">
                <span class="font-bold text-red-700">Threat: ${riskProfile.primaryThreat}</span><br/>
                <span>Flood Risk: <strong>${riskProfile.floodScore}/100</strong> | Drought Risk: <strong>${riskProfile.droughtScore}/100</strong></span><br/>
                <span>Rainfall Anomaly: <strong>${riskProfile.monsoonRainfallAnomalyPct > 0 ? '+' : ''}${riskProfile.monsoonRainfallAnomalyPct}%</strong></span>
              </div>`;
          } else {
            const tooltipText = (t.map.districtTooltip || '{distName}: {count} reports')
              .replace('{distName}', distName)
              .replace('{count}', String(stat?.total ?? 0));
            tooltipContent += `${tooltipText}`;
          }

          const tooltip = L.tooltip({ permanent: false, direction: 'center', className: 'nivaaran-district-tooltip' })
            .setContent(tooltipContent)
            .setLatLng((layer as L.Polygon).getBounds().getCenter());
          map.openTooltip(tooltip);
        });

        layer.on('mouseout', (e) => {
          geoJsonLayerRef.current?.resetStyle(e.target as L.Path);
          map.closeTooltip();
        });
      },
    }).addTo(map);
  }, [geoData, districtStats, selectedDistrict, onDistrictSelect, showRiskHeatmap, t]);

  // Update HEI University Labs Layer
  useEffect(() => {
    const heiLayer = heiLabsLayerRef.current;
    if (!heiLayer) return;
    heiLayer.clearLayers();

    if (!showHEILabs) return;

    for (const lab of JHARKHAND_HEI_LABS) {
      const icon = createHEILabIcon();
      const marker = L.marker([lab.lat, lab.lng], { icon });

      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; color: #0F172A; min-width: 240px; padding: 4px;">
          <div style="font-size: 10px; font-weight: 800; color: #1E3A8A; text-transform: uppercase; letter-spacing: 0.05em;">
            🏛️ Active HEI Research Hub
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 2px;">
            ${lab.name}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #475569; margin-top: 1px;">
            ${lab.university} (${lab.district})
          </div>
          <div style="margin-top: 6px; padding: 6px; background: #F1F5F9; border-radius: 6px; border: 1px solid #E2E8F0;">
            <div style="font-size: 10px; font-weight: 700; color: #334155;">Specialization:</div>
            <div style="font-size: 11px; font-weight: 600; color: #0F172A;">${lab.specialization}</div>
            <div style="font-size: 10px; font-weight: 700; color: #059669; margin-top: 4px;">
              ⚡ ${lab.activeProjectsCount} Active Student R&D Projects
            </div>
          </div>
          <div style="font-size: 10px; color: #64748B; margin-top: 6px;">
            Faculty Lead: ${lab.contactFaculty}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 290 });
      marker.addTo(heiLayer);
    }
  }, [showHEILabs]);

  // Update Disaster & Hazard Zones Layer
  useEffect(() => {
    const disasterLayer = disasterZonesLayerRef.current;
    if (!disasterLayer) return;
    disasterLayer.clearLayers();

    if (!showDisasterZones) return;

    for (const zone of JHARKHAND_DISASTER_ZONES) {
      // 1. Draw glowing danger zone circle
      const circle = L.circle([zone.center.lat, zone.center.lng], {
        radius: zone.radiusMeters,
        color: zone.color,
        weight: 1.5,
        fillColor: zone.color,
        fillOpacity: 0.15,
        dashArray: '6, 6',
      });
      circle.addTo(disasterLayer);

      // 2. Draw center hazard warning pin
      const icon = createDisasterPinIcon(zone.color);
      const marker = L.marker([zone.center.lat, zone.center.lng], { icon });

      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; color: #0F172A; min-width: 250px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10px; font-weight: 900; color: ${zone.color}; text-transform: uppercase;">
              ⚠️ ${zone.hazardType}
            </span>
            <span style="font-size: 9px; font-weight: 800; background: ${zone.color}20; color: ${zone.color}; padding: 2px 6px; border-radius: 4px;">
              ${zone.severity} RISK
            </span>
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 3px;">
            ${zone.name}
          </div>
          <p style="font-size: 11px; color: #334155; margin-top: 4px; line-height: 1.4;">
            ${zone.description}
          </p>
          <div style="margin-top: 6px; padding: 5px 8px; background: #FEF2F2; border: 1px solid #F87171; border-radius: 6px; font-size: 10px; font-weight: 700; color: #991B1B;">
            👥 Impacted: ${zone.vulnerablePopulation}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });
      marker.addTo(disasterLayer);
    }
  }, [showDisasterZones]);

  // Update challenge pin markers (Citizen Incidents)
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    const centroidLayer = centroidLayerRef.current;
    if (!markersLayer || !centroidLayer) return;

    markersLayer.clearLayers();
    centroidLayer.clearLayers();

    if (!showIncidents) return;

    // Render challenge pins
    for (const ch of challenges) {
      const coords = ch.locationCoords;
      if (!coords?.lat || !coords?.lng) continue;

      const color = getSeverityColor(ch.riskLevel);
      const icon = createPinIcon(color);

      const marker = L.marker([coords.lat, coords.lng], { icon });

      // Build popup content
      const container = document.createElement('div');
      const root = ReactDOM.createRoot(container);
      root.render(
        React.createElement(
          LanguageProvider,
          null,
          React.createElement(ChallengePopupCard, {
            challenge: ch,
            govtMode,
            onValidate,
            onRequestEvidence,
          })
        )
      );

      marker.bindPopup(container, { maxWidth: 310, minWidth: 288 });
      marker.addTo(markersLayer);
    }

    // Centroid fallback markers for districts with no geo-tagged challenges
    const districtsWithPins = new Set(
      challenges.filter(c => c.locationCoords?.lat).map(c => c.district)
    );

    for (const [dist, centroid] of Object.entries(JHARKHAND_DISTRICT_CENTROIDS)) {
      if (districtsWithPins.has(dist)) continue;
      const stat = districtStats[dist];
      if (!stat || stat.total === 0) continue;

      const icon = createCentroidIcon();
      const marker = L.marker([centroid.lat, centroid.lng], { icon });
      const markerTooltip = (t.map.noGpsCoords || '{count} reports in {distName}')
        .replace('{distName}', dist)
        .replace('{count}', String(stat.total));
      marker.bindTooltip(markerTooltip, { direction: 'top' });
      marker.addTo(centroidLayer);
    }
  }, [challenges, districtStats, govtMode, onValidate, onRequestEvidence, showIncidents, t]);

  // Fly-to when district selected
  const lastGeoClickRef = useRef<string | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedDistrict) return;
    if (lastGeoClickRef.current === selectedDistrict) {
      lastGeoClickRef.current = null;
      return;
    }
    const centroid = JHARKHAND_DISTRICT_CENTROIDS[selectedDistrict];
    if (centroid) map.flyTo([centroid.lat, centroid.lng], 9, { duration: 0.8 });
  }, [selectedDistrict]);

  return (
    <div className="flex-1 relative h-full min-h-[520px] w-full">
      {/* Leaflet Map DOM Node */}
      <div 
        ref={mapDivRef} 
        className="w-full h-full min-h-[520px]" 
        style={{ minHeight: '520px', height: '100%', width: '100%' }}
      />

      {/* ── Interactive GIS Layer Control Switcher HUD (Floating Top-Right) ── */}
      <div className="absolute top-3 right-3 z-[1000]">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden w-64 transition-all">
          
          {/* Header Bar */}
          <button
            type="button"
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black tracking-tight">GIS Disaster Layers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" /> LIVE
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${isLayerMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Collapsible Layer Toggles Body */}
          <div className={`p-3 space-y-2 text-xs transition-all ${isLayerMenuOpen ? 'block' : 'hidden sm:block'}`}>
            
            {/* 1. Citizen Incidents Toggle */}
            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-2xs" />
                <span className="font-bold text-slate-800 text-[11px]">Citizen Incidents</span>
              </div>
              <input
                type="checkbox"
                checked={showIncidents}
                onChange={(e) => setShowIncidents(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </label>

            {/* 2. Active HEI Labs Toggle */}
            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                <div>
                  <span className="font-bold text-slate-800 text-[11px] block">HEI Research Labs</span>
                  <span className="text-[9px] text-slate-500 block">6 University Centers</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showHEILabs}
                onChange={(e) => setShowHEILabs(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </label>

            {/* 3. High-Risk Disaster Zones Toggle */}
            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <div>
                  <span className="font-bold text-slate-800 text-[11px] block">Disaster Hazard Zones</span>
                  <span className="text-[9px] text-slate-500 block">5 Critical Basins</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showDisasterZones}
                onChange={(e) => setShowDisasterZones(e.target.checked)}
                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
              />
            </label>

            {/* 4. Live Precipitation Radar Toggle */}
            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <CloudRain className="w-3.5 h-3.5 text-cyan-600" />
                <div>
                  <span className="font-bold text-slate-800 text-[11px] block">Live Weather Radar</span>
                  <span className="text-[9px] text-emerald-700 font-semibold block">Real-time Satellite Feed</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showWeatherRadar}
                onChange={(e) => setShowWeatherRadar(e.target.checked)}
                className="w-4 h-4 accent-cyan-600 rounded cursor-pointer"
              />
            </label>

            {/* 5. Flood / Drought Vulnerability Heatmap Toggle */}
            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border-t border-slate-100 pt-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-amber-600" />
                <div>
                  <span className="font-bold text-slate-800 text-[11px] block">Flood / Drought Index</span>
                  <span className="text-[9px] text-slate-500 block">24 District Vulnerability</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showRiskHeatmap}
                onChange={(e) => setShowRiskHeatmap(e.target.checked)}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
            </label>

          </div>
        </div>
      </div>
    </div>
  );
};
