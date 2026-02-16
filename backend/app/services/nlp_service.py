import logging

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.region import Region
from app.models.surveillance import SurveillanceData
from app.schemas.report import ReportRequest, ReportResponse

logger = logging.getLogger(__name__)

_pipeline = None


def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        from transformers import pipeline

        logger.info("Loading NLP model: %s", settings.nlp_model)
        _pipeline = pipeline(
            "summarization",
            model=settings.nlp_model,
            max_length=settings.nlp_max_length,
            min_length=settings.nlp_min_length,
        )
    return _pipeline


class NLPService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _build_context(self, region_ids: list[int]) -> str:
        parts = []

        for region_id in region_ids:
            # Get region info
            region_q = select(Region.name, Region.risk_score, Region.population).where(
                Region.id == region_id
            )
            region_result = await self.db.execute(region_q)
            region = region_result.first()
            if not region:
                continue

            # Get surveillance stats
            stats_q = select(
                func.avg(SurveillanceData.mosquito_density).label("avg_density"),
                func.max(SurveillanceData.mosquito_density).label("max_density"),
                func.sum(SurveillanceData.malaria_cases).label("total_cases"),
                func.count(SurveillanceData.id).label("records"),
            ).where(SurveillanceData.region_id == region_id)
            stats_result = await self.db.execute(stats_q)
            stats = stats_result.first()

            parts.append(
                f"Region {region.name} (population {region.population}, risk score {region.risk_score}) "
                f"has {stats.records} surveillance records. "
                f"Average mosquito density is {stats.avg_density:.1f} per trap-night "
                f"with a peak of {stats.max_density:.1f}. "
                f"Total reported malaria cases: {stats.total_cases}."
            )

        return " ".join(parts)

    async def generate_report(self, request: ReportRequest) -> ReportResponse:
        context = await self._build_context(request.region_ids)

        if not context:
            return ReportResponse(
                summary="No data available for the requested regions.",
                regions_analyzed=0,
                model_used=settings.nlp_model,
            )

        try:
            pipe = _get_pipeline()
            result = pipe(context, do_sample=False)
            summary = result[0]["summary_text"]
        except Exception as e:
            logger.error("NLP summarization failed: %s", e)
            # Fallback: return truncated context
            summary = context[:500] + ("..." if len(context) > 500 else "")

        return ReportResponse(
            summary=summary,
            regions_analyzed=len(request.region_ids),
            model_used=settings.nlp_model,
        )
