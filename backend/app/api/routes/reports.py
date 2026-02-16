from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.report import ReportRequest, ReportResponse
from app.services.nlp_service import NLPService

router = APIRouter()


@router.post("/report/generate", response_model=ReportResponse)
async def generate_report(
    request: ReportRequest,
    db: AsyncSession = Depends(get_db),
):
    service = NLPService(db)
    return await service.generate_report(request)
