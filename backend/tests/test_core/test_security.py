"""Tests for API key verification security module."""

import pytest
from unittest.mock import patch
from fastapi import HTTPException

from app.core.security import verify_api_key


@pytest.mark.asyncio
async def test_verify_api_key_dev_mode():
    """In dev mode (default key), any request passes without API key."""
    with patch("app.core.security.settings") as mock_settings:
        mock_settings.api_key = "change-me-to-a-secure-key"
        result = await verify_api_key(x_api_key=None)
        assert result == "dev-mode"


@pytest.mark.asyncio
async def test_verify_api_key_valid():
    """Valid API key should return the key."""
    with patch("app.core.security.settings") as mock_settings:
        mock_settings.api_key = "real-secret-key"
        result = await verify_api_key(x_api_key="real-secret-key")
        assert result == "real-secret-key"


@pytest.mark.asyncio
async def test_verify_api_key_invalid():
    """Invalid API key should raise 401."""
    with patch("app.core.security.settings") as mock_settings:
        mock_settings.api_key = "real-secret-key"
        with pytest.raises(HTTPException) as exc_info:
            await verify_api_key(x_api_key="wrong-key")
        assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_verify_api_key_missing():
    """Missing API key header should raise 401 when not in dev mode."""
    with patch("app.core.security.settings") as mock_settings:
        mock_settings.api_key = "real-secret-key"
        with pytest.raises(HTTPException) as exc_info:
            await verify_api_key(x_api_key=None)
        assert exc_info.value.status_code == 401
        assert "Invalid or missing" in exc_info.value.detail
