from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.region import RegionDetail, RegionGeoJSON
from app.services.region_service import RegionService

router = APIRouter()


@router.get("/regions", response_model=RegionGeoJSON)
async def list_regions(db: AsyncSession = Depends(get_db)):
    service = RegionService(db)
    return await service.get_all_geojson()


@router.get("/regions/{region_id}", response_model=RegionDetail)
async def get_region(region_id: int, db: AsyncSession = Depends(get_db)):
    service = RegionService(db)
    region = await service.get_region_detail(region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    return region
