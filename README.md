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
| **AI** | Groq (Llama 3.1) · OpenAI · Gemini (multi-provider) |
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
git clone https://github.com/Cesar125c/ATS-UCE.git
cd ATS-UCE

# 2. Configure environment
cp .env.example .env
# → fill in required values (see Environment Variables below)

# 3. Start the stack
docker compose up --build -d

# 4. Run migrations
docker compose exec api alembic upgrade head

# 5. Open in browser
# Frontend: http://localhost
# API docs: http://localhost/api/v1/docs
```

Backend runs at `http://localhost:8000` · API docs at `http://localhost/api/v1/docs` · Frontend at `http://localhost`

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

# Groq
GROQ_API_KEY=gsk_...

# Gemini
GEMINI_API_KEY=

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=talentpath@uce.edu.ec

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost
```

> **Roles (3):** `applicant` · `human_resources` · `authorities` — asignados via Clerk `publicMetadata.role`.
> Las 3 etapas de autoridades (DEAN, RECTOR, FINANCE) comparten el rol `authorities`.

## API Endpoints

| Endpoint | Método | Acceso | Descripción |
|----------|--------|--------|-------------|
| `/api/v1/health` | GET | Público | Health check |
| `/api/v1/register` | POST | Público | Sincronizar usuario post-Clerk |
| `/api/v1/users/me` | GET | Auth | Perfil del usuario autenticado |
| `/api/v1/users/set-role` | POST | Público | Asignar rol a usuario |
| `/api/v1/users/sync-role` | POST | Público | Sincronizar rol con Clerk |
| `/api/v1/applications/` | POST | `applicant` | Subir CV (PDF ≤ 10 MB), 5/min |
| `/api/v1/applications/` | GET | `human_resources` | Ranking de postulaciones |
| `/api/v1/applications/cv-presigned/{key}` | GET | `human_resources`, `authorities` | URL pre-firmada del CV |
| `/api/v1/applications/{id}/evaluations` | POST | `human_resources`, `authorities` | Dictamen (APPROVED/REJECTED), 10/min |
| `/api/v1/applicants/me/status` | GET | `applicant` | Estado de mis postulaciones |
| `/api/v1/dashboard/stats` | GET | `human_resources` | Estadísticas del dashboard |
| `/api/v1/vacancies/` | GET | Público | Listar vacantes activas |
| `/api/v1/vacancies/` | POST | `human_resources`, `authorities` | Crear vacante |
| `/api/v1/vacancies/{id}` | DELETE | `human_resources` | Eliminar vacante |

---

## Development Workflow

```
feature/X  →  dev  →  qa  →  main
```

Cada PR a `dev` ejecuta CI (`ruff` + `pytest`). Las ramas feature parten de `dev` y se mergean vía PR. De `dev` se promueve a `qa` y luego a `main`.

```bash
# Run tests
uv run pytest tests/unit/ -v                      # domain + use cases, no DB
docker compose exec api pytest tests/integration/ -v  # full flow, postgres in Docker

# Lint & format
uv run ruff check app/
uv run ruff format app/
```

---

## Deployment

Cada entorno es un stack Docker Compose autónomo:

| Contenedor | Rol |
|---|---|
| `nginx:alpine` | Sirve el SPA React + reverse-proxy `/api/*` a FastAPI |
| `api` | FastAPI + Uvicorn |
| `postgres:16` | Base de datos (solo interno) |
| `frontend` | React + Vite (dev) / build estático (prod) |

Los puertos `8000` y `5432` no se exponen externamente. Todo el tráfico entra por Nginx en `80`.

En cada CD: `docker compose pull → up -d → alembic upgrade head → health check`.

Ver `backend/docs/production-architecture.md` para instrucciones detalladas de deploy.

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
