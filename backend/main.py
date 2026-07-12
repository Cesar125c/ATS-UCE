"""FastAPI application factory and entry point."""

import logging
import traceback
from contextlib import asynccontextmanager

import socketio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api import websocket as websocket_handlers  # noqa: F401
from app.api.limiter import limiter
from app.api.middlewares.http_logging_middleware import HttpLoggingMiddleware
from app.api.middlewares.request_id_middleware import RequestIdMiddleware
from app.api.v1.router import router
from app.domain.exceptions import DomainError
from app.infrastructure.database.session import async_engine
from app.infrastructure.logging import setup_logging
from app.infrastructure.realtime.socketio_server import sio
from config import get_settings

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ATS-UCE API")
    yield
    logger.info("Shutting down ATS-UCE API — disposing database engine")
    await async_engine.dispose()


def create_app() -> FastAPI:
    setup_logging()
    settings = get_settings()
    logger.info("Environment: %s", settings.app_env)

    app = FastAPI(
        title="ATS-UCE API",
        description="Teaching Recruitment Management System — Universidad Central del Ecuador",
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(HttpLoggingMiddleware)
    app.add_middleware(RequestIdMiddleware)

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
        retry_after = getattr(exc, "retry_after", 60)
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded"},
            headers={"Retry-After": str(retry_after)},
        )

    @app.exception_handler(DomainError)
    async def domain_error_handler(_request: Request, exc: DomainError) -> JSONResponse:
        logger.warning("Domain rule violation: %s", exc)
        return JSONResponse(status_code=403, content={"message": str(exc)})

    @app.exception_handler(ValueError)
    async def value_error_handler(_request: Request, exc: ValueError) -> JSONResponse:
        logger.warning("Validation error: %s", exc)
        return JSONResponse(status_code=422, content={"message": str(exc)})

    @app.exception_handler(Exception)
    async def general_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception: %s", exc)
        if settings.app_env == "production":
            return JSONResponse(status_code=500, content={"message": "Internal server error"})
        return JSONResponse(
            status_code=500,
            content={
                "message": str(exc),
                "detail": traceback.format_exc(),
            },
        )

    app.include_router(router)
    return app


app = create_app()
asgi_app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path="/ws")
