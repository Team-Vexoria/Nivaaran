/**
 * Predictive model stub: forecasts district-level severity before monsoon
 * using historical Challenge + district GIS (boundary / centroid / risk_profile) data.
 */

export interface DistrictForecast {
  districtCode: string;
  predictedSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number; // 0.0–1.0
  forecastDate: Date; // pre-monsoon forecast window
  drivers: string[]; // e.g. ["historical_severity", "gis_flood_risk", "priority_score_trend"]
}

export interface MonsoonForecastInput {
  districtCode: string;
  historicalChallenges: { severity: string; district_code: string; priority_score: number; status: string }[];
  districtBoundary?: object; // PostGIS MultiPolygon
  districtRiskProfile?: { floodRisk?: number; droughtRisk?: number; landslideRisk?: number };
  forecastWindowDays?: number; // default 30 (pre-monsoon)
}

/**
 * Stub service: uses historical Challenge table + District GIS to forecast
 * severity by district before the monsoon season.
 */
export async function forecastDistrictSeverity(
  input: MonsoonForecastInput
): Promise<DistrictForecast> {
  // Stub: aggregate historical severity from challenge records + GIS risk profile
  const drivers: string[] = ['historical_challenge_severity', 'district_gis_risk_profile'];

  // Derive rough severity from historical challenge priority_score trend + GIS flood risk
  const avgPriority =
    input.historicalChallenges.reduce((s, c) => s + (c.priority_score ?? 0), 0) /
    Math.max(input.historicalChallenges.length, 1);

  const floodRisk = input.districtRiskProfile?.floodRisk ?? 0.5;
  const predictedSeverity: DistrictForecast['predictedSeverity'] =
    avgPriority > 7.5 || floodRisk > 0.8 ? 'CRITICAL'
    : avgPriority > 5.5 || floodRisk > 0.6 ? 'HIGH'
    : avgPriority > 3.5 || floodRisk > 0.4 ? 'MEDIUM'
    : 'LOW';

  return {
    districtCode: input.districtCode,
    predictedSeverity,
    confidence: Math.min(0.95, 0.65 + avgPriority * 0.03 + floodRisk * 0.15),
    forecastDate: new Date(),
    drivers,
  };
}

/** Batch forecast across all districts using Challenge history + GIS */
export async function forecastAllDistricts(
  inputs: MonsoonForecastInput[]
): Promise<DistrictForecast[]> {
  return Promise.all(inputs.map(forecastDistrictSeverity));
}
