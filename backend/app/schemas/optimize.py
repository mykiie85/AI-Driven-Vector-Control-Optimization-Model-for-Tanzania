from pydantic import BaseModel, Field


class OptimizationRequest(BaseModel):
    budget_usd: float = Field(..., gt=0, description="Total budget in USD")
    region_ids: list[int] = Field(..., min_length=1, description="List of region IDs to optimize for")


class RegionAllocation(BaseModel):
    region_id: int
    region_name: str
    itn_units: int
    irs_units: int
    larvicide_units: int
    cost: float
    cases_prevented: float


class OptimizationResponse(BaseModel):
    total_budget: float
    total_cost: float
    total_cases_prevented: float
    allocations: list[RegionAllocation]
