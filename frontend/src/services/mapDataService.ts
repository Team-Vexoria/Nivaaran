import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { ChallengeDoc } from './firebaseService';
import { getStageForStatus } from './workflowLifecycle';
import { toLegacyChallengeDoc, toWorkflowChallengeFromApi } from './workflowAdapters';
import { workflowStore } from './workflowStore';

export const JHARKHAND_DISTRICT_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  'Ranchi':               { lat: 23.3441, lng: 85.3096 },
  'Dhanbad':              { lat: 23.7957, lng: 86.4304 },
  'East Singhbhum':       { lat: 22.8046, lng: 86.2029 },
  'West Singhbhum':       { lat: 22.1581, lng: 85.8326 },
  'Bokaro':               { lat: 23.6693, lng: 86.1511 },
  'Giridih':              { lat: 24.1882, lng: 86.2994 },
  'Hazaribagh':           { lat: 23.9925, lng: 85.3614 },
  'Koderma':              { lat: 24.4660, lng: 85.5990 },
  'Chatra':               { lat: 24.2022, lng: 84.8732 },
  'Latehar':              { lat: 23.7452, lng: 84.4992 },
  'Palamu':               { lat: 23.9932, lng: 84.0588 },
  'Garhwa':               { lat: 24.1576, lng: 83.7822 },
  'Saraikela Kharsawan':  { lat: 22.7007, lng: 85.9396 },
  'Simdega':              { lat: 22.6123, lng: 84.5024 },
  'Gumla':                { lat: 23.0444, lng: 84.5400 },
  'Khunti':               { lat: 23.0719, lng: 85.2793 },
  'Dumka':                { lat: 24.2685, lng: 87.2476 },
  'Jamtara':              { lat: 23.9579, lng: 86.8018 },
  'Deoghar':              { lat: 24.4795, lng: 86.6990 },
  'Godda':                { lat: 24.8268, lng: 87.2134 },
  'Sahibganj':            { lat: 25.2446, lng: 87.6380 },
  'Pakur':                { lat: 24.6355, lng: 87.8454 },
  'Ramgarh':              { lat: 23.6332, lng: 85.5149 },
  'Lohardaga':            { lat: 23.4330, lng: 84.6922 },
};

// ── HEI University Research Hubs & Labs ──────────────────────────────────────
export interface HEILabLocation {
  id: string;
  name: string;
  university: string;
  district: string;
  lat: number;
  lng: number;
  specialization: string;
  activeProjectsCount: number;
  equipment: string[];
  contactFaculty: string;
}

export const JHARKHAND_HEI_LABS: HEILabLocation[] = [
  {
    id: 'LAB-BIT-MESRA',
    name: 'Advanced Water & IoT Environmental Lab',
    university: 'Birla Institute of Technology (BIT), Mesra',
    district: 'Ranchi',
    lat: 23.4123,
    lng: 85.4399,
    specialization: 'IoT Remote Telemetry & Micro-Turbine Filtration',
    activeProjectsCount: 6,
    equipment: ['Turbidity Spectrophotometer', 'LoRaWAN Field Gateway', 'AAS Water Analyzer'],
    contactFaculty: 'Dr. Anand Prakash (Prof. Environmental Eng.)',
  },
  {
    id: 'LAB-IIT-ISM',
    name: 'Disaster Prevention & Geotechnical Sensor Lab',
    university: 'IIT (ISM) Dhanbad',
    district: 'Dhanbad',
    lat: 23.8143,
    lng: 86.4412,
    specialization: 'Mine Subsidence, Seismology & Dam Inundation',
    activeProjectsCount: 8,
    equipment: ['LiDAR Ground Scanner', 'InSAR Deformation Receiver', 'Borehole Extensometer'],
    contactFaculty: 'Dr. S. K. Mahato (Mining & Earth Sciences)',
  },
  {
    id: 'LAB-NIT-JSR',
    name: 'Rural Infrastructure & Structural Lab',
    university: 'National Institute of Technology (NIT) Jamshedpur',
    district: 'East Singhbhum',
    lat: 22.7758,
    lng: 86.1436,
    specialization: 'Bridge Scour Monitoring & Low-Cost Materials',
    activeProjectsCount: 5,
    equipment: ['Universal Testing Machine 1000kN', 'Acoustic Emission Sensor', 'Drone Hyperspectral Rig'],
    contactFaculty: 'Dr. P. K. Soren (Civil Engineering)',
  },
  {
    id: 'LAB-BAU-RNC',
    name: 'Agri-Tech & Drought Resilience Center',
    university: 'Birsa Agricultural University (BAU)',
    district: 'Ranchi',
    lat: 23.4475,
    lng: 85.3218,
    specialization: 'Soil Moisture Mapping & Micro-Drip Automation',
    activeProjectsCount: 4,
    equipment: ['Soil TDR Moisture Probes', 'Automated Weather Station (AWS)', 'Canopy Thermal Imager'],
    contactFaculty: 'Dr. R. N. Tiwari (Agronomy)',
  },
  {
    id: 'LAB-SKMU-DMK',
    name: 'Santhal Pargana Water Security Hub',
    university: 'Sido Kanhu Murmu University (SKMU)',
    district: 'Dumka',
    lat: 24.2750,
    lng: 87.2600,
    specialization: 'Arsenic & Fluoride Removal in Tribal Belts',
    activeProjectsCount: 3,
    equipment: ['UV-Vis Spectrophotometer', 'Heavy Metal Test Kit', 'Solar Membrane Filter Rig'],
    contactFaculty: 'Dr. Hemant Murmu (Chemistry & Water)',
  },
  {
    id: 'LAB-VBU-HZB',
    name: 'Forest Hazard & Ecology Monitoring Lab',
    university: 'Vinoba Bhave University (VBU)',
    district: 'Hazaribagh',
    lat: 23.9850,
    lng: 85.3520,
    specialization: 'Forest Fire Warning & Runoff Analysis',
    activeProjectsCount: 3,
    equipment: ['Thermal Drone Tracker', 'Satellite NDVI Ingest Terminal', 'Hydrological Current Meter'],
    contactFaculty: 'Dr. Meenakshi Sinha (Forest Ecology)',
  },
];

// ── High-Risk Disaster & Hazard Zones ─────────────────────────────────────────
export interface DisasterZone {
  id: string;
  name: string;
  hazardType: 'Flood Inundation' | 'Severe Drought' | 'Coalfire & Subsidence' | 'Flash Flood & Scour';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  center: { lat: number; lng: number };
  radiusMeters: number;
  description: string;
  vulnerablePopulation: string;
  color: string;
}

export const JHARKHAND_DISASTER_ZONES: DisasterZone[] = [
  {
    id: 'ZONE-DAMODAR-FLOOD',
    name: 'Damodar Basin Monsoonal Inundation Belt',
    hazardType: 'Flood Inundation',
    severity: 'CRITICAL',
    center: { lat: 23.7200, lng: 86.2500 },
    radiusMeters: 28000,
    description: 'High inundation risk along low-lying riverbanks near Tenughat and Panchet reservoirs during heavy monsoon discharge.',
    vulnerablePopulation: '320,000+ residents across 42 riverine villages',
    color: '#DC2626',
  },
  {
    id: 'ZONE-PALAMU-DROUGHT',
    name: 'Palamu-Garhwa Rain-Shadow Arid Belt',
    hazardType: 'Severe Drought',
    severity: 'HIGH',
    center: { lat: 24.0800, lng: 83.9200 },
    radiusMeters: 35000,
    description: 'Chronic sub-surface water table depletion (<35m depth) and consecutive dry-spell vulnerability.',
    vulnerablePopulation: '580,000+ agrarian farmers',
    color: '#D97706',
  },
  {
    id: 'ZONE-JHARIA-SUBSIDENCE',
    name: 'Jharia Coalfield Underground Fire & Subsidence Zone',
    hazardType: 'Coalfire & Subsidence',
    severity: 'CRITICAL',
    center: { lat: 23.7500, lng: 86.4200 },
    radiusMeters: 14000,
    description: 'Centuries-old subterranean coal seam fires causing land subsidence and toxic carbon-monoxide venting.',
    vulnerablePopulation: '180,000+ urban & mining township dwellers',
    color: '#7F1D1D',
  },
  {
    id: 'ZONE-SUBARNAREKHA-SCOUR',
    name: 'Subarnarekha River Flash Flood Plain',
    hazardType: 'Flash Flood & Scour',
    severity: 'HIGH',
    center: { lat: 22.7500, lng: 86.2200 },
    radiusMeters: 22000,
    description: 'Rapid catchment accumulation during depression storms in the Bay of Bengal affecting Jamshedpur and Ghatshila.',
    vulnerablePopulation: '210,000+ peri-urban residents',
    color: '#2563EB',
  },
  {
    id: 'ZONE-GANGA-SAHIBGANJ',
    name: 'Ganga Flood Inundation & Bank Erosion Belt',
    hazardType: 'Flood Inundation',
    severity: 'CRITICAL',
    center: { lat: 25.2200, lng: 87.6200 },
    radiusMeters: 26000,
    description: 'Severe seasonal Ganga riverbank erosion and flood plain submergence impacting Sahibganj and Rajmahal.',
    vulnerablePopulation: '145,000+ rural population',
    color: '#DC2626',
  },
];

// ── District Vulnerability & Disaster Risk Index ──────────────────────────────
export interface DistrictRiskProfile {
  floodScore: number;       // 0-100
  droughtScore: number;     // 0-100
  hazardLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  monsoonRainfallAnomalyPct: number; // e.g. +24% or -35%
  primaryThreat: string;
}

export const JHARKHAND_DISTRICT_RISK_INDEX: Record<string, DistrictRiskProfile> = {
  'Sahibganj':           { floodScore: 92, droughtScore: 18, hazardLevel: 'CRITICAL', monsoonRainfallAnomalyPct: +38, primaryThreat: 'Ganga Riverbank Inundation & Erosion' },
  'Pakur':               { floodScore: 84, droughtScore: 22, hazardLevel: 'HIGH',     monsoonRainfallAnomalyPct: +24, primaryThreat: 'Low-lying Flood Waterlogging' },
  'Dhanbad':             { floodScore: 78, droughtScore: 35, hazardLevel: 'CRITICAL', monsoonRainfallAnomalyPct: +14, primaryThreat: 'Damodar Floods & Mining Subsidence' },
  'East Singhbhum':      { floodScore: 82, droughtScore: 20, hazardLevel: 'HIGH',     monsoonRainfallAnomalyPct: +29, primaryThreat: 'Subarnarekha Flash Flood Runoff' },
  'Bokaro':              { floodScore: 76, droughtScore: 30, hazardLevel: 'HIGH',     monsoonRainfallAnomalyPct: +12, primaryThreat: 'Konar & Damodar River Swell' },
  'Palamu':              { floodScore: 15, droughtScore: 94, hazardLevel: 'CRITICAL', monsoonRainfallAnomalyPct: -42, primaryThreat: 'Severe Groundwater Drought & Crop Failure' },
  'Garhwa':              { floodScore: 18, droughtScore: 91, hazardLevel: 'CRITICAL', monsoonRainfallAnomalyPct: -38, primaryThreat: 'Extreme Arid Spell & Water Scarcity' },
  'Chatra':              { floodScore: 22, droughtScore: 82, hazardLevel: 'HIGH',     monsoonRainfallAnomalyPct: -28, primaryThreat: 'Agricultural Drought Stress' },
  'Latehar':             { floodScore: 30, droughtScore: 79, hazardLevel: 'HIGH',     monsoonRainfallAnomalyPct: -25, primaryThreat: 'Forest Drought & Flash Streams' },
  'Ranchi':              { floodScore: 58, droughtScore: 42, hazardLevel: 'MODERATE', monsoonRainfallAnomalyPct: +8,  primaryThreat: 'Urban Waterlogging & Road Sinkholes' },
  'Hazaribagh':          { floodScore: 45, droughtScore: 55, hazardLevel: 'MODERATE', monsoonRainfallAnomalyPct: -5,  primaryThreat: 'Seasonal Catchment Runoff' },
  'Giridih':             { floodScore: 62, droughtScore: 60, hazardLevel: 'HIGH',     monsoonRainfallAnomalyPct: +10, primaryThreat: 'Usri River Flood & Soil Erosion' },
  'Deoghar':             { floodScore: 40, droughtScore: 64, hazardLevel: 'MODERATE', monsoonRainfallAnomalyPct: -12, primaryThreat: 'Drought & Groundwater Stress' },
  'Dumka':               { floodScore: 68, droughtScore: 45, hazardLevel: 'MODERATE', monsoonRainfallAnomalyPct: +16, primaryThreat: 'Mayurakshi Catchment Swell' },
  'Godda':               { floodScore: 72, droughtScore: 38, hazardLevel: 'HIGH',     monsoonRainfallAnomalyPct: +21, primaryThreat: 'Sundar Dam Catchment Flood' },
  'Jamtara':             { floodScore: 60, droughtScore: 48, hazardLevel: 'MODERATE', monsoonRainfallAnomalyPct: +6,  primaryThreat: 'Localized Flash Inundation' },
  'Koderma':             { floodScore: 35, droughtScore: 70, hazardLevel: 'HIGH',     monsoonRainfallAnomalyPct: -18, primaryThreat: 'Mining Runoff & Summer Water Deficit' },
  'Lohardaga':           { floodScore: 42, droughtScore: 58, hazardLevel: 'MODERATE', monsoonRainfallAnomalyPct: -8,  primaryThreat: 'Bauxite Belt Stream Turbidity' },
  'Gumla':               { floodScore: 50, droughtScore: 52, hazardLevel: 'MODERATE', monsoonRainfallAnomalyPct: +4,  primaryThreat: 'Riverine Soil Degradation' },
  'Simdega':             { floodScore: 55, droughtScore: 40, hazardLevel: 'LOW',      monsoonRainfallAnomalyPct: +11, primaryThreat: 'Hill Stream Surges' },
  'West Singhbhum':      { floodScore: 65, droughtScore: 38, hazardLevel: 'MODERATE', monsoonRainfallAnomalyPct: +18, primaryThreat: 'Baitarani & Karo River Swell' },
  'Saraikela Kharsawan': { floodScore: 70, droughtScore: 32, hazardLevel: 'HIGH',     monsoonRainfallAnomalyPct: +22, primaryThreat: 'Kharkai River Inundation' },
  'Khunti':              { floodScore: 48, droughtScore: 45, hazardLevel: 'LOW',      monsoonRainfallAnomalyPct: +2,  primaryThreat: 'Surface Runoff Velocity' },
};

export const JHARKHAND_BOUNDS: [[number, number], [number, number]] = [
  [21.9, 83.2],
  [25.4, 87.9],
];

export const JHARKHAND_CENTER: [number, number] = [23.3441, 85.3096];

export function getSeverityColor(riskLevel?: string): string {
  switch (riskLevel) {
    case 'CRITICAL': return '#B3261E';
    case 'HIGH':     return '#B45309';
    case 'MEDIUM':   return '#C98A2C';
    case 'STANDARD': return '#2C6E49';
    default:         return '#6A6155';
  }
}

export function getSeverityBg(riskLevel?: string): string {
  switch (riskLevel) {
    case 'CRITICAL': return 'bg-[#B3261E]';
    case 'HIGH':     return 'bg-[#B45309]';
    case 'MEDIUM':   return 'bg-[#C98A2C]';
    case 'STANDARD': return 'bg-[#2C6E49]';
    default:         return 'bg-[#6A6155]';
  }
}

export function getCategoryColor(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('flood') || cat.includes('disaster')) return '#B3261E';
  if (cat.includes('water'))   return '#1D6FA5';
  if (cat.includes('agri') || cat.includes('farm')) return '#2C6E49';
  if (cat.includes('forest') || cat.includes('wild')) return '#4A7C3F';
  if (cat.includes('mine') || cat.includes('mining')) return '#8B5E3C';
  if (cat.includes('urban') || cat.includes('road') || cat.includes('infra')) return '#C98A2C';
  if (cat.includes('health') || cat.includes('sanit')) return '#7E4FB5';
  if (cat.includes('educat') || cat.includes('school')) return '#1D6FA5';
  return '#6A6155';
}

export function getStatusPillClass(status: string): string {
  const stageNumber = getStageForStatus(status)?.stageNumber;
  if (!stageNumber) return 'bg-[#E4DDD1] text-[#4A433B]';
  if (stageNumber >= 14) return 'bg-[#16293F] text-white';
  if (stageNumber >= 8) return 'bg-[#C98A2C] text-white';
  if (stageNumber >= 3) return 'bg-[#2C6E49] text-white';
  return 'bg-[#E4DDD1] text-[#4A433B]';
}

export interface DistrictStat {
  district: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  standard: number;
  topCategory: string;
  latestChallenge?: ChallengeDoc;
}

/** Backend heatmap API response item */
interface HeatmapDistrict {
  districtCode: string;
  districtName: string;
  totalChallenges: number;
  activeChallenges: number;
  avgPriorityScore: number | null;
}

function buildDistrictStats(
  challenges: ChallengeDoc[],
  heatmapDistricts?: HeatmapDistrict[]
): Record<string, DistrictStat> {
  const stats: Record<string, DistrictStat> = {};

  for (const district of Object.keys(JHARKHAND_DISTRICT_CENTROIDS)) {
    stats[district] = { district, total: 0, critical: 0, high: 0, medium: 0, standard: 0, topCategory: 'None' };
  }

  // Overlay real server-side aggregated metrics if available
  if (Array.isArray(heatmapDistricts)) {
    for (const hd of heatmapDistricts) {
      const dName = hd.districtName;
      if (dName && stats[dName]) {
        stats[dName].total = hd.totalChallenges || stats[dName].total;
      }
    }
  }

  const categoryCount: Record<string, Record<string, number>> = {};

  for (const ch of challenges) {
    const d = ch.district || 'Ranchi';
    if (!stats[d]) {
      stats[d] = { district: d, total: 0, critical: 0, high: 0, medium: 0, standard: 0, topCategory: 'None' };
    }
    stats[d].total += 1;
    if (!stats[d].latestChallenge) stats[d].latestChallenge = ch;

    switch (ch.riskLevel) {
      case 'CRITICAL': stats[d].critical++; break;
      case 'HIGH':     stats[d].high++;     break;
      case 'MEDIUM':   stats[d].medium++;   break;
      default:         stats[d].standard++; break;
    }

    if (!categoryCount[d]) categoryCount[d] = {};
    const cat = ch.category || 'Other';
    categoryCount[d][cat] = (categoryCount[d][cat] || 0) + 1;
  }

  for (const d of Object.keys(stats)) {
    if (categoryCount[d]) {
      const sorted = Object.entries(categoryCount[d]).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) stats[d].topCategory = sorted[0][0];
    }
  }

  return stats;
}

export interface MapData {
  challenges: ChallengeDoc[];
  districtStats: Record<string, DistrictStat>;
  heatmapData: { districts: HeatmapDistrict[]; totalCount: number } | null;
  districts: unknown[];
  totalCount: number;
  criticalCount: number;
  validatedCount: number;
  resolvedCount: number;
  loading: boolean;
}

export function useMapData(): MapData {
  const [challenges, setChallenges] = useState<ChallengeDoc[]>(() => {
    try {
      return workflowStore.getChallenges().map(toLegacyChallengeDoc);
    } catch {
      return [];
    }
  });
  const [heatmapData, setHeatmapData] = useState<{ districts: HeatmapDistrict[]; totalCount: number } | null>(null);
  const [districts, setDistricts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Listen to local workflow store updates
    const onStoreUpdate = () => {
      if (!cancelled) {
        setChallenges(workflowStore.getChallenges().map(toLegacyChallengeDoc));
      }
    };
    window.addEventListener('nivaaran-store-updated', onStoreUpdate);
    window.addEventListener('storage', onStoreUpdate);

    // Phase 2: API first with graceful fallback
    Promise.all([
      apiClient.getDistrictHeatmap().catch(() => ({ ok: false, data: null })),
      apiClient.getDistricts().catch(() => ({ ok: false, data: null })),
      apiClient.getChallenges().catch(() => ({ ok: false, data: null })),
    ]).then(([heatRes, distRes, chalRes]) => {
      if (cancelled) return;
      
      // Process heatmap data from API
      if (heatRes && heatRes.ok && heatRes.data) {
        const data = heatRes.data as { districts: HeatmapDistrict[]; totalCount: number };
        if (data && data.totalCount > 0) {
          setHeatmapData(data);
        }
      }
      
      // Process districts from API
      if (distRes && distRes.ok && distRes.data) {
        const arr = Array.isArray(distRes.data) ? distRes.data : ((distRes.data as any).districts || []);
        setDistricts(arr);
      }
      
      // Process challenges from API — merge into local data instead of overwriting,
      // same pattern as firebaseService's API poll fix. Preserves locally-submitted
      // challenges that haven't synced to the server yet.
      if (chalRes && chalRes.ok && chalRes.data && Array.isArray(chalRes.data) && chalRes.data.length > 0) {
        const serverChallenges = chalRes.data.map((c: any) => {
          const wf = toWorkflowChallengeFromApi(c);
          return toLegacyChallengeDoc(wf);
        });
        setChallenges(prev => {
          const serverIds = new Set(serverChallenges.map(c => c.id));
          return [
            ...serverChallenges,
            ...prev.filter(c => !serverIds.has(c.id)),
          ];
        });
      }
      
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    
    return () => { 
      cancelled = true; 
      window.removeEventListener('nivaaran-store-updated', onStoreUpdate);
      window.removeEventListener('storage', onStoreUpdate);
    };
  }, []);

  const totalCount = (heatmapData && heatmapData.totalCount > 0) ? heatmapData.totalCount : challenges.length;

  return {
    challenges,
    districtStats: buildDistrictStats(challenges, heatmapData?.districts),
    heatmapData,
    districts,
    totalCount,
    criticalCount: challenges.filter(c => c.riskLevel === 'CRITICAL').length,
    validatedCount: challenges.filter(c => {
      const stageNumber = getStageForStatus(c.status)?.stageNumber || 0;
      return stageNumber >= 3 && stageNumber < 14;
    }).length,
    resolvedCount: challenges.filter(c => (getStageForStatus(c.status)?.stageNumber || 0) >= 14).length,
    loading,
  };
}
