export interface RegionProperties {
  id: number;
  name: string;
  population: number | null;
  area_km2: number | null;
  risk_score: number;
}

export interface RegionFeature {
  type: "Feature";
  geometry: GeoJSON.Geometry;
  properties: RegionProperties;
}

export interface RegionGeoJSON {
  type: "FeatureCollection";
  features: RegionFeature[];
}

export interface RegionDetail {
  id: number;
  name: string;
  population: number | null;
  area_km2: number | null;
  risk_score: number;
  latest_density: number | null;
  latest_cases: number | null;
}

export interface ForecastPoint {
  date: string;
  predicted_density: number;
  lower_ci: number;
  upper_ci: number;
}

export interface ForecastResponse {
  region_id: number;
  region_name: string;
  model_type: string;
  forecast_days: number;
  points: ForecastPoint[];
}

export interface OptimizationRequest {
  budget_usd: number;
  region_ids: number[];
}

export interface RegionAllocation {
  region_id: number;
  region_name: string;
  itn_units: number;
  irs_units: number;
  larvicide_units: number;
  cost: number;
  cases_prevented: number;
}

export interface OptimizationResponse {
  total_budget: number;
  total_cost: number;
  total_cases_prevented: number;
  allocations: RegionAllocation[];
}

export interface ReportRequest {
  region_ids: number[];
  include_forecast: boolean;
  include_optimization: boolean;
}

export interface ReportResponse {
  summary: string;
  regions_analyzed: number;
  model_used: string;
  pdf_url: string | null;
}
