from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
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


@router.get("/reports/download/{filename}")
async def download_report(filename: str):
    import os
    filepath = os.path.join("/tmp/reports", filename)
    if not os.path.exists(filepath):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(filepath, media_type="application/pdf", filename=f"VCOM-TZ_Report_{filename}")
