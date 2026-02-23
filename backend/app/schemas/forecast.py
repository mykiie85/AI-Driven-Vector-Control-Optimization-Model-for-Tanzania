from datetime import date

from pydantic import BaseModel


class ForecastPoint(BaseModel):
    date: date
    predicted_density: float
    lower_ci: float
    upper_ci: float


class ForecastResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    region_id: int
    region_name: str
    model_type: str
    forecast_days: int
    points: list[ForecastPoint]
