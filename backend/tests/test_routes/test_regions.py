import pytest
from unittest.mock import patch, AsyncMock

from app.schemas.region import RegionGeoJSON, RegionDetail


@pytest.mark.asyncio
async def test_list_regions(client):
    mock_geojson = RegionGeoJSON(type="FeatureCollection", features=[])

    with patch("app.api.routes.regions.RegionService") as MockService:
        instance = MockService.return_value
        instance.get_all_geojson = AsyncMock(return_value=mock_geojson)

        response = await client.get("/api/v1/regions")

    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"


@pytest.mark.asyncio
async def test_get_region_found(client):
    mock_detail = RegionDetail(
        id=1, name="Dar es Salaam", population=5383728,
        area_km2=1393, risk_score=0.82,
        latest_density=120.5, latest_cases=12
    )

    with patch("app.api.routes.regions.RegionService") as MockService:
        instance = MockService.return_value
        instance.get_region_detail = AsyncMock(return_value=mock_detail)

        response = await client.get("/api/v1/regions/1")

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Dar es Salaam"
    assert data["risk_score"] == 0.82


@pytest.mark.asyncio
async def test_get_region_not_found(client):
    with patch("app.api.routes.regions.RegionService") as MockService:
        instance = MockService.return_value
        instance.get_region_detail = AsyncMock(return_value=None)

        response = await client.get("/api/v1/regions/999")

    assert response.status_code == 404
