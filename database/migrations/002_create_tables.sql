-- 002: Create core tables

CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    geometry GEOMETRY(MultiPolygon, 4326),
    population INTEGER,
    area_km2 FLOAT,
    risk_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_regions_geometry ON regions USING GIST (geometry);
CREATE INDEX idx_regions_name ON regions (name);

CREATE TABLE IF NOT EXISTS surveillance_data (
    id SERIAL PRIMARY KEY,
    region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mosquito_density FLOAT NOT NULL,
    rainfall_mm FLOAT,
    temperature_c FLOAT,
    humidity_pct FLOAT,
    malaria_cases INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_surveillance_region_date ON surveillance_data (region_id, date);
CREATE INDEX idx_surveillance_date ON surveillance_data (date);

CREATE TABLE IF NOT EXISTS forecasts (
    id SERIAL PRIMARY KEY,
    region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    model_type VARCHAR(20) NOT NULL DEFAULT 'prophet',
    forecast_date DATE NOT NULL,
    predicted_density FLOAT NOT NULL,
    lower_ci FLOAT,
    upper_ci FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_forecasts_region ON forecasts (region_id, forecast_date);

CREATE TABLE IF NOT EXISTS optimization_results (
    id SERIAL PRIMARY KEY,
    region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    budget_usd FLOAT NOT NULL,
    itn_units INTEGER DEFAULT 0,
    irs_units INTEGER DEFAULT 0,
    larvicide_units INTEGER DEFAULT 0,
    total_cost FLOAT,
    cases_prevented FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_optimization_region ON optimization_results (region_id);
