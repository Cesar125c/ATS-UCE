# ADR-003: PostgreSQL as Primary Database

**Status:** Accepted  
**Date:** 2026-05-15  
**Author:** Erik Herrera — Backend Developer / Software Architect  

## Context

The ATS-UCE system must store:
- Structured entities (applicants, vacancies, applications, evaluations)
- Status history with timestamps (audit trail)
- AI score data (5 float axes + text summary)
- Relationships with referential integrity

## Decision

We will use **PostgreSQL 16** as the primary database.

### Rationale
1. **Enum type support** — Native `CREATE TYPE` for `FlowStatus`, avoiding string-in-column anti-patterns
2. **JSONB** — Available for future flexibility (e.g., storing raw AI response)
3. **ACID compliance** — Critical for the 7-stage approval workflow where state transitions must be atomic
4. **Indexing** — Support for composite indexes on `(status, score_total DESC)` for the ranking query
5. **AsyncPG compatibility** — Mature async driver

### Schema design
5 tables with a single aggregate root:
- `applicants` — Clerk-linked user profiles
- `vacancies` — Teaching positions
- `applications` — Aggregate root, FK to both
- `evaluations` — Immutable authority decisions
- `status_history` — Audit trail of state transitions

### Indexes
```sql
CREATE INDEX ix_applications_status ON applications (status);
CREATE INDEX ix_applications_score ON applications (score_total DESC);
CREATE INDEX ix_applications_status_score ON applications (status, score_total DESC);
```

## Consequences

**Positive:**
- Referential integrity enforced at DB level
- Rich query capabilities (window functions, CTEs for stats)
- Mature tooling (Alembic, pgAdmin)

**Negative:**
- Heavier than SQLite for local dev
- Requires Docker or local PostgreSQL installation
- Enum changes require careful migrations

**Mitigation:** Shared SA enum types in `enums.py` prevent migration conflicts.

## References

- `backend/app/infrastructure/database/models/` — 5 ORM models
- `backend/app/infrastructure/database/enums.py` — Shared SA enum types
- `backend/migrations/versions/` — Migration history
