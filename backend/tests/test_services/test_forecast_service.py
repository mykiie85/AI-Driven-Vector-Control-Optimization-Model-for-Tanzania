from datetime import date, timedelta
from unittest.mock import patch, MagicMock, AsyncMock

import pandas as pd
import pytest

from app.services.forecast_service import ForecastService
from app.schemas.forecast import ForecastPoint, ForecastResponse


@pytest.mark.asyncio
async def test_get_historical_data(seeded_db):
    service = ForecastService(seeded_db)
    df = await service._get_historical_data(1)

    assert isinstance(df, pd.DataFrame)
    assert "ds" in df.columns
    assert "y" in df.columns
    assert len(df) == 90


@pytest.mark.asyncio
async def test_get_historical_data_insufficient(seeded_db):
    service = ForecastService(seeded_db)

    with pytest.raises(ValueError, match="Insufficient data"):
        await service._get_historical_data(999)


@pytest.mark.asyncio
async def test_get_region_name(seeded_db):
    service = ForecastService(seeded_db)
    name = await service._get_region_name(1)
    assert name == "Dar es Salaam"


@pytest.mark.asyncio
async def test_get_region_name_not_found(seeded_db):
    service = ForecastService(seeded_db)

    with pytest.raises(ValueError, match="not found"):
        await service._get_region_name(999)


def test_prophet_forecast():
    """Test Prophet forecast with synthetic data."""
    dates = pd.date_range("2023-01-01", periods=365, freq="D")
    values = [50 + 30 * (i % 90 / 90) for i in range(365)]
    df = pd.DataFrame({"ds": dates, "y": values})

    service = ForecastService.__new__(ForecastService)
    points = service._prophet_forecast(df, 30)

    assert len(points) == 30
    for p in points:
        assert p.predicted_density >= 0
        assert p.lower_ci >= 0
        assert p.upper_ci >= p.predicted_density or p.upper_ci >= 0


def test_hybrid_forecast():
    """Test hybrid combining of Prophet and ARIMA results."""
    from app.schemas.forecast import ForecastPoint

    prophet_points = [
        ForecastPoint(date=date(2024, 6, 1) + timedelta(days=i), predicted_density=100.0, lower_ci=80.0, upper_ci=120.0)
        for i in range(5)
    ]
    arima_points = [
        ForecastPoint(date=date(2024, 6, 1) + timedelta(days=i), predicted_density=90.0, lower_ci=70.0, upper_ci=110.0)
        for i in range(5)
    ]

    service = ForecastService.__new__(ForecastService)
    combined = service._hybrid_forecast(prophet_points, arima_points)

    assert len(combined) == 5
    assert combined[0].predicted_density == 95.0  # (100+90)/2
    assert combined[0].lower_ci == 70.0  # min(80, 70)
    assert combined[0].upper_ci == 120.0  # max(120, 110)


@pytest.mark.asyncio
async def test_generate_forecast_prophet(seeded_db):
    """generate_forecast with prophet model should return valid ForecastResponse."""
    service = ForecastService(seeded_db)

    mock_points = [
        ForecastPoint(date=date(2024, 4, 1) + timedelta(days=i), predicted_density=100.0, lower_ci=80.0, upper_ci=120.0)
        for i in range(7)
    ]

    with patch.object(service, "_prophet_forecast", return_value=mock_points):
        result = await service.generate_forecast(1, days=7, model_type="prophet")

    assert isinstance(result, ForecastResponse)
    assert result.region_id == 1
    assert result.region_name == "Dar es Salaam"
    assert result.model_type == "prophet"
    assert result.forecast_days == 7
    assert len(result.points) == 7


@pytest.mark.asyncio
async def test_generate_forecast_unknown_model(seeded_db):
    """generate_forecast with unknown model type should raise ValueError."""
    service = ForecastService(seeded_db)

    with pytest.raises(ValueError, match="Unknown model type"):
        await service.generate_forecast(1, days=30, model_type="unknown")


@pytest.mark.asyncio
async def test_generate_forecast_region_not_found(seeded_db):
    """generate_forecast for non-existent region should raise ValueError."""
    service = ForecastService(seeded_db)

    with pytest.raises(ValueError, match="not found"):
        await service.generate_forecast(999, days=30, model_type="prophet")


@pytest.mark.asyncio
async def test_generate_forecast_hybrid_arima_fallback(seeded_db):
    """hybrid model should fallback to prophet-only when ARIMA fails."""
    service = ForecastService(seeded_db)

    mock_points = [
        ForecastPoint(date=date(2024, 4, 1) + timedelta(days=i), predicted_density=100.0, lower_ci=80.0, upper_ci=120.0)
        for i in range(7)
    ]

    with patch.object(service, "_prophet_forecast", return_value=mock_points), \
         patch.object(service, "_arima_forecast", side_effect=RuntimeError("R unavailable")):
        result = await service.generate_forecast(1, days=7, model_type="hybrid")

    # Should fallback to prophet
    assert result.model_type == "prophet"
    assert len(result.points) == 7
