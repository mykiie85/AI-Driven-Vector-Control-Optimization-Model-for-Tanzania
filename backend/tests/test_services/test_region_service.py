"""Tests for RegionService - covers get_all_geojson, get_region_detail, get_region_names."""

import pytest

from app.services.region_service import RegionService


@pytest.mark.asyncio
async def test_get_all_geojson_returns_feature_collection(seeded_db):
    """get_all_geojson should return a GeoJSON FeatureCollection with all regions."""
    service = RegionService(seeded_db)
    result = await service.get_all_geojson()

    assert result.type == "FeatureCollection"
    assert len(result.features) == 3  # 3 seeded regions


@pytest.mark.asyncio
async def test_get_all_geojson_feature_properties(seeded_db):
    """Each feature should have correct properties (id, name, population, risk_score)."""
    service = RegionService(seeded_db)
    result = await service.get_all_geojson()

    names = {f.properties.name for f in result.features}
    assert "Dar es Salaam" in names
    assert "Dodoma" in names
    assert "Arusha" in names

    dar = next(f for f in result.features if f.properties.name == "Dar es Salaam")
    assert dar.properties.id == 1
    assert dar.properties.population == 5383728
    assert dar.properties.risk_score == 0.82


@pytest.mark.asyncio
async def test_get_all_geojson_empty_db(db_session):
    """get_all_geojson should return empty features list when no regions exist."""
    service = RegionService(db_session)
    result = await service.get_all_geojson()

    assert result.type == "FeatureCollection"
    assert len(result.features) == 0


@pytest.mark.asyncio
async def test_get_region_detail_found(seeded_db):
    """get_region_detail should return full detail for existing region."""
    service = RegionService(seeded_db)
    result = await service.get_region_detail(1)

    assert result is not None
    assert result.id == 1
    assert result.name == "Dar es Salaam"
    assert result.population == 5383728
    assert result.area_km2 == 1393
    assert result.risk_score == 0.82
    # Should have latest surveillance data
    assert result.latest_density is not None
    assert result.latest_cases is not None


@pytest.mark.asyncio
async def test_get_region_detail_not_found(seeded_db):
    """get_region_detail should return None for non-existent region."""
    service = RegionService(seeded_db)
    result = await service.get_region_detail(999)

    assert result is None


@pytest.mark.asyncio
async def test_get_region_detail_no_surveillance(db_session):
    """get_region_detail should handle regions with no surveillance data."""
    from app.models.region import Region

    db_session.add(Region(id=99, name="TestRegion", population=100, area_km2=50, risk_score=0.1))
    await db_session.flush()

    service = RegionService(db_session)
    result = await service.get_region_detail(99)

    assert result is not None
    assert result.name == "TestRegion"
    assert result.latest_density is None
    assert result.latest_cases is None


@pytest.mark.asyncio
async def test_get_region_names(seeded_db):
    """get_region_names should return id->name mapping for given IDs."""
    service = RegionService(seeded_db)
    result = await service.get_region_names([1, 2, 3])

    assert result == {1: "Dar es Salaam", 2: "Dodoma", 3: "Arusha"}


@pytest.mark.asyncio
async def test_get_region_names_partial_match(seeded_db):
    """get_region_names should only return existing regions."""
    service = RegionService(seeded_db)
    result = await service.get_region_names([1, 999])

    assert result == {1: "Dar es Salaam"}


@pytest.mark.asyncio
async def test_get_region_names_empty_list(seeded_db):
    """get_region_names should return empty dict for empty input."""
    service = RegionService(seeded_db)
    result = await service.get_region_names([])

    assert result == {}
