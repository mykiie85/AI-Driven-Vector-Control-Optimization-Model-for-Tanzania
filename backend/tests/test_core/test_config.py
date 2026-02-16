"""Tests for configuration settings module."""

import os
from unittest.mock import patch

from app.core.config import Settings


def test_settings_defaults():
    """Settings should have sensible defaults."""
    with patch.dict(os.environ, {}, clear=True):
        settings = Settings(
            _env_file=None,
            database_url="postgresql+asyncpg://test:test@localhost/test",
        )

    assert settings.api_key == "change-me-to-a-secure-key"
    assert settings.cors_origins == "http://localhost:3000"
    assert settings.log_level == "info"
    assert settings.r_timeout == 300
    assert settings.nlp_model == "facebook/bart-large-cnn"
    assert settings.nlp_max_length == 130
    assert settings.nlp_min_length == 30


def test_settings_from_env():
    """Settings should be overridable via environment variables."""
    env = {
        "DATABASE_URL": "postgresql+asyncpg://custom:pw@db:5432/mydb",
        "API_KEY": "my-production-key",
        "CORS_ORIGINS": "https://example.com",
        "LOG_LEVEL": "debug",
        "R_TIMEOUT": "600",
        "NLP_MODEL": "facebook/bart-large-mnli",
    }
    with patch.dict(os.environ, env, clear=False):
        settings = Settings(_env_file=None)

    assert settings.database_url == "postgresql+asyncpg://custom:pw@db:5432/mydb"
    assert settings.api_key == "my-production-key"
    assert settings.cors_origins == "https://example.com"
    assert settings.log_level == "debug"
    assert settings.r_timeout == 600
    assert settings.nlp_model == "facebook/bart-large-mnli"


def test_settings_r_script_path_default():
    """R script path should have a default."""
    settings = Settings(
        _env_file=None,
        database_url="postgresql+asyncpg://test:test@localhost/test",
    )
    assert settings.r_script_path == "./app/r_scripts"
