import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChallengeDoc } from '../../services/firebaseService';
import {
  DistrictStat,
  JHARKHAND_BOUNDS,
  JHARKHAND_CENTER,
  JHARKHAND_DISTRICT_CENTROIDS,
  getSeverityColor,
} from '../../services/mapDataService';
import { ChallengePopupCard } from './ChallengePopupCard';
import ReactDOM from 'react-dom/client';
import { useLanguage } from '../../context/LanguageContext';

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
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);

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
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    map.fitBounds(JHARKHAND_BOUNDS);

    markersLayerRef.current = L.layerGroup().addTo(map);
    centroidLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update GeoJSON choropleth layer
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

        layer.on('click', () => {
          onDistrictSelect(distName === selectedDistrict ? null : distName);
          const centroid = JHARKHAND_DISTRICT_CENTROIDS[distName];
          if (centroid) map.flyTo([centroid.lat, centroid.lng], 9, { duration: 0.8 });
        });

        layer.on('mouseover', (e) => {
          (e.target as L.Path).setStyle({ weight: 2, color: '#2C6E49' });
          const tooltip = L.tooltip({ permanent: false, direction: 'center', className: 'nivaaran-district-tooltip' })
            .setContent(`<strong>${distName}</strong><br/>${t.map.districtTooltip.replace('{distName}', distName).replace('{count}', String(stat?.total ?? 0))}`)
            .setLatLng((layer as L.Polygon).getBounds().getCenter());
          map.openTooltip(tooltip);
        });

        layer.on('mouseout', (e) => {
          geoJsonLayerRef.current?.resetStyle(e.target as L.Path);
          map.closeTooltip();
        });
      },
    }).addTo(map);
  }, [geoData, districtStats, selectedDistrict, onDistrictSelect]);

  // Update challenge pin markers
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    const centroidLayer = centroidLayerRef.current;
    if (!markersLayer || !centroidLayer) return;

    markersLayer.clearLayers();
    centroidLayer.clearLayers();

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
        React.createElement(ChallengePopupCard, {
          challenge: ch,
          govtMode,
          onValidate,
          onRequestEvidence,
        })
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
      marker.bindTooltip(t.map.noGpsCoords.replace('{distName}', dist).replace('{count}', String(stat.total)), { direction: 'top' });
      marker.addTo(centroidLayer);
    }
  }, [challenges, districtStats, govtMode, onValidate, onRequestEvidence]);

  // Fly-to when district selected from sidebar
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedDistrict) return;
    const centroid = JHARKHAND_DISTRICT_CENTROIDS[selectedDistrict];
    if (centroid) map.flyTo([centroid.lat, centroid.lng], 9, { duration: 0.8 });
  }, [selectedDistrict]);

  return (
    <div
      ref={mapDivRef}
      className="flex-1 relative"
      style={{ minHeight: 0 }}
    />
  );
};
