from unittest.mock import patch, MagicMock

import pytest

from app.schemas.report import ReportRequest
from app.services.nlp_service import NLPService


@pytest.mark.asyncio
async def test_generate_report_success(seeded_db):
    mock_pipeline = MagicMock()
    mock_pipeline.return_value = [{"summary_text": "This is a test summary of the surveillance data."}]

    with patch("app.services.nlp_service._get_pipeline", return_value=mock_pipeline):
        service = NLPService(seeded_db)
        request = ReportRequest(region_ids=[1, 2], include_forecast=True, include_optimization=True)

        result = await service.generate_report(request)

    assert result.regions_analyzed == 2
    assert "test summary" in result.summary
    assert result.model_used == "facebook/bart-large-cnn"


@pytest.mark.asyncio
async def test_generate_report_no_regions(seeded_db):
    service = NLPService(seeded_db)
    request = ReportRequest(region_ids=[999], include_forecast=True, include_optimization=True)

    result = await service.generate_report(request)

    assert result.regions_analyzed == 1  # Still attempts the region
    assert result.summary  # Falls back to truncated context or "No data"


@pytest.mark.asyncio
async def test_generate_report_nlp_failure(seeded_db):
    mock_pipeline = MagicMock(side_effect=Exception("Model load failed"))

    with patch("app.services.nlp_service._get_pipeline", return_value=mock_pipeline):
        service = NLPService(seeded_db)
        request = ReportRequest(region_ids=[1], include_forecast=True, include_optimization=True)

        result = await service.generate_report(request)

    # Should fallback to truncated context
    assert len(result.summary) > 0


@pytest.mark.asyncio
async def test_build_context(seeded_db):
    service = NLPService(seeded_db)
    context = await service._build_context([1])

    assert "Dar es Salaam" in context
    assert "mosquito density" in context
    assert "malaria cases" in context
