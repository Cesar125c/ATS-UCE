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