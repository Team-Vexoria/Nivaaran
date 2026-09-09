/**
 * NIVAARAN — STEP 3B: Weather Response Parser & Alert Evaluator
 * Parses Open-Meteo daily forecast for dates matching eventDate ±1 day.
 */

export interface WeatherParseResult {
  activeAlert: boolean;      // true if rain > 20mm or weather_code indicates storm (95+)
  severityLevel: 'high' | 'low' | 'none';
  maxRain: number;           // max rain_sum (mm) across matched ±1 days
  matchedDates: string[];    // dates matching eventDate ±1 day
  stormDetected: boolean;
}

export interface DisasterResult {
  source: 'disaster-live' | 'disaster-fallback';
  activeAlert: boolean;
  severityLevel: 'high' | 'low' | 'none';
  maxRain: number;
  confidence: number;
  matchedDates: string[];
}

function isStormWeatherCode(code: number): boolean {
  // WMO weather codes: 95 = Thunderstorm, 96/99 = Thunderstorm with hail,
  // 65 = Heavy rain, 75 = Heavy snow, 82 = Violent rain showers
  return code >= 95 || code === 65 || code === 67 || code === 75 || code === 82;
}

export function parseWeatherResponse(
  rawResponse: any,
  eventDate?: string | Date
): WeatherParseResult {
  const daily = rawResponse?.daily || {};
  const times: string[] = daily.time || [];
  const rainSums: number[] = daily.rain_sum || [];
  const weatherCodes: number[] = daily.weather_code || [];

  if (!times || times.length === 0) {
    return {
      activeAlert: false,
      severityLevel: 'none',
      maxRain: 0,
      matchedDates: [],
      stormDetected: false,
    };
  }

  const eventDt = eventDate ? new Date(eventDate) : new Date();

  let maxRain = 0;
  const matchedDates: string[] = [];
  let activeAlert = false;
  let stormDetected = false;

  for (let i = 0; i < times.length; i++) {
    const dayStr = times[i]?.slice(0, 10) || '';
    if (!dayStr) continue;

    // Check if within ±1 day of eventDate
    const dayDt = new Date(dayStr + 'T00:00:00');
    const diffMs = Math.abs(dayDt.getTime() - eventDt.getTime());
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      matchedDates.push(dayStr);
      const rain = typeof rainSums[i] === 'number' ? rainSums[i] : 0;
      const code = typeof weatherCodes[i] === 'number' ? weatherCodes[i] : 0;

      if (rain > maxRain) maxRain = rain;

      if (isStormWeatherCode(code)) {
        stormDetected = true;
      }

      // Alert conditions: rain_sum > 20mm or code indicates storm (95+)
      if (rain > 20 || isStormWeatherCode(code)) {
        activeAlert = true;
      }
    }
  }

  // Fallback: if no date matched ±1 day (e.g. historical report), evaluate all 3 forecast days
  if (matchedDates.length === 0 && times.length > 0) {
    for (let i = 0; i < times.length; i++) {
      matchedDates.push(times[i].slice(0, 10));
      const rain = typeof rainSums[i] === 'number' ? rainSums[i] : 0;
      const code = typeof weatherCodes[i] === 'number' ? weatherCodes[i] : 0;
      if (rain > maxRain) maxRain = rain;
      if (isStormWeatherCode(code)) stormDetected = true;
      if (rain > 20 || isStormWeatherCode(code)) activeAlert = true;
    }
  }

  return {
    activeAlert,
    severityLevel: activeAlert ? 'high' : 'low',
    maxRain: Math.round(maxRain * 10) / 10,
    matchedDates,
    stormDetected,
  };
}

export function packageDisasterResult(
  parseResult: WeatherParseResult,
  fetchSuccess: boolean
): DisasterResult {
  if (fetchSuccess && parseResult.matchedDates.length > 0) {
    return {
      source: 'disaster-live',
      activeAlert: parseResult.activeAlert,
      severityLevel: parseResult.severityLevel,
      maxRain: parseResult.maxRain,
      confidence: 0.92,
      matchedDates: parseResult.matchedDates,
    };
  }
  return {
    source: 'disaster-fallback',
    activeAlert: false,
    severityLevel: 'none',
    maxRain: 0,
    confidence: 0,
    matchedDates: [],
  };
}
