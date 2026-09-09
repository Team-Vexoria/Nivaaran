/**
 * NIVAARAN — PART 3A & 3B: District → Coordinates → Open-Meteo Weather Query (SIH 26043)
 */

import { parseWeatherResponse, packageDisasterResult, DisasterResult } from './weatherParser';
import { linkAbortSignal } from './abortUtil';
import { LRUCache } from 'lru-cache';

const weatherCache = new LRUCache<string, { payload: DisasterResult; ts: number }>({
  max: 200,
  ttl: 10 * 60 * 1000, // 10 min
});

export interface DistrictCoords {
  lat: number;
  lng: number;
}

const DISTRICT_COORDS: Record<string, DistrictCoords> = {
  'Ranchi': { lat: 23.34, lng: 85.32 },
  'Dhanbad': { lat: 23.80, lng: 86.45 },
  'East Singhbhum': { lat: 22.80, lng: 86.25 },
  'Bokaro': { lat: 23.67, lng: 86.15 },
  'Palamu': { lat: 24.04, lng: 84.07 },
  'Hazaribagh': { lat: 23.99, lng: 85.36 },
  'Deoghar': { lat: 24.48, lng: 86.70 },
  'Giridih': { lat: 24.19, lng: 86.31 },
  'Ramgarh': { lat: 23.63, lng: 85.51 },
  'Latehar': { lat: 23.74, lng: 84.49 },
  'Garhwa': { lat: 24.16, lng: 83.81 },
  'Dumka': { lat: 24.27, lng: 87.25 },
  'Godda': { lat: 24.83, lng: 87.21 },
  'Sahebganj': { lat: 25.24, lng: 87.64 },
  'Pakur': { lat: 24.63, lng: 87.85 },
  'Jamtara': { lat: 23.96, lng: 86.80 },
  'Khunti': { lat: 23.07, lng: 85.28 },
  'Gumla': { lat: 23.04, lng: 84.54 },
  'Simdega': { lat: 22.61, lng: 84.51 },
  'West Singhbhum': { lat: 22.57, lng: 85.81 },
  'Seraikela Kharsawan': { lat: 22.70, lng: 85.93 },
  'Chatra': { lat: 24.21, lng: 84.87 },
  'Koderma': { lat: 24.47, lng: 85.59 },
  'Lohardaga': { lat: 23.43, lng: 84.68 },
};

export function getDistrictCoords(district: string): DistrictCoords {
  return DISTRICT_COORDS[district] || { lat: 23.34, lng: 85.32 };
}

export async function buildWeatherQueryAndCallAPI(
  district: string,
  signal?: AbortSignal
): Promise<{ rawResponse: any; success: boolean; error?: string }> {
  const coords = getDistrictCoords(district);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=rain_sum,weather_code&forecast_days=3`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    linkAbortSignal(controller, signal);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      return { rawResponse: json, success: true, error: undefined };
    }
    return { rawResponse: null, success: false, error: `HTTP ${res.status}` };
  } catch {
    return { rawResponse: null, success: false, error: 'Open-Meteo timeout/network error' };
  }
}

/**
 * Executes Step 3 end-to-end: query Open-Meteo, parse ±1 day, evaluate storm/rain alert
 */
export async function searchWeather(
  district: string,
  eventDate?: string | Date,
  signal?: AbortSignal
): Promise<DisasterResult> {
  const cacheKey = `${(district || 'Ranchi').toLowerCase()}|${eventDate ? String(eventDate).slice(0, 10) : 'any'}`;
  const cached = weatherCache.get(cacheKey);
  if (cached) return cached.payload;

  let result: DisasterResult;
  try {
    const apiCall = await buildWeatherQueryAndCallAPI(district, signal);
    if (apiCall.success && apiCall.rawResponse) {
      const parsed = parseWeatherResponse(apiCall.rawResponse, eventDate);
      result = packageDisasterResult(parsed, true);
      weatherCache.set(cacheKey, { payload: result, ts: Date.now() });
      return result;
    }
  } catch {
    // falls through to fallback
  }
  result = { source: 'disaster-fallback', activeAlert: false, severityLevel: 'none', maxRain: 0, confidence: 0, matchedDates: [] };
  return result;
}
