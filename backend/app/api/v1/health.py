"""Health check endpoint — the only fully implemented endpoint in Sprint 1."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db_session
from config import get_settings

router = APIRouter()


@router.get("/health")
async def health_check(session: AsyncSession = Depends(get_db_session)) -> dict:
    """Returns service health status and database connectivity."""
    settings = get_settings()
    database_status = "unavailable"
    try:
        await session.execute(text("SELECT 1"))
        database_status = "connected"
    except Exception:
        pass

    return {
        "status": "ok",
        "version": settings.app_version,
        "database": database_status,
    }
