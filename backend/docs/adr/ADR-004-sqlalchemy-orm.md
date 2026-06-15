# ADR-004: SQLAlchemy 2.0 as ORM

**Status:** Accepted  
**Date:** 2026-05-15  
**Author:** Erik Herrera — Backend Developer / Software Architect  

## Context

We need an ORM to map PostgreSQL tables to Python objects. Options:
- **Raw asyncpg** — No ORM, raw SQL, full control but verbose
- **SQLAlchemy 2.0** — Mature, async support, Alembic integration
- **Tortoise-ORM** — Async-native but less ecosystem
- **SQLModel** — Newer, FastAPI-native but less mature for complex cases

## Decision

We will use **SQLAlchemy 2.0** in **async mode** with the `DeclarativeBase` pattern.

### Key patterns

1. **Bidirectional mappers** — Separate `ApplicationMapper` converts between ORM models and Domain entities, keeping Domain pure
2. **Session.merge()** for save operations — Handles both INSERT and UPDATE cases
3. **Composite stats query** — `func.sum(case(...))` for dashboard statistics in a single query
4. **Relationship loading** — Lazy by default, explicit eager loading in mappers

### Model example
```python
class ApplicationModel(Base):
    __tablename__ = "applications"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    status: Mapped[str] = mapped_column(flow_status_enum, default=FlowStatus.RECEIVED.value)
```

## Consequences

**Positive:**
- Alembic integration for schema migrations
- Type safety with `Mapped[...]` annotations
- `session.merge()` simplifies upsert logic

**Negative:**
- ORM models duplicate Domain entity structure (mapper overhead)
- Async ORM has some gotchas (need `await session.refresh()` after merge)
- Lazy loading in async mode requires `selectinload` or similar

**Mitigation:** Mappers concentrate ORM coupling in one layer; Domain stays pure.

## References

- `backend/app/infrastructure/database/models/` — 5 ORM models
- `backend/app/infrastructure/database/mappers/` — Bidirectional mappers
- `backend/app/infrastructure/repositories/sqla_application_repository.py` — Stats query with `func.case`
