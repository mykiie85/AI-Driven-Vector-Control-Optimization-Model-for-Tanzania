import pytest
import pytest_asyncio

from app.schemas.optimize import OptimizationRequest
from app.services.optimizer_service import (
    CASES_PREVENTED_PER_IRS,
    CASES_PREVENTED_PER_ITN,
    CASES_PREVENTED_PER_LARVICIDE,
    COST_PER_IRS,
    COST_PER_ITN,
    COST_PER_LARVICIDE,
    OptimizerService,
)


@pytest.mark.asyncio
async def test_optimize_single_region(seeded_db):
    service = OptimizerService(seeded_db)
    request = OptimizationRequest(budget_usd=10000, region_ids=[1])

    result = await service.optimize(request)

    assert result.total_budget == 10000
    assert result.total_cost <= 10000
    assert result.total_cases_prevented > 0
    assert len(result.allocations) == 1
    assert result.allocations[0].region_name == "Dar es Salaam"


@pytest.mark.asyncio
async def test_optimize_multiple_regions(seeded_db):
    service = OptimizerService(seeded_db)
    request = OptimizationRequest(budget_usd=50000, region_ids=[1, 2, 3])

    result = await service.optimize(request)

    assert result.total_budget == 50000
    assert result.total_cost <= 50000
    assert len(result.allocations) == 3

    # Higher risk regions should get more budget
    dar_alloc = next(a for a in result.allocations if a.region_id == 1)
    arusha_alloc = next(a for a in result.allocations if a.region_id == 3)
    assert dar_alloc.cost >= arusha_alloc.cost


@pytest.mark.asyncio
async def test_optimize_respects_budget_constraint(seeded_db):
    service = OptimizerService(seeded_db)
    request = OptimizationRequest(budget_usd=100, region_ids=[1])

    result = await service.optimize(request)

    assert result.total_cost <= 100


@pytest.mark.asyncio
async def test_optimize_allocation_units_nonnegative(seeded_db):
    service = OptimizerService(seeded_db)
    request = OptimizationRequest(budget_usd=5000, region_ids=[1, 2])

    result = await service.optimize(request)

    for alloc in result.allocations:
        assert alloc.itn_units >= 0
        assert alloc.irs_units >= 0
        assert alloc.larvicide_units >= 0
        assert alloc.cost >= 0
        assert alloc.cases_prevented >= 0


def test_cost_constants():
    assert COST_PER_ITN == 5.0
    assert COST_PER_IRS == 15.0
    assert COST_PER_LARVICIDE == 8.0
    assert CASES_PREVENTED_PER_ITN == 0.12
    assert CASES_PREVENTED_PER_IRS == 0.45
    assert CASES_PREVENTED_PER_LARVICIDE == 0.20
