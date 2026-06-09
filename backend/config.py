"""Centralized app config via pydantic-settings. Fails fast on missing required vars."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application
    app_env: str = "development"
    app_version: str = "0.1.0"

    # Database — required, no default
    database_url: str

    # Clerk Auth — required, no default
    clerk_secret_key: str
    clerk_publishable_key: str = ""
    clerk_jwks_url: str = ""

    # Backblaze B2
    b2_application_key_id: str = ""
    b2_application_key: str = ""
    b2_bucket_name: str = "uce-talentpath-cvs"
    b2_endpoint_url: str = ""
    b2_region: str = ""

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # Resend email
    resend_api_key: str = ""
    resend_from_email: str = "talentpath@uce.edu.ec"

    # Logging
    log_level: str = "INFO"

    # CORS
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "file://",
        "capacitor://localhost",
    ]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
