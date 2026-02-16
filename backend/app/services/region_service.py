import json

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.region import Region
from app.models.surveillance import SurveillanceData
from app.schemas.region import (
    RegionDetail,
    RegionFeature,
    RegionGeoJSON,
    RegionProperties,
)


class RegionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_geojson(self) -> RegionGeoJSON:
        query = select(
            Region.id,
            Region.name,
            Region.population,
            Region.area_km2,
            Region.risk_score,
            func.ST_AsGeoJSON(Region.geometry).label("geojson"),
        )
        result = await self.db.execute(query)
        rows = result.all()

        features = []
        for row in rows:
            geom = json.loads(row.geojson) if row.geojson else {"type": "MultiPolygon", "coordinates": []}
            features.append(
                RegionFeature(
                    geometry=geom,
                    properties=RegionProperties(
                        id=row.id,
                        name=row.name,
                        population=row.population,
                        area_km2=row.area_km2,
                        risk_score=row.risk_score or 0.0,
                    ),
                )
            )

        return RegionGeoJSON(features=features)

    async def get_region_detail(self, region_id: int) -> RegionDetail | None:
        query = select(Region).where(Region.id == region_id)
        result = await self.db.execute(query)
        region = result.scalar_one_or_none()

        if not region:
            return None

        # Get latest surveillance data
        latest_query = (
            select(SurveillanceData.mosquito_density, SurveillanceData.malaria_cases)
            .where(SurveillanceData.region_id == region_id)
            .order_by(SurveillanceData.date.desc())
            .limit(1)
        )
        latest_result = await self.db.execute(latest_query)
        latest = latest_result.first()

        return RegionDetail(
            id=region.id,
            name=region.name,
            population=region.population,
            area_km2=region.area_km2,
            risk_score=region.risk_score or 0.0,
            latest_density=latest.mosquito_density if latest else None,
            latest_cases=latest.malaria_cases if latest else None,
        )

    async def get_region_names(self, region_ids: list[int]) -> dict[int, str]:
        query = select(Region.id, Region.name).where(Region.id.in_(region_ids))
        result = await self.db.execute(query)
        return {row.id: row.name for row in result.all()}
