import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChallengeDoc } from '../../services/firebaseService';
import {
  DistrictStat,
  DistrictRiskProfile,
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
import { Layers, CloudRain, AlertTriangle, Building2, Droplets, Radio, ChevronDown, RotateCcw } from 'lucide-react';

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
        background: #065F46;
        border: 2px solid #34D399;
        border-radius: 6px;
        box-shadow: 0 3px 8px rgba(6,95,70,0.45);
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
  const hoveredDistrictsRef = useRef<Set<string>>(new Set());
  const lastGeoClickRef = useRef<string | null>(null);
  const clearAllShadingRef = useRef<() => void>(() => {});

  const [hoveredDistrictInfo, setHoveredDistrictInfo] = useState<{
    name: string;
    total: number;
    critical: number;
    high: number;
    medium: number;
    riskProfile?: DistrictRiskProfile;
  } | null>(null);

  const [hasShadedDistricts, setHasShadedDistricts] = useState(false);

  // GIS Interactive Layer Controls State
  const [showIncidents, setShowIncidents] = useState(true);
  const [showHEILabs, setShowHEILabs] = useState(true);
  const [showDisasterZones, setShowDisasterZones] = useState(true);
  const [showWeatherRadar, setShowWeatherRadar] = useState(true);
  const [showRiskHeatmap, setShowRiskHeatmap] = useState(false);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  // Clear all shaded district regions back to clean initial state
  const clearAllShading = () => {
    hoveredDistrictsRef.current.clear();
    setHasShadedDistricts(false);
    setHoveredDistrictInfo(null);
    onDistrictSelect(null);
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.eachLayer((layer: any) => {
        if (layer.setStyle) {
          layer.setStyle({
            fillColor: '#B0A89A',
            fillOpacity: 0.02,
            color: '#D6D3D1',
            weight: 1,
            opacity: 0.65,
            dashArray: '3, 4',
          });
        }
      });
    }
  };
  clearAllShadingRef.current = clearAllShading;

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

    // Clicking anywhere outside the shaded regions on the map canvas clears all shading
    map.on('click', () => {
      clearAllShadingRef.current();
    });

    markersLayerRef.current = L.layerGroup().addTo(map);
    centroidLayerRef.current = L.layerGroup().addTo(map);
    heiLabsLayerRef.current = L.layerGroup().addTo(map);
    disasterZonesLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapDivRef.current) {
      resizeObserver.observe(mapDivRef.current);
    }

    const handleWindowResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleWindowResize);

    const resizeTimer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const resizeTimer2 = setTimeout(() => {
      map.invalidateSize();
    }, 350);
    const resizeTimer3 = setTimeout(() => {
      map.invalidateSize();
    }, 800);

    return () => {
      map.off('click');
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      clearTimeout(resizeTimer1);
      clearTimeout(resizeTimer2);
      clearTimeout(resizeTimer3);
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

  // Store latest state in refs for stable Leaflet event callbacks
  const selectedDistrictRef = useRef<string | null>(selectedDistrict);
  selectedDistrictRef.current = selectedDistrict;

  const onDistrictSelectRef = useRef<(d: string | null) => void>(onDistrictSelect);
  onDistrictSelectRef.current = onDistrictSelect;

  const districtStatsRef = useRef<Record<string, DistrictStat>>(districtStats);
  districtStatsRef.current = districtStats;

  // Update GeoJSON choropleth layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoData) return;

    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.remove();
    }

    geoJsonLayerRef.current = L.geoJSON(geoData, {
      style: (feature) => {
        const distName = feature?.properties?.district as string | undefined;
        const stat = distName ? districtStatsRef.current[distName] : undefined;
        const count = stat?.total ?? 0;
        const isSelected = distName === selectedDistrictRef.current;
        const isHovered = distName ? hoveredDistrictsRef.current.has(distName) : false;
        const isShaded = isSelected || isHovered;
        const riskProfile = distName ? JHARKHAND_DISTRICT_RISK_INDEX[distName] : undefined;

        if (showRiskHeatmap && riskProfile) {
          const riskColor =
            riskProfile.hazardLevel === 'CRITICAL' ? '#DC2626' :
            riskProfile.hazardLevel === 'HIGH'     ? '#EA580C' :
            riskProfile.hazardLevel === 'MODERATE' ? '#CA8A04' : '#16A34A';
          return {
            fillColor: riskColor,
            fillOpacity: isSelected ? 0.65 : isHovered ? 0.38 : 0.02,
            color: isShaded ? (isSelected ? '#991B1B' : '#78350F') : '#D6D3D1',
            weight: isSelected ? 2.5 : isHovered ? 1.8 : 1,
            opacity: isShaded ? 1 : 0.65,
            dashArray: isShaded ? undefined : '3, 4',
          };
        }

        const fillColor =
          (stat?.critical ?? 0) > 0 ? '#B3261E' :
          (stat?.high ?? 0) > 0     ? '#B45309' :
          (stat?.medium ?? 0) > 0   ? '#C98A2C' :
          count > 0                 ? '#2C6E49' : '#B0A89A';

        return {
          fillColor,
          fillOpacity: isSelected ? 0.42 : isHovered ? 0.32 : 0.02,
          color: isShaded ? '#059669' : '#D6D3D1',
          weight: isSelected ? 2.5 : isHovered ? 1.8 : 1,
          opacity: isShaded ? 1 : 0.65,
          dashArray: isShaded ? undefined : '3, 4',
        };
      },
      onEachFeature: (feature, layer) => {
        const distName = feature.properties?.district as string;

        layer.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          lastGeoClickRef.current = distName;
          if (distName) {
            hoveredDistrictsRef.current.add(distName);
            setHasShadedDistricts(true);
          }

          if (distName === selectedDistrictRef.current) {
            // Clicking currently focused district deselects it and clears all shaded regions
            clearAllShadingRef.current();
          } else {
            onDistrictSelectRef.current(distName);
            const centroid = JHARKHAND_DISTRICT_CENTROIDS[distName];
            if (centroid) {
              map.flyTo([centroid.lat, centroid.lng], 9, { duration: 0.6, easeLinearity: 0.25 });
            }
          }
        });

        // Hover animation: shades up district smoothly without annoying cursor tooltip
        layer.on('mouseover', (e: L.LeafletMouseEvent) => {
          const stat = distName ? districtStatsRef.current[distName] : undefined;
          const riskProfile = distName ? JHARKHAND_DISTRICT_RISK_INDEX[distName] : undefined;
          const isSelected = distName === selectedDistrictRef.current;

          if (distName) {
            hoveredDistrictsRef.current.add(distName);
            setHasShadedDistricts(true);
            setHoveredDistrictInfo({
              name: distName,
              total: stat?.total ?? 0,
              critical: stat?.critical ?? 0,
              high: stat?.high ?? 0,
              medium: stat?.medium ?? 0,
              riskProfile,
            });
          }

          const path = e.target as L.Path;
          const fillColor =
            (stat?.critical ?? 0) > 0 ? '#B3261E' :
            (stat?.high ?? 0) > 0     ? '#B45309' :
            (stat?.medium ?? 0) > 0   ? '#C98A2C' :
            (stat?.total ?? 0) > 0    ? '#2C6E49' : '#B0A89A';

          path.setStyle({
            weight: isSelected ? 2.8 : 2.2,
            color: showRiskHeatmap ? '#991B1B' : '#059669',
            fillColor: showRiskHeatmap && riskProfile ? (
              riskProfile.hazardLevel === 'CRITICAL' ? '#DC2626' :
              riskProfile.hazardLevel === 'HIGH'     ? '#EA580C' :
              riskProfile.hazardLevel === 'MODERATE' ? '#CA8A04' : '#16A34A'
            ) : fillColor,
            fillOpacity: isSelected ? 0.48 : 0.38,
            opacity: 1,
            dashArray: undefined,
          });
        });

        // Keep shaded once discovered, remove top hover telemetry info smoothly
        layer.on('mouseout', (e: L.LeafletMouseEvent) => {
          setHoveredDistrictInfo((prev) => (prev?.name === distName ? null : prev));
          const stat = distName ? districtStatsRef.current[distName] : undefined;
          const riskProfile = distName ? JHARKHAND_DISTRICT_RISK_INDEX[distName] : undefined;
          const path = e.target as L.Path;
          const isSelected = distName === selectedDistrictRef.current;

          const fillColor =
            (stat?.critical ?? 0) > 0 ? '#B3261E' :
            (stat?.high ?? 0) > 0     ? '#B45309' :
            (stat?.medium ?? 0) > 0   ? '#C98A2C' :
            (stat?.total ?? 0) > 0    ? '#2C6E49' : '#B0A89A';

          if (isSelected) {
            path.setStyle({
              weight: 2.5,
              color: showRiskHeatmap ? '#991B1B' : '#059669',
              fillColor: showRiskHeatmap && riskProfile ? (
                riskProfile.hazardLevel === 'CRITICAL' ? '#DC2626' :
                riskProfile.hazardLevel === 'HIGH'     ? '#EA580C' :
                riskProfile.hazardLevel === 'MODERATE' ? '#CA8A04' : '#16A34A'
              ) : fillColor,
              fillOpacity: 0.42,
              opacity: 1,
              dashArray: undefined,
            });
          } else {
            path.setStyle({
              weight: 1.6,
              color: showRiskHeatmap ? '#78350F' : '#059669',
              fillColor: showRiskHeatmap && riskProfile ? (
                riskProfile.hazardLevel === 'CRITICAL' ? '#DC2626' :
                riskProfile.hazardLevel === 'HIGH'     ? '#EA580C' :
                riskProfile.hazardLevel === 'MODERATE' ? '#CA8A04' : '#16A34A'
              ) : fillColor,
              fillOpacity: 0.30,
              opacity: 0.95,
              dashArray: undefined,
            });
          }
        });
      },
    }).addTo(map);
  }, [geoData, showRiskHeatmap]);

  // Silky smooth style sync when selectedDistrict changes without rebuilding DOM
  useEffect(() => {
    if (!geoJsonLayerRef.current) return;
    geoJsonLayerRef.current.eachLayer((layer: any) => {
      const distName = layer.feature?.properties?.district as string | undefined;
      if (!distName) return;
      const isSelected = distName === selectedDistrict;
      const isHovered = hoveredDistrictsRef.current.has(distName);
      const isShaded = isSelected || isHovered;
      const stat = districtStats[distName];
      const riskProfile = JHARKHAND_DISTRICT_RISK_INDEX[distName];

      if (showRiskHeatmap && riskProfile) {
        const riskColor =
          riskProfile.hazardLevel === 'CRITICAL' ? '#DC2626' :
          riskProfile.hazardLevel === 'HIGH'     ? '#EA580C' :
          riskProfile.hazardLevel === 'MODERATE' ? '#CA8A04' : '#16A34A';
        layer.setStyle({
          fillColor: riskColor,
          fillOpacity: isSelected ? 0.65 : isHovered ? 0.38 : 0.02,
          color: isShaded ? (isSelected ? '#991B1B' : '#78350F') : '#D6D3D1',
          weight: isSelected ? 2.5 : isHovered ? 1.8 : 1,
          opacity: isShaded ? 1 : 0.65,
          dashArray: isShaded ? undefined : '3, 4',
        });
        return;
      }

      const fillColor =
        (stat?.critical ?? 0) > 0 ? '#B3261E' :
        (stat?.high ?? 0) > 0     ? '#B45309' :
        (stat?.medium ?? 0) > 0   ? '#C98A2C' :
        (stat?.total ?? 0) > 0    ? '#2C6E49' : '#B0A89A';

      layer.setStyle({
        fillColor,
        fillOpacity: isSelected ? 0.42 : isHovered ? 0.32 : 0.02,
        color: isShaded ? '#059669' : '#D6D3D1',
        weight: isSelected ? 2.5 : isHovered ? 1.8 : 1,
        opacity: isShaded ? 1 : 0.65,
        dashArray: isShaded ? undefined : '3, 4',
      });
    });
  }, [selectedDistrict, districtStats, showRiskHeatmap]);

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
          <div style="font-size: 10px; font-weight: 800; color: #065F46; text-transform: uppercase; letter-spacing: 0.05em;">
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

  // Fly to when district selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedDistrict) return;
    if (lastGeoClickRef.current === selectedDistrict) {
      lastGeoClickRef.current = null;
      return;
    }
    const centroid = JHARKHAND_DISTRICT_CENTROIDS[selectedDistrict];
    if (centroid) map.flyTo([centroid.lat, centroid.lng], 9, { duration: 0.6, easeLinearity: 0.25 });
  }, [selectedDistrict]);

  return (
    <div className="flex-1 relative h-full min-h-[520px] w-full">
      {/* Leaflet Map DOM Node */}
      <div 
        ref={mapDivRef} 
        className="w-full h-full min-h-[520px]" 
        style={{ minHeight: '520px', height: '100%', width: '100%' }}
      />

      {/* Sleek District Telemetry HUD: Floating Top Left, zero cursor jitter */}
      {hoveredDistrictInfo && (
        <div className="absolute top-3 left-3 z-[1000] pointer-events-none transition-all duration-200 ease-out">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-slate-200/90 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-extrabold text-xs text-slate-800 tracking-wide uppercase">
                {hoveredDistrictInfo.name} District
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            {showRiskHeatmap && hoveredDistrictInfo.riskProfile ? (
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <span className="text-rose-600 font-bold">
                  Threat: {hoveredDistrictInfo.riskProfile.primaryThreat}
                </span>
                <span className="text-slate-300">|</span>
                <span>Flood: {hoveredDistrictInfo.riskProfile.floodScore}/100</span>
                <span className="text-slate-300">|</span>
                <span>Drought: {hoveredDistrictInfo.riskProfile.droughtScore}/100</span>
              </div>
            ) : (
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-2.5">
                <span className="text-slate-900 font-bold">
                  {hoveredDistrictInfo.total} {hoveredDistrictInfo.total === 1 ? 'Problem' : 'Problems'}
                </span>
                {hoveredDistrictInfo.critical > 0 && (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    {hoveredDistrictInfo.critical} Critical
                  </span>
                )}
                {hoveredDistrictInfo.high > 0 && (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    {hoveredDistrictInfo.high} High
                  </span>
                )}
                {hoveredDistrictInfo.critical === 0 && hoveredDistrictInfo.high === 0 && hoveredDistrictInfo.total > 0 && (
                  <span className="text-emerald-700 font-medium">
                    Standard Priority
                  </span>
                )}
                {hoveredDistrictInfo.total === 0 && (
                  <span className="text-slate-400 font-normal">
                    No Reported Incidents
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active District Focus & Reset Action: Visible when any district is selected */}
      {selectedDistrict && !hoveredDistrictInfo && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 transition-all duration-200">
          <div className="bg-emerald-800 text-white px-3.5 py-2 rounded-xl shadow-md flex items-center gap-2 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>Focused: {selectedDistrict} District</span>
          </div>
          <button
            type="button"
            onClick={clearAllShading}
            className="bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Click to reset all shaded regions"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Clear Shading
          </button>
        </div>
      )}

      {/* Quick Action to vanish all shaded regions when regions are shaded and no district selected */}
      {hasShadedDistricts && !selectedDistrict && !hoveredDistrictInfo && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 transition-all duration-200">
          <button
            type="button"
            onClick={clearAllShading}
            className="bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Click to vanish all shaded regions back to incident dots only"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Clear Shaded Regions
          </button>
        </div>
      )}

      {/* Interactive GIS Layer Control Switcher HUD: Floating Top Right */}
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
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                <div>
                  <span className="font-bold text-slate-800 text-[11px] block">HEI Research Labs</span>
                  <span className="text-[9px] text-slate-500 block">6 University Centers</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showHEILabs}
                onChange={(e) => setShowHEILabs(e.target.checked)}
                className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
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
                <CloudRain className="w-3.5 h-3.5 text-emerald-700" />
                <div>
                  <span className="font-bold text-slate-800 text-[11px] block">Live Weather Radar</span>
                  <span className="text-[9px] text-emerald-700 font-semibold block">Real-time Satellite Feed</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showWeatherRadar}
                onChange={(e) => setShowWeatherRadar(e.target.checked)}
                className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
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
