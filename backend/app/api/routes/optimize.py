from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.optimize import OptimizationRequest, OptimizationResponse
from app.services.optimizer_service import OptimizerService

router = APIRouter()


@router.post("/optimize", response_model=OptimizationResponse)
async def optimize_budget(
    request: OptimizationRequest,
    db: AsyncSession = Depends(get_db),
):
    service = OptimizerService(db)
    return await service.optimize(request)
