import asyncio
import json
import logging
import os

import pandas as pd

from app.core.config import settings
from app.schemas.forecast import ForecastPoint

logger = logging.getLogger(__name__)


class ARIMAService:
    def __init__(self):
        self.r_script = os.path.join(settings.r_script_path, "arima_forecast.R")
        self.timeout = settings.r_timeout

    async def forecast(self, df: pd.DataFrame, days: int) -> list[ForecastPoint]:
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

        except asyncio.TimeoutError:
            raise RuntimeError(f"R ARIMA timed out after {self.timeout}s")
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Failed to parse R output: {e}")
