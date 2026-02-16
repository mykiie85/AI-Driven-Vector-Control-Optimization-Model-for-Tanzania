from datetime import date
from unittest.mock import patch, AsyncMock

import pytest

from app.schemas.forecast import ForecastPoint, ForecastResponse


@pytest.mark.asyncio
async def test_get_forecast_success(client):
    mock_response = ForecastResponse(
        region_id=1,
        region_name="Dar es Salaam",
        model_type="prophet",
        forecast_days=30,
        points=[
            ForecastPoint(date=date(2024, 7, 1), predicted_density=120.5, lower_ci=100.0, upper_ci=140.0),
        ],
    )

    with patch("app.api.routes.forecast.ForecastService") as MockService:
        instance = MockService.return_value
        instance.generate_forecast = AsyncMock(return_value=mock_response)

        response = await client.get("/api/v1/forecast/1?days=30&model=prophet")

    assert response.status_code == 200
    data = response.json()
    assert data["region_name"] == "Dar es Salaam"
    assert len(data["points"]) == 1


@pytest.mark.asyncio
async def test_get_forecast_region_not_found(client):
    with patch("app.api.routes.forecast.ForecastService") as MockService:
        instance = MockService.return_value
        instance.generate_forecast = AsyncMock(side_effect=ValueError("Region 999 not found"))

        response = await client.get("/api/v1/forecast/999")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_forecast_server_error(client):
    with patch("app.api.routes.forecast.ForecastService") as MockService:
        instance = MockService.return_value
        instance.generate_forecast = AsyncMock(side_effect=RuntimeError("Model failed"))

        response = await client.get("/api/v1/forecast/1")

    assert response.status_code == 500
