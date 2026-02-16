import logging
from datetime import date, timedelta

import numpy as np
import pandas as pd
from prophet import Prophet
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

        if len(rows) < 30:
            raise ValueError(f"Insufficient data for region {region_id}: {len(rows)} rows (need 30+)")

        return pd.DataFrame(
            [{"ds": row.date, "y": row.mosquito_density} for row in rows]
        )

    async def _get_region_name(self, region_id: int) -> str:
        result = await self.db.execute(select(Region.name).where(Region.id == region_id))
        name = result.scalar_one_or_none()
        if not name:
            raise ValueError(f"Region {region_id} not found")
        return name

    def _prophet_forecast(self, df: pd.DataFrame, days: int) -> list[ForecastPoint]:
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
                predicted_density=max(0, round(row["yhat"], 2)),
                lower_ci=max(0, round(row["yhat_lower"], 2)),
                upper_ci=max(0, round(row["yhat_upper"], 2)),
            )
            for _, row in forecast_rows.iterrows()
        ]

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
            points = self._prophet_forecast(df, days)
        elif model_type == "arima":
            points = await self._arima_forecast(df, days)
        elif model_type == "hybrid":
            prophet_points = self._prophet_forecast(df, days)
            try:
                arima_points = await self._arima_forecast(df, days)
                points = self._hybrid_forecast(prophet_points, arima_points)
            except RuntimeError:
                logger.warning("ARIMA failed, falling back to Prophet only")
                points = prophet_points
                model_type = "prophet"
        else:
            raise ValueError(f"Unknown model type: {model_type}")

        return ForecastResponse(
            region_id=region_id,
            region_name=region_name,
            model_type=model_type,
            forecast_days=days,
            points=points,
        )
