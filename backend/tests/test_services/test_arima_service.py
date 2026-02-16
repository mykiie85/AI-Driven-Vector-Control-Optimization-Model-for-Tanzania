import json
from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pandas as pd
import pytest

from app.services.arima_service import ARIMAService


def make_test_df(n=100):
    dates = pd.date_range("2023-01-01", periods=n, freq="D")
    values = [50 + i * 0.1 for i in range(n)]
    return pd.DataFrame({"ds": dates, "y": values})


def make_r_output(horizon=30, start_date=date(2023, 4, 11)):
    forecasts = []
    for i in range(horizon):
        d = start_date + timedelta(days=i)
        forecasts.append({
            "date": d.isoformat(),
            "forecast": 60.0 + i * 0.1,
            "lower": 50.0 + i * 0.05,
            "upper": 70.0 + i * 0.15,
        })
    return json.dumps({"forecasts": forecasts}).encode()


@pytest.mark.asyncio
async def test_arima_forecast_success():
    mock_process = AsyncMock()
    mock_process.returncode = 0
    mock_process.communicate = AsyncMock(return_value=(make_r_output(), b""))

    with patch("asyncio.create_subprocess_exec", return_value=mock_process):
        service = ARIMAService()
        df = make_test_df()
        points = await service.forecast(df, 30)

    assert len(points) == 30
    assert points[0].predicted_density >= 0
    assert points[0].lower_ci >= 0
    assert points[0].upper_ci >= 0


@pytest.mark.asyncio
async def test_arima_forecast_r_failure():
    mock_process = AsyncMock()
    mock_process.returncode = 1
    mock_process.communicate = AsyncMock(return_value=(b"", b"Error in auto.arima"))

    with patch("asyncio.create_subprocess_exec", return_value=mock_process):
        service = ARIMAService()
        df = make_test_df()

        with pytest.raises(RuntimeError, match="R ARIMA failed"):
            await service.forecast(df, 30)


@pytest.mark.asyncio
async def test_arima_forecast_timeout():
    import asyncio

    mock_process = AsyncMock()
    mock_process.communicate = AsyncMock(side_effect=asyncio.TimeoutError)

    with patch("asyncio.create_subprocess_exec", return_value=mock_process):
        service = ARIMAService()
        service.timeout = 1
        df = make_test_df()

        with pytest.raises(RuntimeError, match="timed out"):
            await service.forecast(df, 30)


@pytest.mark.asyncio
async def test_arima_forecast_invalid_json():
    mock_process = AsyncMock()
    mock_process.returncode = 0
    mock_process.communicate = AsyncMock(return_value=(b"not json", b""))

    with patch("asyncio.create_subprocess_exec", return_value=mock_process):
        service = ARIMAService()
        df = make_test_df()

        with pytest.raises(RuntimeError, match="Failed to parse"):
            await service.forecast(df, 30)
