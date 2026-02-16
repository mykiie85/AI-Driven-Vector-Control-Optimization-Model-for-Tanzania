from unittest.mock import patch, AsyncMock

import pytest

from app.schemas.optimize import OptimizationResponse, RegionAllocation


@pytest.mark.asyncio
async def test_optimize_success(client):
    mock_response = OptimizationResponse(
        total_budget=50000,
        total_cost=49500,
        total_cases_prevented=500,
        allocations=[
            RegionAllocation(
                region_id=1, region_name="Dar es Salaam",
                itn_units=5000, irs_units=100, larvicide_units=200,
                cost=28100, cases_prevented=280,
            ),
        ],
    )

    with patch("app.api.routes.optimize.OptimizerService") as MockService:
        instance = MockService.return_value
        instance.optimize = AsyncMock(return_value=mock_response)

        response = await client.post(
            "/api/v1/optimize",
            json={"budget_usd": 50000, "region_ids": [1]},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["total_budget"] == 50000
    assert len(data["allocations"]) == 1


@pytest.mark.asyncio
async def test_optimize_validation_error(client):
    response = await client.post(
        "/api/v1/optimize",
        json={"budget_usd": -100, "region_ids": [1]},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_optimize_empty_regions(client):
    response = await client.post(
        "/api/v1/optimize",
        json={"budget_usd": 50000, "region_ids": []},
    )
    assert response.status_code == 422
