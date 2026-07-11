# ATS-UCE Backend — Clean Architecture

## Layers

| Layer | Responsibility | Key Files |
|-------|---------------|-----------|
| `domain/` | Business logic, entities, value objects | `entities/`, `value_objects/`, `services/` |
| `application/` | Use cases, DTOs | `use_cases/`, `dtos/` |
| `infrastructure/` | External integrations | `adapters/`, `repositories/`, `database/` |
| `api/` | FastAPI endpoints, dependencies | `v1/`, `dependencies.py` |

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | FastAPI |
| ORM | SQLAlchemy (async) |
| Database | PostgreSQL |
| Migrations | Alembic |
| Auth | Clerk (JWT) |
| Storage | Backblaze B2 |
| AI | OpenAI |
| Email | Resend |

## Setup

```bash
python -m venv .venv
source .venv/bin/activate  # or `.venv\Scripts\activate` on Windows
pip install -e ".[dev]"
cp .env.example .env  # fill in values
alembic upgrade head
uvicorn main:app --reload
```

## Logging

`LOG_LEVEL` controls the minimum backend log level emitted by the Python logging
configuration. Valid values: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`.
Recommended values: local/development `DEBUG`, QA `INFO`, production `INFO`.
Do not include secrets, tokens, credentials, request bodies, or other sensitive
data in logs. Logs are written to stdout/stderr and captured by Docker.

## Project Layout

```
backend/
├── app/
│   ├── domain/            # Business logic (no external imports)
│   ├── application/       # Use cases, DTOs
│   ├── infrastructure/    # External integrations
│   └── api/               # FastAPI endpoints
├── migrations/           # Alembic migrations
├── docs/                 # ADRs, API contract, auth flow
├── tests/                # Unit, integration tests
├── config.py             # Centralized settings
├── main.py               # FastAPI app factory
└── README.md             # This file
```
