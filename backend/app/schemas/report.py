from pydantic import BaseModel, Field


class ReportRequest(BaseModel):
    region_ids: list[int] = Field(..., min_length=1)
    include_forecast: bool = True
    include_optimization: bool = True


class ReportResponse(BaseModel):
    summary: str
    regions_analyzed: int
    model_used: str
