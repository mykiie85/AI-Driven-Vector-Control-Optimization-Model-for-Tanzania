from typing import Any

from pydantic import BaseModel


class RegionProperties(BaseModel):
    id: int
    name: str
    population: int | None = None
    area_km2: float | None = None
    risk_score: float = 0.0


class RegionFeature(BaseModel):
    type: str = "Feature"
    geometry: dict[str, Any]
    properties: RegionProperties


class RegionGeoJSON(BaseModel):
    type: str = "FeatureCollection"
    features: list[RegionFeature]


class RegionDetail(BaseModel):
    id: int
    name: str
    population: int | None = None
    area_km2: float | None = None
    risk_score: float = 0.0
    latest_density: float | None = None
    latest_cases: int | None = None
