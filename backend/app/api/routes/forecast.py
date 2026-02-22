from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.forecast import ForecastResponse
from app.services.forecast_service import ForecastService

router = APIRouter()


@router.get("/forecast/{region_id}", response_model=ForecastResponse)
async def get_forecast(
    region_id: int,
    days: int = Query(default=30, ge=7, le=365),
    model: str = Query(default="prophet", pattern="^(prophet|arima|hybrid)$"),
    db: AsyncSession = Depends(get_db),
):
    service = ForecastService(db)
    try:
        return await service.generate_forecast(region_id, days, model)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
