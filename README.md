# UCE TalentPath — ATS-UCE

**Applicant Tracking System** for the professor recruitment process at the **Universidad Central del Ecuador**.

The system digitizes and automates the workflow from CV submission → AI scoring → multi-authority review (HR, Dean, Rector, Finance) → final hiring decision.

> ⚠️ **Sprint 1** — The backend architecture, domain model, database schema, and health endpoint are operational. All use cases, external adapters, and the frontend UI are stubs scheduled for future sprints.

---

## Architecture

Clean Architecture with Domain-Driven Design. The dependency rule is strict: **outer layers depend on inner layers, never the reverse**.

```
api/ (FastAPI)          ← HTTP, routing, auth
    │
application/ (Use Cases) ← Orchestration, DTOs (Pydantic)
    │
domain/ (Entities)      ← Business rules, pure Python, zero external deps
    │
infrastructure/ (Adapters) ← DB, S3, OpenAI, email
```

### Layer contracts

| Layer | Depends on | External deps | What lives here |
|-------|-----------|---------------|-----------------|
| `domain/` | stdlib only (`uuid`, `datetime`, `dataclasses`, `enum`, `abc`) | **None** | Entities, Value Objects, Repository ABCs, Domain Services |
| `application/` | `domain/` + `pydantic` | Pydantic | Use cases, DTOs |
| `api/` | `application/` + `fastapi` | FastAPI | Routes, middleware, DI wiring |
| `infrastructure/` | `domain/` | SQLAlchemy, boto3, openai, etc. | ORM models, repositories, external adapters |

---

## Project Structure

```
uce-talentpath-monorepo/
├── frontend/                         # Vite + React 19 + TypeScript
│   ├── src/
│   │   ├── main.tsx                  # Entry point
│   │   ├── App.tsx                   # Root component (scaffold)
│   │   └── assets/                   # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── backend/                          # Python 3.12 + FastAPI
│   ├── app/
│   │   ├── api/                      # FastAPI routes
│   │   │   └── v1/                   # Health (live), applications/applicants/
│   │   │                              # evaluations/dashboard (stubs)
│   │   ├── application/              # Use cases, DTOs
│   │   ├── domain/                   # Entities, value objects, services, ABCs
│   │   └── infrastructure/           # SQLAlchemy, mappers, repos, adapters
│   ├── migrations/                   # Alembic (async)
│   ├── tests/                        # 34 domain unit tests
│   ├── main.py                       # FastAPI factory entry point
│   ├── config.py                     # pydantic-settings
│   ├── pyproject.toml
│   └── docker-compose.yml            # Backend-only: PostgreSQL 16 + API
│
├── nginx/
│   └── nginx.conf                    # Reverse proxy (frontend + backend)
│
└── docker-compose.yml               # Full stack: DB + API + frontend + nginx
```

---

## Technologies

### Backend

| Technology | Version | Role |
|-----------|---------|------|
| Python | >= 3.12 | Runtime |
| FastAPI | >= 0.115 | REST API framework |
| SQLAlchemy | >= 2.0 (async) | ORM |
| PostgreSQL | 16 | Database |
| Alembic | >= 1.13 | Migrations |
| Pydantic v2 | >= 2.9 | DTOs, settings |
| asyncpg | >= 0.29 | Async PG driver |
| Ruff | >= 0.6 | Linter / formatter |
| pytest | >= 8.0 | Testing |

### Frontend

| Technology | Version | Role |
|-----------|---------|------|
| React | 19.2 | UI framework |
| TypeScript | 6.0 | Type safety |
| Vite | 8.0 | Dev server / build |
| Tailwind CSS | 4.2 | Utility-first styling |

### Infrastructure

| Tool | Purpose |
|------|---------|
| Docker Compose | Multi-service local orchestration (DB, API, frontend, nginx) |
| Nginx | Reverse proxy routing `/api/` → backend, `/` → frontend |
| Clerk | JWT-based authentication (Sprint 2) |
| Backblaze B2 | CV file storage (Sprint 2) |
| OpenAI | AI CV scoring (Sprint 2) |
| Resend | Transactional email (Sprint 2) |

---

## Implemented Features (Sprint 1)

### Domain Model (34 unit tests)
- **FlowStatus**: 8-state enum with strict linear progression (`RECEIVED → PROCESSING_AI → HR_STAGE → DEAN_STAGE → RECTOR_STAGE → FINANCE_STAGE → HIRED`), terminal-state guards, and role-to-stage mapping
- **AIScore**: Frozen value object with 5 evaluation axes (0–100 each), automatic preselection threshold (≥60), and grade classification (EXCELLENT / GOOD / ACCEPTABLE / INSUFFICIENT)
- **5 domain invariants enforced in code**: strict linear flow, short-circuit rejection, terminal finality, score gate, mandatory observations on rejection
- **Evaluation**: Immutable decision record with invariant: observations required when rejecting
- **Application (Aggregate Root)**: Manages state transitions via `assign_ai_score()`, `advance_flow()`, and `reject()`
- **WorkflowApprovalService**: Pure domain service for authority decision orchestration and role validation

### Persistence Layer
- 5 SQLAlchemy ORM models (`applicants`, `vacancies`, `applications`, `evaluations`, `status_history`)
- Bidirectional mappers (ORM ↔ Domain) with automatic `AIScore` reconstruction from flat columns
- 3 repository implementations with async queries, pagination, and aggregate statistics (`get_stats()` using `func.count`/`func.avg`/`case`)
- Shared SQLAlchemy Enum types defined once to prevent PostgreSQL type conflicts
- Async-compatible Alembic migration environment

### API
- **Health endpoint**: `GET /api/v1/health` — returns `{"status":"ok","version":"0.1.0","database":"connected"}` after executing `SELECT 1`
- 7 additional endpoint stubs with role-based access control wiring:

| Method | Path | Roles | Planned |
|--------|------|-------|---------|
| POST | `/api/v1/applications/` | `applicant` | Sprint 2 |
| GET | `/api/v1/applications/` | `hr_staff` | Sprint 3 |
| GET | `/api/v1/applications/pending-count` | `dean`, `rector`, `finance_director` | Sprint 3 |
| GET | `/api/v1/applications/{id}` | `hr_staff`, `dean`, `rector`, `finance_director` | Sprint 3 |
| GET | `/api/v1/applicants/me/status` | `applicant` | Sprint 3 |
| POST | `/api/v1/applications/{id}/evaluations` | `hr_staff`, `dean`, `rector`, `finance_director` | Sprint 3 |
| GET | `/api/v1/dashboard/stats` | `hr_staff` | Sprint 3 |

- File validation on POST: PDF only, max 10 MB

### Authentication Foundations
- `HTTPBearer` security scheme configured
- `get_current_user()` FastAPI dependency with dev mock fallback (`role: hr_staff`)
- `require_role()` factory for declarative role-based access control
- `ClerkAuthAdapter` stub for Sprint 2 JWT verification

### Database Schema (Alembic-ready)

5 tables with relationships:

```
applicants 1───* applications *───1 vacancies
                      │
                      ├───* evaluations (cascade delete)
                      └───* status_history (cascade delete)
```

### Infrastructure
- Docker Compose with 4 services: `backend`, `frontend`, `database` (PostgreSQL 16), `nginx`
- Backend-only Docker Compose for isolated backend development
- Production-ready Dockerfile (Python 3.12-slim, `pip install -e .`)
- Nginx reverse proxy: `/api/` → backend, `/` → frontend, WebSocket support for Vite HMR

---

## Getting Started

### Prerequisites

- Python >= 3.12
- Docker & Docker Compose
- Node.js >= 18 (for frontend development)

### Quick start (Docker)

```bash
# 1. Environment variables
cp backend/.env.example backend/.env

# 2. Full stack
docker compose up --build -d

# 3. Verify
curl http://localhost/api/v1/health
```

### Backend-only development

```bash
cd backend
docker compose up --build -d          # Starts PostgreSQL + API

# Or manually:
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
uvicorn main:app --reload --port 8000
```

### Frontend-only development

```bash
cd frontend
npm install
npm run dev
```

---

## Testing

```bash
cd backend
source .venv/bin/activate

# 34 domain unit tests (no database required)
pytest tests/unit/ -v

# Linting
ruff check app/ tests/
```

---

## Project Status

| Component | Status |
|-----------|--------|
| Domain model | ✅ Complete (34 tests) |
| Database schema | ✅ Models + migrations ready |
| Health endpoint | ✅ Live |
| API stubs | ⏸️ 7 endpoints wired, return 501 |
| Use cases | ⏸️ 5 stubs |
| External adapters | ⏸️ 4 stubs (Backblaze, Clerk, OpenAI, Resend) |
| Frontend UI | 🏗️ Scaffold only |
| CI/CD | ❌ Not configured |

---

## Software Engineering Evidence

| Practice | Evidence |
|----------|----------|
| **Clean Architecture** | 4-layer separation with strict dependency inversion; domain has zero external imports |
| **DDD** | Aggregate root (`Application`), value objects (`AIScore`, `FlowStatus`), domain services, repository ABCs |
| **Test coverage** | 34 unit tests covering all entity invariants, state transitions, and validation rules |
| **Async by design** | End-to-end `async/await` — SQLAlchemy async engine, async repositories, async tests |
| **RESTful API** | Resource-oriented endpoints, HTTP verbs, standard status codes, OpenAPI schema |
| **RBAC foundations** | Role-based access control via composable FastAPI dependencies |
| **Infrastructure as code** | Docker Compose, multistage Dockerfiles, Nginx config |
| **Migrations** | Async-compatible Alembic with explicit model registration |
| **DTO/entity separation** | Pydantic DTOs in `application/`, domain models in `domain/`, ORM models in `infrastructure/` |
| **Python 3.12 typing** | `list[X]`, `X \| None`, `tuple[X, Y]` throughout |
