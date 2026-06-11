# ADR-002: FastAPI with AsyncPG for Web Framework and Database Driver

**Status:** Accepted  
**Date:** 2026-05-15  
**Author:** Erik Herrera — Backend Developer / Software Architect  

## Context

The ATS-UCE backend needs to handle concurrent requests (multiple applicants submitting CVs, authorities reviewing applications) without blocking. Python's GIL limits thread-based concurrency, so we need an async-first framework.

Options considered:
- **Flask** — Synchronous, mature ecosystem but blocking I/O
- **Django + Channels** — Heavy, overkill for API-only backend
- **FastAPI** — Async-native, automatic OpenAPI docs, Pydantic integration
- **Starlette** — Lower-level, more manual work

## Decision

We will use **FastAPI** as the web framework with **AsyncPG** as the async PostgreSQL driver, managed through SQLAlchemy 2.0's async extension.

### Rationale
1. **FastAPI** provides automatic Swagger/ReDoc documentation (critical for frontend developer Jonathan to consume APIs)
2. **Pydantic v2** integration means DTOs also serve as request/response models
3. **AsyncPG** is the fastest async PostgreSQL driver for Python
4. SQLAlchemy 2.0's async engine wraps asyncpg cleanly with `AsyncSession`

### Configuration
```python
# backend/app/infrastructure/database/session.py
engine = create_async_engine(settings.database_url, pool_size=5, max_overflow=10)
async_session = async_sessionmaker(engine, expire_on_commit=False)
```

## Consequences

**Positive:**
- Automatic OpenAPI docs (`/docs`, `/redoc`)
- Non-blocking database operations under high concurrency
- Pydantic v2 validates all I/O at the boundary

**Negative:**
- Async stack has more complex error traces
- Must use `async/await` end-to-end (no mixing sync/async)
- Alembic migrations require async-compatible `env.py`

**Mitigation:** The `env.py` uses `async_engine_from_config` and `asyncio.run()` to run migrations.

## References

- `backend/main.py` — App factory
- `backend/app/infrastructure/database/session.py` — Async engine config
- `backend/migrations/env.py` — Async-compatible Alembic config
