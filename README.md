<div align="center">

# UCE TalentPath — ATS-UCE

**AI-powered teaching recruitment management for the Central University of Ecuador**

[![Python](https://img.shields.io/badge/python-3.12-blue?logo=python&logoColor=white)](https://www.python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

## Overview

UCE TalentPath automates the full teaching recruitment pipeline at UCE — from CV submission to final hiring approval. Candidates upload their CV, an AI engine scores it across 5 axes, and the application moves through a strict hierarchical approval chain: **HR → Dean → Rector → Finance Director → Hired**. Every transition triggers an automatic email and records a timestamp that powers the real-time status stepper on the applicant portal.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18 · Vite · TypeScript · Tailwind CSS · Shadcn/UI · TanStack Query · Clerk React SDK |
| **Backend** | FastAPI · Python 3.12 · SQLAlchemy 2.0 async · Alembic · Pydantic v2 |
| **Database** | PostgreSQL 16 |
| **Auth** | Clerk (JWT · RBAC via `publicMetadata.role`) |
| **Storage** | Backblaze B2 (S3-compatible) |
| **AI** | OpenAI API — `gpt-4o-mini` |
| **Email** | Resend |
| **Infrastructure** | Docker · Nginx · AWS EC2 · GitHub Actions |

---

## Architecture

The backend follows **Clean Architecture** with a strict dependency rule: outer layers depend on inner layers, never the reverse. The `domain/` layer contains zero external imports — every business rule is unit-testable in isolation.

```
api/ → application/ → domain/
infrastructure/ → domain/
```

**Approval flow state machine**

```
RECEIVED → PROCESSING_AI → HR_STAGE → DEAN_STAGE → RECTOR_STAGE → FINANCE_STAGE → HIRED
                                                                         ↘
                                                                       REJECTED (any stage)
```

**AI Score** is calculated across 5 axes (20% each): Academic Training · Teaching Experience · Scientific Production · Profile Match · Languages & Competencies. A candidate needs `total ≥ 60` to reach HR review.

---

## Getting Started

**Prerequisites:** Python 3.12+, Node.js 18+, Docker, Docker Compose v2

```bash
# 1. Clone
git clone https://github.com/your-org/uce-talentpath.git
cd uce-talentpath

# 2. Configure environment
cp backend/.env.example backend/.env
# → fill in required values (see Environment Variables below)

# 3. Start the stack
cd backend && docker compose up --build -d

# 4. Run migrations
docker compose exec api alembic upgrade head

# 5. Start frontend
cd ../frontend && npm install && npm run dev
```

Backend runs at `http://localhost:8000` · API docs at `/docs` · Frontend at `http://localhost:5173`

---

## Environment Variables

```env
# App
APP_ENV=development

# Database
DATABASE_URL=postgresql+asyncpg://user:password@postgres:5432/ats_uce_db

# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Backblaze B2
B2_APPLICATION_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET_NAME=uce-talentpath-cvs
B2_ENDPOINT_URL=https://s3.us-west-004.backblazeb2.com

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=talentpath@uce.edu.ec

# CORS
ALLOWED_ORIGINS=http://localhost:5173,file://
```

> Assign user roles in the Clerk Dashboard via `publicMetadata.role`:  
> `applicant` · `hr_staff` · `dean` · `rector` · `finance_director`

---

## Development Workflow

```
feature/XX-NNN  →  develop  →  main
                     ↓            ↓
                  EC2 QA     EC2 Production
```

Every PR to `develop` runs the full CI pipeline (`ruff` + `pytest`). Merging to `develop` deploys automatically to the QA instance. Merging to `main` deploys to production. Both environments run the same Docker Compose monolith (Nginx + FastAPI + PostgreSQL) on separate AWS EC2 instances.

```bash
# Run tests
pytest tests/unit/ -v                          # domain only, no DB needed
pytest tests/integration/ -v                   # full flow, postgres in Docker

# Lint
ruff check app/
```

---

## Deployment

Each environment is a self-contained Docker Compose stack on an EC2 instance:

| Container | Role |
|---|---|
| `nginx:alpine` | Serves the React SPA + reverse-proxies `/api/*` to FastAPI |
| `api` | FastAPI application |
| `postgres:16` | Database (internal only, never exposed) |

Ports `8000` and `5432` are not exposed externally. All traffic enters through Nginx on `443`.

On every CD run the pipeline executes: `docker compose pull → up -d → alembic upgrade head → health check`.

---

## Screenshots

> Production screenshots will be added at Week 9. The mockups below reflect the high-fidelity Figma designs.

**Applicant Portal** — CV upload with drag & drop, 7-node status stepper with real timestamps per stage.

**HR Dashboard** — Candidate ranking sorted by AI score, faculty filters, 4 KPI cards, one-click PDF viewer.

**Authority Panel** — 5-axis score breakdown, evaluation history, approve/reject form.

---

## Team

| Name | Role |
|---|---|
| **Emily Guerrón** | BA / Scrum Master |
| **Erik Herrera** | Backend Developer / Software Architect |
| **Jonathan Villarreal** | Frontend Developer / UI-UX Designer |
| **Cesar Cueva** | SRE / DevOps |

Universidad Central del Ecuador · Facultad de Ingeniería y Ciencias Aplicadas · Programación Web · 2026  
Instructor: Ing. Juan Pablo Guevara Gordillo

---

<div align="center">

Built with ❤️ by the ATS-UCE team · 2026

</div>
