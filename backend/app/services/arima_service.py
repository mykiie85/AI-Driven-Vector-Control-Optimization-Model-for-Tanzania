import asyncio
import json
import logging
import os

import numpy as np
import pandas as pd

from app.core.config import settings
from app.schemas.forecast import ForecastPoint

logger = logging.getLogger(__name__)


class ARIMAService:
    def __init__(self):
        self.r_script = os.path.join(settings.r_script_path, "arima_forecast.R")
        self.timeout = settings.r_timeout

    async def forecast(self, df: pd.DataFrame, days: int) -> list[ForecastPoint]:
        """Try R-based ARIMA first, fall back to Python statsmodels."""
        try:
            return await self._r_forecast(df, days)
        except (RuntimeError, FileNotFoundError, OSError) as e:
            logger.warning("R ARIMA unavailable (%s), using Python statsmodels fallback", e)
            return await self._python_forecast(df, days)

    async def _r_forecast(self, df: pd.DataFrame, days: int) -> list[ForecastPoint]:
        input_data = {
            "dates": [d.isoformat() if hasattr(d, "isoformat") else str(d) for d in df["ds"]],
            "values": df["y"].tolist(),
            "horizon": days,
        }

        try:
            process = await asyncio.create_subprocess_exec(
                "Rscript", self.r_script,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await asyncio.wait_for(
                process.communicate(input=json.dumps(input_data).encode()),
                timeout=self.timeout,
            )

            if process.returncode != 0:
                logger.error("R ARIMA error: %s", stderr.decode())
                raise RuntimeError(f"R ARIMA failed: {stderr.decode()[:500]}")

            result = json.loads(stdout.decode())

            return [
                ForecastPoint(
                    date=point["date"],
                    predicted_density=max(0, round(point["forecast"], 2)),
                    lower_ci=max(0, round(point["lower"], 2)),
                    upper_ci=max(0, round(point["upper"], 2)),
                )
                for point in result["forecasts"]
            ]

        except FileNotFoundError:
            logger.error("Rscript not found. Ensure R is installed and in PATH.")
            raise RuntimeError("Rscript not found. R is not installed or not in PATH.")
        except OSError as e:
            logger.error("OS error running R ARIMA: %s", e)
            raise RuntimeError(f"Failed to run R ARIMA subprocess: {e}")
        except asyncio.TimeoutError:
            raise RuntimeError(f"R ARIMA timed out after {self.timeout}s")
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Failed to parse R output: {e}")

    async def _python_forecast(self, df: pd.DataFrame, days: int) -> list[ForecastPoint]:
        """Pure Python ARIMA forecast using statsmodels."""
        from statsmodels.tsa.arima.model import ARIMA

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._fit_statsmodels_arima, df, days)

    @staticmethod
    def _fit_statsmodels_arima(df: pd.DataFrame, days: int) -> list[ForecastPoint]:
        from statsmodels.tsa.arima.model import ARIMA
        from datetime import timedelta

        values = df["y"].values.astype(float)
        last_date = pd.to_datetime(df["ds"].iloc[-1])

        try:
            model = ARIMA(values, order=(2, 1, 2))
            fitted = model.fit()
            forecast_result = fitted.get_forecast(steps=days)
            predicted = forecast_result.predicted_mean
            ci = forecast_result.conf_int(alpha=0.05)
        except Exception:
            # Fallback to simpler model if (2,1,2) fails
            model = ARIMA(values, order=(1, 1, 1))
            fitted = model.fit()
            forecast_result = fitted.get_forecast(steps=days)
            predicted = forecast_result.predicted_mean
            ci = forecast_result.conf_int(alpha=0.05)

        points = []
        for i in range(days):
            forecast_date = (last_date + timedelta(days=i + 1)).date()
            points.append(
                ForecastPoint(
                    date=forecast_date,
                    predicted_density=max(0, round(float(predicted[i]), 2)),
                    lower_ci=max(0, round(float(ci[i, 0]), 2)),
                    upper_ci=max(0, round(float(ci[i, 1]), 2)),
                )
            )
        return points
