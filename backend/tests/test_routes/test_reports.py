from unittest.mock import patch, AsyncMock

import pytest

from app.schemas.report import ReportResponse


@pytest.mark.asyncio
async def test_generate_report_success(client):
    mock_response = ReportResponse(
        summary="Test summary of malaria surveillance data.",
        regions_analyzed=2,
        model_used="facebook/bart-large-cnn",
    )

    with patch("app.api.routes.reports.NLPService") as MockService:
        instance = MockService.return_value
        instance.generate_report = AsyncMock(return_value=mock_response)

        response = await client.post(
            "/api/v1/report/generate",
            json={"region_ids": [1, 2], "include_forecast": True, "include_optimization": True},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["regions_analyzed"] == 2
    assert "summary" in data


@pytest.mark.asyncio
async def test_generate_report_validation_error(client):
    response = await client.post(
        "/api/v1/report/generate",
        json={"region_ids": [], "include_forecast": True, "include_optimization": True},
    )
    assert response.status_code == 422
