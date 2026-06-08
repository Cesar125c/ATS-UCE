"""Centralized application configuration using pydantic-settings. Fails fast if required vars are missing."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    app_version: str = "0.1.0"
    database_url: str
    clerk_secret_key: str = ""
    clerk_publishable_key: str = ""
    clerk_jwks_url: str = ""
    b2_application_key_id: str = ""
    b2_application_key: str = ""
    b2_bucket_name: str = "uce-talentpath-cvs"
    b2_endpoint_url: str = ""
    b2_region: str = ""
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    resend_api_key: str = ""
    resend_from_email: str = "talentpath@uce.edu.ec"
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "file://",
    ]
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


@lru_cache
def get_settings() -> Settings:
    return Settings()
