from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://vcom:vcom_secret_change_me@localhost:5432/vcom_tz"
    api_key: str = "change-me-to-a-secure-key"
    cors_origins: str = "http://localhost:3000,https://ai-driven-vector-control-optimization-0ksx.onrender.com"
    log_level: str = "info"

    r_timeout: int = 300
    r_script_path: str = "./app/r_scripts"

    nlp_model: str = "facebook/bart-large-cnn"
    nlp_max_length: int = 130
    nlp_min_length: int = 30

    model_config = {"env_file": ".env"}


settings = Settings()
