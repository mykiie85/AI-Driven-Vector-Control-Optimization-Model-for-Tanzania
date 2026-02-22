import logging
from datetime import date, timedelta

import numpy as np
import pandas as pd
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.region import Region
from app.models.surveillance import SurveillanceData
from app.schemas.forecast import ForecastPoint, ForecastResponse
from app.services.arima_service import ARIMAService

logger = logging.getLogger(__name__)


class ForecastService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_historical_data(self, region_id: int) -> pd.DataFrame:
        query = (
            select(SurveillanceData.date, SurveillanceData.mosquito_density)
            .where(SurveillanceData.region_id == region_id)
            .order_by(SurveillanceData.date)
        )
        result = await self.db.execute(query)
        rows = result.all()

        if len(rows) < 10:
            raise ValueError(f"Insufficient data for region {region_id}: {len(rows)} rows (need 10+)")

        df = pd.DataFrame(
            [{"ds": row.date, "y": float(row.mosquito_density)} for row in rows]
        )
        df["ds"] = pd.to_datetime(df["ds"])
        return df

    async def _get_region_name(self, region_id: int) -> str:
        result = await self.db.execute(select(Region.name).where(Region.id == region_id))
        name = result.scalar_one_or_none()
        if not name:
            raise ValueError(f"Region {region_id} not found")
        return name

    def _prophet_forecast(self, df: pd.DataFrame, days: int) -> list[ForecastPoint]:
        from prophet import Prophet

        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            changepoint_prior_scale=0.05,
        )
        model.fit(df)

        future = model.make_future_dataframe(periods=days)
        prediction = model.predict(future)

        forecast_rows = prediction.tail(days)
        return [
            ForecastPoint(
                date=row["ds"].date() if hasattr(row["ds"], "date") else row["ds"],
                predicted_density=max(0, round(float(row["yhat"]), 2)),
                lower_ci=max(0, round(float(row["yhat_lower"]), 2)),
                upper_ci=max(0, round(float(row["yhat_upper"]), 2)),
            )
            for _, row in forecast_rows.iterrows()
        ]

    def _statistical_fallback(self, df: pd.DataFrame, days: int) -> list[ForecastPoint]:
        """Simple exponential smoothing fallback when Prophet/ARIMA fail."""
        values = df["y"].values.astype(float)
        last_date = pd.to_datetime(df["ds"].iloc[-1])

        # Exponential weighted moving average
        alpha = 0.3
        level = values[-1]
        mean_val = float(np.mean(values))
        std_val = float(np.std(values)) if len(values) > 1 else mean_val * 0.1

        points = []
        for i in range(days):
            forecast_date = (last_date + timedelta(days=i + 1)).date()
            # Decay toward mean
            predicted = level * (1 - alpha) ** (i + 1) + mean_val * (1 - (1 - alpha) ** (i + 1))
            points.append(
                ForecastPoint(
                    date=forecast_date,
                    predicted_density=max(0, round(predicted, 2)),
                    lower_ci=max(0, round(predicted - 1.96 * std_val, 2)),
                    upper_ci=max(0, round(predicted + 1.96 * std_val, 2)),
                )
            )
        return points

    async def _arima_forecast(self, df: pd.DataFrame, days: int) -> list[ForecastPoint]:
        arima = ARIMAService()
        return await arima.forecast(df, days)

    def _hybrid_forecast(
        self, prophet_points: list[ForecastPoint], arima_points: list[ForecastPoint]
    ) -> list[ForecastPoint]:
        combined = []
        for p, a in zip(prophet_points, arima_points):
            combined.append(
                ForecastPoint(
                    date=p.date,
                    predicted_density=round((p.predicted_density + a.predicted_density) / 2, 2),
                    lower_ci=round(min(p.lower_ci, a.lower_ci), 2),
                    upper_ci=round(max(p.upper_ci, a.upper_ci), 2),
                )
            )
        return combined

    async def generate_forecast(
        self, region_id: int, days: int = 30, model_type: str = "prophet"
    ) -> ForecastResponse:
        region_name = await self._get_region_name(region_id)
        df = await self._get_historical_data(region_id)

        if model_type == "prophet":
            try:
                points = self._prophet_forecast(df, days)
            except Exception as e:
                logger.warning("Prophet forecast failed: %s — falling back to statistical model", e)
                points = self._statistical_fallback(df, days)
                model_type = "statistical"
        elif model_type == "arima":
            try:
                points = await self._arima_forecast(df, days)
            except Exception as e:
                logger.warning("ARIMA forecast failed: %s — falling back to statistical model", e)
                points = self._statistical_fallback(df, days)
                model_type = "statistical"
        elif model_type == "hybrid":
            prophet_points = None
            arima_points = None
            try:
                prophet_points = self._prophet_forecast(df, days)
            except Exception as e:
                logger.warning("Prophet failed in hybrid mode: %s", e)
            try:
                arima_points = await self._arima_forecast(df, days)
            except Exception as e:
                logger.warning("ARIMA failed in hybrid mode: %s", e)

            if prophet_points and arima_points:
                points = self._hybrid_forecast(prophet_points, arima_points)
            elif prophet_points:
                points = prophet_points
                model_type = "prophet"
            elif arima_points:
                points = arima_points
                model_type = "arima"
            else:
                points = self._statistical_fallback(df, days)
                model_type = "statistical"
        else:
            raise ValueError(f"Unknown model type: {model_type}")

        return ForecastResponse(
            region_id=region_id,
            region_name=region_name,
            model_type=model_type,
            forecast_days=days,
            points=points,
        )
