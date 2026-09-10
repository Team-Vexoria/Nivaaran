-- Predictive model table: district-level pre-monsoon severity forecasts
-- Uses historical Challenge + district GIS (boundary / centroid / risk_profile) data
CREATE TABLE IF NOT EXISTS predictive_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_code TEXT NOT NULL REFERENCES "District"(code) ON DELETE CASCADE,
    forecast_window_start DATE NOT NULL, -- pre-monsoon window start
    forecast_window_end DATE NOT NULL,
    predicted_severity VARCHAR(10) NOT NULL CHECK (predicted_severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
    confidence DECIMAL(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    drivers JSONB DEFAULT '{}',       -- e.g. {"historical_severity":"HIGH","gis_flood_risk":0.82}
    historical_challenge_count INT DEFAULT 0,
    district_risk_profile JSONB,      -- snapshot of District.risk_profile at forecast time
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_predictive_forecasts_district ON predictive_forecasts(district_code);
CREATE INDEX IF NOT EXISTS idx_predictive_forecasts_window ON predictive_forecasts(forecast_window_start, forecast_window_end);
CREATE INDEX IF NOT EXISTS idx_predictive_forecasts_severity ON predictive_forecasts(predicted_severity);
