from __future__ import annotations

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default='NeuroAge API', alias='APP_NAME')
    app_version: str = Field(default='0.1.0', alias='APP_VERSION')
    environment: str = Field(default='development', alias='ENVIRONMENT')
    debug: bool = Field(default=False, alias='DEBUG')
    host: str = Field(default='0.0.0.0', alias='HOST')
    port: int = Field(default=8000, alias='PORT')
    secret_key: str = Field(default='change-me-in-production', alias='SECRET_KEY')
    database_url: str = Field(default='postgresql+psycopg://postgres:postgres@localhost:5432/neuroage', alias='DATABASE_URL')
    cors_origins: list[str] = Field(
        default_factory=lambda: ['http://localhost:4173', 'http://localhost:5173', 'http://localhost:3000'],
        alias='CORS_ORIGINS',
    )
    model_service_url: str = Field(default='http://localhost:8001', alias='MODEL_SERVICE_URL')
    model_artifact_path: str | None = Field(default=None, alias='MODEL_ARTIFACT_PATH')
    model_name: str = Field(default='ResNet3D-Regression', alias='MODEL_NAME')
    model_version: str = Field(default='unavailable', alias='MODEL_VERSION')
    evaluation_metrics_path: str | None = Field(default=None, alias='MODEL_EVALUATION_METRICS_PATH')
    upload_directory: str = Field(default='./storage/uploads', alias='UPLOAD_DIRECTORY')
    report_directory: str = Field(default='./storage/reports', alias='REPORT_DIRECTORY')
    dataset_root: str = Field(default='./data/raw', alias='DATASET_ROOT')
    dataset_metadata_path: str | None = Field(default=None, alias='DATASET_METADATA_PATH')
    dataset_derived_dir: str = Field(default='./data/derived', alias='DATASET_DERIVED_DIR')
    max_upload_size_bytes: int = Field(default=250 * 1024 * 1024, alias='MAX_UPLOAD_SIZE_BYTES')
    upload_retention_days: int = Field(default=30, alias='UPLOAD_RETENTION_DAYS')
    report_retention_days: int = Field(default=30, alias='REPORT_RETENTION_DAYS')
    authentication_required: bool = Field(default=True, alias='AUTHENTICATION_REQUIRED')
    auth_header_name: str = Field(default='X-User-Id', alias='AUTH_HEADER_NAME')
    rate_limit_per_minute: int = Field(default=30, alias='RATE_LIMIT_PER_MINUTE')
    max_request_body_bytes: int = Field(default=250 * 1024 * 1024, alias='MAX_REQUEST_BODY_BYTES')
    supabase_url: str | None = Field(default=None, alias='SUPABASE_URL')
    supabase_anon_key: str | None = Field(default=None, alias='SUPABASE_ANON_KEY')
    supabase_service_role_key: str | None = Field(default=None, alias='SUPABASE_SERVICE_ROLE_KEY')

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore',
        protected_namespaces=(),
    )

    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, value):
        if value is None:
            return []
        if isinstance(value, str):
            return [item.strip() for item in value.split(',') if item.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == 'production'

    @property
    def cors_allowlist(self) -> list[str]:
        return self.cors_origins


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
