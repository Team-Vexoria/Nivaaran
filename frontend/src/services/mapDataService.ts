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
  'Kharsawan':            { lat: 22.7937, lng: 85.8312 },
  'Lohardaga':            { lat: 23.4330, lng: 84.6922 },
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

function buildDistrictStats(
  challenges: ChallengeDoc[],
  heatmapDistricts?: Array<{ districtName?: string; districtCode?: string; totalChallenges?: number; avgPriorityScore?: number | null }>
): Record<string, DistrictStat> {
  const stats: Record<string, DistrictStat> = {};

  for (const district of Object.keys(JHARKHAND_DISTRICT_CENTROIDS)) {
    stats[district] = { district, total: 0, critical: 0, high: 0, medium: 0, standard: 0, topCategory: 'None' };
  }

  // Overlay real server-side aggregated metrics if available
  if (Array.isArray(heatmapDistricts)) {
    for (const hd of heatmapDistricts) {
      const dName = hd.districtName || hd.districtCode;
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
  heatmapData: Record<string, unknown> | null;
  districts: unknown[];
  totalCount: number;
  criticalCount: number;
  validatedCount: number;
  resolvedCount: number;
  loading: boolean;
}

export function useMapData(): MapData {
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);
  const [heatmapData, setHeatmapData] = useState<Record<string, unknown> | null>(null);
  const [districts, setDistricts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Phase 4.3: fetch real aggregates from API with graceful store fallback
    Promise.all([
      apiClient.getDistrictHeatmap().catch(() => ({ ok: false, data: null })),
      apiClient.getDistricts().catch(() => ({ ok: false, data: null })),
      apiClient.getChallenges().catch(() => ({ ok: false, data: null })),
    ]).then(([heatRes, distRes, chalRes]) => {
      if (cancelled) return;
      if (heatRes && heatRes.ok && heatRes.data) {
        setHeatmapData(heatRes.data as Record<string, unknown>);
      }
      if (distRes && distRes.ok && distRes.data) {
        const arr = Array.isArray(distRes.data) ? distRes.data : ((distRes.data as any).districts || []);
        setDistricts(arr);
      }
      let loadedChallenges: ChallengeDoc[] = [];
      if (chalRes && chalRes.ok && chalRes.data && Array.isArray(chalRes.data) && chalRes.data.length > 0) {
        loadedChallenges = chalRes.data.map((c: any) => {
          const wf = toWorkflowChallengeFromApi(c);
          return toLegacyChallengeDoc(wf);
        });
      }
      // If API returned no challenges or failed, use workflowStore
      if (loadedChallenges.length === 0) {
        loadedChallenges = workflowStore.getChallenges().map(toLegacyChallengeDoc);
      }
      setChallenges(loadedChallenges);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setChallenges(workflowStore.getChallenges().map(toLegacyChallengeDoc));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const heatmapDistrictsList = heatmapData && Array.isArray((heatmapData as any).districts)
    ? (heatmapData as any).districts
    : undefined;

  return {
    challenges,
    districtStats: buildDistrictStats(challenges, heatmapDistrictsList),
    heatmapData,
    districts,
    totalCount: challenges.length,
    criticalCount: challenges.filter(c => c.riskLevel === 'CRITICAL').length,
    validatedCount: challenges.filter(c => {
      const stageNumber = getStageForStatus(c.status)?.stageNumber || 0;
      return stageNumber >= 3 && stageNumber < 14;
    }).length,
    resolvedCount: challenges.filter(c => (getStageForStatus(c.status)?.stageNumber || 0) >= 14).length,
    loading,
  };
}
