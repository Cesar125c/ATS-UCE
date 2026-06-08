"""FastAPI application factory and entry point."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import router
from app.infrastructure.database.session import async_engine
from config import get_settings

logger = logging.getLogger("ats_uce")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ATS-UCE API")
    yield
    logger.info("Shutting down ATS-UCE API — disposing database engine")
    await async_engine.dispose()


def create_app() -> FastAPI:
    settings = get_settings()

    logging.basicConfig(
        level=getattr(logging, settings.app_env == "development" and "DEBUG" or "INFO"),
        format="%(asctime)s  %(name)-16s  %(levelname)-8s  %(message)s",
    )
    logger.info("Environment: %s", settings.app_env)

    app = FastAPI(
        title="ATS-UCE API",
        description="Teaching Recruitment Management System — Universidad Central del Ecuador",
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(ValueError)
    async def value_error_handler(_request: Request, exc: ValueError) -> JSONResponse:
        logger.warning("Validation error: %s", exc)
        return JSONResponse(status_code=422, content={"message": str(exc)})

    @app.exception_handler(Exception)
    async def general_exception_handler(
        _request: Request, exc: Exception
    ) -> JSONResponse:
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(status_code=500, content={"message": "Internal server error"})

    app.include_router(router)
    return app


app = create_app()
