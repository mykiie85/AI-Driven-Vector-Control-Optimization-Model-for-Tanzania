import logging
import os
import uuid
from datetime import datetime

from jinja2 import Template
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.region import Region
from app.models.surveillance import SurveillanceData
from app.schemas.report import ReportRequest, ReportResponse

logger = logging.getLogger(__name__)

_pipeline = None

REPORT_DIR = "/tmp/reports"

REPORT_TEMPLATE = """\
<!DOCTYPE html>
<html>
<head>
<style>
  @page { margin: 1cm; size: A4; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 20px; }
  .header { background: linear-gradient(135deg, #0f0a1e, #1a1040); color: white; padding: 30px; border-radius: 12px; margin-bottom: 24px; }
  .header h1 { margin: 0 0 8px; font-size: 24px; }
  .header p { margin: 0; opacity: .8; font-size: 13px; }
  .stats-grid { display: flex; gap: 16px; margin-bottom: 24px; }
  .stat-card { flex: 1; background: #f8f7ff; border: 1px solid #e8e5f0; border-radius: 10px; padding: 16px; text-align: center; }
  .stat-value { font-size: 28px; font-weight: 700; color: #6c3ce0; }
  .stat-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: .5px; margin-top: 4px; }
  h2 { color: #1a1040; font-size: 18px; margin: 24px 0 12px; border-bottom: 2px solid #6c3ce0; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; font-size: 13px; }
  th { background: #1a1040; color: white; padding: 10px 12px; text-align: left; }
  td { padding: 8px 12px; border-bottom: 1px solid #e8e5f0; }
  tr:nth-child(even) { background: #f8f7ff; }
  .summary-box { background: linear-gradient(135deg, #f8f7ff, #ede8ff); border-left: 4px solid #6c3ce0; padding: 16px 20px; border-radius: 0 10px 10px 0; margin: 16px 0; font-size: 14px; line-height: 1.7; }
  .footer { margin-top: 30px; padding-top: 16px; border-top: 1px solid #e8e5f0; font-size: 11px; color: #888; text-align: center; }
  .total-row { font-weight: 700; background: #ede8ff !important; }
</style>
</head>
<body>
  <div class="header">
    <h1>VCOM-TZ Optimization Report</h1>
    <p>Generated on {{ date }} | AI-Driven Vector Control Optimization Model for Tanzania</p>
  </div>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-value">{{ regions_count }}</div><div class="stat-label">Regions Analyzed</div></div>
    {% if budget %}<div class="stat-card"><div class="stat-value">{{ "{:,.0f}".format(budget) }}</div><div class="stat-label">Budget (TSH)</div></div>{% endif %}
    {% if total_prevented %}<div class="stat-card"><div class="stat-value">{{ "{:,.0f}".format(total_prevented) }}</div><div class="stat-label">Cases Prevented</div></div>{% endif %}
  </div>
  {% if allocations %}
  <h2>Resource Allocation</h2>
  <table>
    <thead><tr><th>Region</th><th>ITNs</th><th>IRS Sprays</th><th>Larvicide</th><th>Cases Prevented</th></tr></thead>
    <tbody>
      {% for a in allocations %}
      <tr><td>{{ a.region_name }}</td><td>{{ "{:,}".format(a.itn_units) }}</td><td>{{ "{:,}".format(a.irs_units) }}</td><td>{{ "{:,}".format(a.larvicide_units) }}</td><td>{{ "{:,.1f}".format(a.cases_prevented) }}</td></tr>
      {% endfor %}
    </tbody>
  </table>
  {% endif %}
  <h2>Summary</h2>
  <div class="summary-box">{{ summary }}</div>
  <div class="footer"><p>VCOM-TZ &mdash; Developed by Mike Sanga | Contact: mykiie85@gmail.com</p></div>
</body>
</html>
"""


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
            region_q = select(Region.name, Region.risk_score, Region.population).where(
                Region.id == region_id
            )
            region_result = await self.db.execute(region_q)
            region = region_result.first()
            if not region:
                continue

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

    def _generate_pdf(self, summary: str, request: ReportRequest) -> str | None:
        try:
            os.makedirs(REPORT_DIR, exist_ok=True)
            pdf_id = str(uuid.uuid4())
            pdf_path = os.path.join(REPORT_DIR, f"{pdf_id}.pdf")

            template = Template(REPORT_TEMPLATE)
            html = template.render(
                date=datetime.now().strftime("%B %d, %Y at %H:%M"),
                summary=summary,
                budget=request.budget_usd,
                total_prevented=request.total_cases_prevented,
                regions_count=len(request.region_ids),
                allocations=[a.model_dump() for a in request.allocations] if request.allocations else [],
            )

            try:
                from weasyprint import HTML
                HTML(string=html).write_pdf(pdf_path)
            except ImportError:
                logger.warning("weasyprint not available, skipping PDF generation")
                return None

            return f"/api/v1/reports/download/{pdf_id}.pdf"
        except Exception as e:
            logger.error("PDF generation failed: %s", e)
            return None

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
            summary = context[:500] + ("..." if len(context) > 500 else "")

        pdf_url = self._generate_pdf(summary, request)

        return ReportResponse(
            summary=summary,
            regions_analyzed=len(request.region_ids),
            model_used=settings.nlp_model,
            pdf_url=pdf_url,
        )
