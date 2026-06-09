# Backend API Contract — ATS-UCE

## Stack

| Capa       | Tecnología                          |
|------------|-------------------------------------|
| Framework  | FastAPI (Python 3.12+)             |
| Auth       | Clerk.com (JWT) + rol en metadata  |
| ORM        | SQLAlchemy 2.0 (async)             |
| DB         | PostgreSQL 16                      |
| Migrations | Alembic                            |
| Storage    | Backblaze B2 (Sprint 3)            |
| AI         | OpenAI GPT (Sprint 3)              |

## Base URL

| Entorno | URL                          |
|---------|------------------------------|
| Dev     | `http://localhost:8000`      |
| QA      | `https://qa.ats-uce.com`     |
| Prod    | `https://ats-uce.com`        |

Todos los endpoints van bajo el prefijo `/api/v1`.

---

## TODO implementados (Sprint 1)

### 1. Health Check

```
GET /api/v1/health
```

**Auth:** No requiere  
**Response 200:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

### 2. POST /auth/register — Registro de usuario

```
POST /api/v1/auth/register
```

**Auth:** No requiere (se llama justo después del signup en Clerk)  
**Content-Type:** `application/json`

**Request:**
```json
{
  "clerk_user_id": "user_2s2QkF7ZK4p",
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@uce.edu.ec",
  "role": "applicant"
}
```

**Roles válidos:**
| Rol                | Descripción                     | Email requerido         |
|--------------------|---------------------------------|-------------------------|
| `applicant`        | Postulante                      | cualquiera              |
| `human_resources`  | Personal de RRHH                | `@uce.edu.ec`           |
| `authorities`      | Decano/Rector/Director          | `@uce.edu.ec`           |

> ❌ Roles inválidos (devuelven 422): `hr_staff`, `dean`, `rector`, `administrator`, `finance_director`

**Response 201:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user_id": "a1b2c3d4-...",
  "role": "applicant"
}
```

**Errores:**
| Código | Motivo                       |
|--------|------------------------------|
| 409    | `clerk_user_id` o email duplicado |
| 422    | Rol inválido o email no institucional |
| 500    | Clerk API key no configurada en prod |

**Notas:**
- Si `role == "applicant"` se crea automáticamente un registro en la tabla `applicants` (vinculado por `user_id`)
- El endpoint también escribe el rol en `publicMetadata` de Clerk via `ClerkAuthAdapter.set_user_role()`
- En desarrollo sin `CLERK_SECRET_KEY` el adapter es un no-op (logea)

---

### 3. GET /users/me — Perfil del usuario autenticado

```
GET /api/v1/users/me
```

**Auth:** Bearer Token (Clerk JWT) — en dev devuelve mock  
**Response 200:**
```json
{
  "id": "a1b2c3d4-...",
  "email": "juan@uce.edu.ec",
  "first_name": "Juan",
  "last_name": "Pérez",
  "role": "applicant",
  "is_active": true
}
```

**Errores:**
| Código | Motivo                         |
|--------|--------------------------------|
| 401    | Token inválido o ausente       |
| 404    | Usuario en Clerk pero no en DB |

**Notas:**
- Busca al usuario por `clerk_id` en la tabla `users`
- En dev retorna un mock si no hay `CLERK_SECRET_KEY`

---

### 4. Health Check (implícito) y stubs

#### GET /applications/
```
GET /api/v1/applications/
```
**Auth:** `hr_staff` | **Status:** 501 — Sprint 3  
Listado paginado de postulaciones.

#### GET /applications/pending-count
```
GET /api/v1/applications/pending-count
```
**Auth:** `dean`, `rector`, `finance_director` | **Status:** 501 — Sprint 3

#### GET /applications/{id}
```
GET /api/v1/applications/{id}
```
**Auth:** `hr_staff`, `dean`, `rector`, `finance_director` | **Status:** 501 — Sprint 3

#### POST /applications/
```
POST /api/v1/applications/
```
**Auth:** `applicant` | **Status:** 501 — Sprint 3  
Subir postulación con CV (multipart/form-data).

#### GET /applicants/me/status
```
GET /api/v1/applicants/me/status
```
**Auth:** `applicant` | **Status:** 501 — Sprint 3

#### POST /applications/{application_id}/evaluations
```
POST /api/v1/applications/{application_id}/evaluations
```
**Auth:** `hr_staff`, `dean`, `rector`, `finance_director` | **Status:** 501 — Sprint 3

#### GET /dashboard/stats
```
GET /api/v1/dashboard/stats
```
**Auth:** `hr_staff` | **Status:** 501 — Sprint 3

---

## Esquema de la DB

```mermaid
erDiagram
    users {
        uuid id PK
        text clerk_id UK
        text email UK
        text first_name
        text last_name
        text role
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    applicants {
        uuid id PK
        uuid user_id FK
        text status
        timestamp created_at
        timestamp updated_at
    }
    users ||--o| applicants : "user_id"
```

- `users.clerk_id` = ID que viene de Clerk (`user_xxx`)
- `users.role` se escribe via `publicMetadata` de Clerk
- `applicants` se crea automáticamente solo si `role == "applicant"`

---

## Roles vs. Endpoints (matriz de acceso)

| Rol                | /register | /users/me | /applications | /applicants | /evaluations | /dashboard |
|--------------------|-----------|-----------|---------------|-------------|--------------|------------|
| `applicant`        | ✅        | ✅        | solo propio   | me (501)    | ❌           | ❌         |
| `human_resources`  | ✅        | ✅        | CRUD          | ❌          | evaluar      | stats      |
| `authorities`      | ✅        | ✅        | ver           | ❌          | evaluar      | ❌         |

Todos los endpoints marcados como 501 serán implementados en Sprints 2-3.

---

## Auth Flow (dev)

En desarrollo, sin `CLERK_SECRET_KEY` en `.env`:

1. `get_current_user()` retorna un mock: `{"user_id": "dev_user_001", "role": "hr_staff", "email": "dev@uce.edu.ec"}`
2. El registro llama a `ClerkAuthAdapter` que es no-op
3. El frontend genera un `clerk_user_id` local con `crypto.randomUUID()` para el POST `/register`

> ⚠️ En QA/Prod se requiere Clerk real. El JWT se valida contra el JWKS endpoint de Clerk.

---

## Dev quickstart

```bash
docker compose up -d              # PostgreSQL
source .venv/bin/activate         # Python env
alembic upgrade head              # Migraciones
uvicorn app.main:app --reload     # Servidor :8000
```

OpenAPI docs: http://localhost:8000/docs  
ReDoc: http://localhost:8000/redoc
