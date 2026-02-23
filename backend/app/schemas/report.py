from pydantic import BaseModel, Field


class ReportAllocation(BaseModel):
    region_id: int
    region_name: str
    itn_units: int = 0
    irs_units: int = 0
    larvicide_units: int = 0
    cases_prevented: float = 0.0


class ReportRequest(BaseModel):
    region_ids: list[int] = Field(..., min_length=1)
    budget_usd: float | None = None
    allocations: list[ReportAllocation] | None = None
    total_cases_prevented: float | None = None
    include_forecast: bool = True
    include_optimization: bool = True


class ReportResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    summary: str
    regions_analyzed: int
    model_used: str
    pdf_url: str | None = None
