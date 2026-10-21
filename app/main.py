from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.services.ml_inference import BrainAgeInferenceService


def create_app() -> FastAPI:
    configure_logging()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description='AI-based brain age assessment API foundation.',
        docs_url='/docs',
        redoc_url='/redoc',
        openapi_url='/openapi.json',
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowlist,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

    app.include_router(v1_router)

    @app.get('/health', tags=['system'])
    async def health() -> dict[str, object]:
        ml_status = BrainAgeInferenceService().get_status()
        return {
            'status': 'degraded' if ml_status['status'] != 'ready' else 'ok',
            'service': settings.app_name,
            'version': settings.app_version,
            'environment': settings.environment,
            'checks': {
                'database': 'not_configured',
                'ml_service': ml_status['status'],
                'storage': 'not_configured',
            },
        }

    register_exception_handlers(app)
    return app


app = create_app()
