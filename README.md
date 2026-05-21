# UCE TalentPath — ATS-UCE

An Applicant Tracking System (ATS) designed to streamline the application, evaluation, and selection process for university professors at the **Universidad Central del Ecuador (UCE)**.

---

## Tech Stack

### Frontend
| Technology  | Purpose            |
|-------------|--------------------|
| React 18    | UI framework       |
| TypeScript  | Type safety        |
| Vite        | Dev server/build   |
| Tailwind CSS| Styling            |

### Backend
| Technology          | Purpose                          |
|---------------------|----------------------------------|
| Python 3.12+        | Runtime                          |
| FastAPI             | REST API framework               |
| SQLAlchemy 2.0      | ORM (async mode)                 |
| PostgreSQL 16       | Database                         |
| Alembic             | Schema migrations                |
| Pydantic v2         | DTOs / validation                |
| Pydantic-settings   | Configuration via env vars       |
| Ruff                | Linter / formatter               |
| pytest              | Testing                          |
| asyncpg             | PostgreSQL async driver          |

### Infrastructure & DevOps
| Tool              | Purpose                        |
|-------------------|--------------------------------|
| Docker Compose    | Local dev environment (DB+API) |
| Clerk             | Auth / JWT (Sprint 2)          |
| Backblaze B2      | CV file storage (Sprint 2)     |
| OpenAI            | AI score generation (Sprint 2) |
| Resend            | Transactional emails (Sprint 2)|

---

## Architecture — Clean Architecture + DDD

The backend follows **Clean Architecture** with **Domain-Driven Design (DDD)**. The dependency rule is strict: **outer layers depend on inner layers, never the other way around.**

```
┌──────────────────────────────────────────────────────────┐
│                     api / FastAPI                         │  ← HTTP, auth, routing
├──────────────────────────────────────────────────────────┤
│                  application / Use Cases                  │  ← Orchestration, DTOs
├──────────────────────────────────────────────────────────┤
│                     domain / Entities                     │  ← Business logic (pure Python)
├──────────────────────────────────────────────────────────┤
│               infrastructure / Adapters                   │  ← DB, S3, OpenAI, Email
└──────────────────────────────────────────────────────────┘
```

### Layer Rules

| Layer | Imports from | Zero external deps? | Contains |
|-------|-------------|---------------------|----------|
| `domain/` | stdlib only (`uuid`, `datetime`, `dataclasses`, `enum`) | ✅ Yes | Entities, Value Objects, Repository ABCs, Domain Services |
| `application/` | `domain/` + `pydantic` | ❌ No | Use Cases, DTOs |
| `api/` | `application/` + `fastapi` | ❌ No | Routes, Dependencies |
| `infrastructure/` | `domain/` + SQLAlchemy, boto3, openai, etc. | ❌ No | ORM Models, Repositories, External Adapters |

### Domain Invariants (Hard Rules in Code)

1. **Strict linear flow**: Status advances in a fixed order (`RECEIVED → PROCESSING_AI → HR_STAGE → DEAN_STAGE → RECTOR_STAGE → FINANCE_STAGE → HIRED`). No skipping stages.
2. **Short-circuit rejection**: From any non-terminal state, an application can be immediately moved to `REJECTED`.
3. **Terminal finality**: Once `HIRED` or `REJECTED`, the application cannot be advanced further.
4. **Score gate**: A `RECEIVED` application must receive an `AIScore` before moving to `HR_STAGE`. If the score < 60, it goes directly to `REJECTED`.
5. **Observations on rejection**: When an authority rejects, `observations` must be non-empty.

---

## Project Structure

```
uce-talentpath-monorepo/
├── .github/workflows/          ← CI pipelines
├── frontend/                   ← Vite + React 18 + TypeScript
└── backend/
    ├── app/
    │   ├── api/                ← FastAPI routes + auth middleware
    │   │   └── v1/
    │   │       ├── health.py           GET  /api/v1/health
    │   │       ├── applications.py     CRUD /api/v1/applications
    │   │       ├── applicants.py       GET  /api/v1/applicants/me/status
    │   │       ├── evaluations.py      POST /api/v1/applications/{id}/evaluations
    │   │       └── dashboard.py        GET  /api/v1/dashboard/stats
    │   ├── application/         ← Use Cases + DTOs (Pydantic)
    │   │   ├── use_cases/
    │   │   └── dtos/
    │   ├── domain/              ← Business logic (ZERO external imports)
    │   │   ├── entities/        ← Applicant, Application, Evaluation, etc.
    │   │   ├── value_objects/   ← FlowStatus, AIScore, EvaluationDecision
    │   │   ├── services/        ← WorkflowApprovalService
    │   │   └── repositories/    ← ABC contracts (interfaces)
    │   └── infrastructure/      ← SQLAlchemy, external APIs, file storage
    │       ├── database/models/ ← ORM models (5 tables)
    │       ├── database/mappers/← ORM ↔ Domain bidirectional mappers
    │       ├── repositories/    ← SQLAlchemy implementations
    │       └── adapters/        ← Backblaze, OpenAI, Resend, Clerk stubs
    ├── tests/
    │   └── unit/domain/         ← 34 tests for domain logic
    ├── migrations/              ← Alembic async migrations
    ├── main.py                  ← FastAPI app factory
    ├── config.py                ← pydantic-settings
    ├── docker-compose.yml       ← PostgreSQL 16 + API
    └── pyproject.toml           ← Dependencies & tooling config
```

---

## Prerequisites

| Tool   | Version | Why |
|--------|---------|-----|
| Python | >= 3.12 | Runtime |
| Docker | Latest  | PostgreSQL + API containers |
| Node   | >= 18   | Frontend dev |

---

## Local Development Setup

### 1. Clone and prepare env vars

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your keys
```

### 2. Option A — Docker (recommended, starts both DB + API)

```bash
cd backend
docker compose up --build -d
curl http://localhost:8000/api/v1/health
```

### 2. Option B — Manual (DB in Docker, API on host)

```bash
# Start only Postgres
docker run -d --name ats_db \
  -e POSTGRES_USER=ats_uce \
  -e POSTGRES_PASSWORD=ats_uce_secret \
  -e POSTGRES_DB=ats_uce_dev \
  -p 5432:5432 \
  postgres:16-alpine

# Create virtualenv and install
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

# Run the server
uvicorn main:app --reload --port 8000
```

### 3. Verify

```bash
curl http://localhost:8000/api/v1/health
# → {"status":"ok","version":"0.1.0","database":"connected"}

# Open Swagger UI
open http://localhost:8000/docs
```

---

## Application Workflow (Status Flow)

This is the lifecycle every application goes through. Frontend should render this as a **stepper** for applicants.

```
                       ┌──────────┐
                       │ RECEIVED │
                       └────┬─────┘
                            │ CV uploaded
                            ▼
                    ┌───────────────┐
                    │ PROCESSING_AI │  ← AI scores the CV
                    └───────┬───────┘
                            │
                     ┌──────┴──────┐
                     ▼             ▼
               ┌─────────┐   ┌──────────┐
               │ HR_STAGE│   │ REJECTED │  ← if AI score < 60
               └────┬────┘   └──────────┘
                    │ HR approves
                    ▼
               ┌───────────┐
               │ DEAN_STAGE│
               └─────┬─────┘
                     │ Dean approves
                     ▼
               ┌─────────────┐
               │ RECTOR_STAGE│
               └──────┬──────┘
                      │ Rector approves
                      ▼
               ┌───────────────┐
               │ FINANCE_STAGE │
               └───────┬───────┘
                       │ Finance director approves
                       ▼
                  ┌────────┐
                  │ HIRED  │
                  └────────┘
```

Each authority stage (`HR_STAGE`, `DEAN_STAGE`, `RECTOR_STAGE`, `FINANCE_STAGE`) requires a specific role and an `Evaluation` with `APPROVED` or `REJECTED`.

---

## API Endpoints

### Health

| Method | Path | Auth | Role | Status |
|--------|------|------|------|--------|
| GET | `/api/v1/health` | ❌ | — | ✅ Done |

### Applications

| Method | Path | Auth | Role | Status |
|--------|------|------|------|--------|
| POST | `/api/v1/applications/` | ✅ | `applicant` | 🚧 Sprint 2 |
| GET | `/api/v1/applications/` | ✅ | `hr_staff` | 🚧 Sprint 3 |
| GET | `/api/v1/applications/pending-count` | ✅ | `dean`, `rector`, `finance_director` | 🚧 Sprint 3 |
| GET | `/api/v1/applications/{id}` | ✅ | `hr_staff`, `dean`, `rector`, `finance_director` | 🚧 Sprint 3 |

### Applicants

| Method | Path | Auth | Role | Status |
|--------|------|------|------|--------|
| GET | `/api/v1/applicants/me/status` | ✅ | `applicant` | 🚧 Sprint 3 |

### Evaluations

| Method | Path | Auth | Role | Status |
|--------|------|------|------|--------|
| POST | `/api/v1/applications/{id}/evaluations` | ✅ | `hr_staff`, `dean`, `rector`, `finance_director` | 🚧 Sprint 3 |

### Dashboard

| Method | Path | Auth | Role | Status |
|--------|------|------|------|--------|
| GET | `/api/v1/dashboard/stats` | ✅ | `hr_staff` | 🚧 Sprint 3 |

> **Note:** In development mode (`APP_ENV=development` + no `CLERK_SECRET_KEY` set), the API returns a mock user with `role: hr_staff` allowing you to test all endpoints via Swagger.

---

## Environment Variables (for DevOps)

All configuration is in `backend/.env`. Required vars:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | `postgresql+asyncpg://user:pass@host:5432/db` |
| `CLERK_SECRET_KEY` | ✅ | — | Clerk API secret |
| `APP_ENV` | ❌ | `development` | `development` or `production` |
| `OPENAI_API_KEY` | ❌ | — | For AI scoring (Sprint 2) |
| `B2_APPLICATION_KEY_ID` | ❌ | — | Backblaze B2 (Sprint 2) |
| `RESEND_API_KEY` | ❌ | — | Email (Sprint 2) |

---

## Database Migrations (Alembic)

```bash
cd backend
source .venv/bin/activate

# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## Testing

```bash
cd backend
source .venv/bin/activate

# Run all tests
python -m pytest

# Run domain tests (faster, no DB needed)
python -m pytest tests/unit/ -v

# Run with coverage
python -m pytest --cov=app --cov-report=term-missing
```

The `tests/unit/domain/` tests cover entity invariants, status transitions, score validation, and value object immutability — all without a database.

---

## Linting

```bash
cd backend
ruff check app/ tests/
ruff check app/ tests/ --fix   # Auto-fix
```

---

## Sprint Roadmap

| Sprint | Focus |
|--------|-------|
| Sprint 1 | ✅ Architecture, domain model, DB schema, health endpoint |
| Sprint 2 | 🚧 Application submission (CV upload + AI scoring) |
| Sprint 3 | 🚧 Multi-stage workflow (HR → Dean → Rector → Finance) |
| Sprint 4 | 🚧 Dashboard, reports, notifications |
