# Production Architecture — ATS-UCE Backend

**Versión:** 0.1.0  
**Fecha:** 2026-07-05

## Servicios y Contenedores

| Servicio | Imagen | Puerto | Descripción |
|----------|--------|--------|-------------|
| `postgres` | `postgres:16-alpine` | 5432 | Base de datos PostgreSQL |
| `api` | `ats-uce-api` | 8000 | FastAPI + Uvicorn |
| `frontend` | `ats-uce-frontend` | 5173 (dev) | React + Vite |
| `nginx` | `nginx:alpine` | 80 | Reverse proxy |

## Variables de Entorno Requeridas

### API (`backend/.env`)
```
DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/ats_uce
CLERK_SECRET_KEY=sk_live_xxx
CLERK_JWKS_URL=https://golden-grackle-91.clerk.accounts.dev/.well-known/jwks.json
B2_APPLICATION_KEY_ID=xxx
B2_APPLICATION_KEY=xxx
B2_BUCKET_NAME=uce-talentpath-cvs
B2_ENDPOINT_URL=https://s3.us-west-004.backblazeb2.com
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=talentpath@uce.edu.ec
GROQ_API_KEY=gsk_xxx
APP_ENV=production
ALLOWED_ORIGINS=["https://talentpath.uce.edu.ec"]
```

### Frontend (`frontend/.env`)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
VITE_API_URL=/api/v1
```

## Despliegue

### 1. Build
```bash
FRONTEND_TARGET=production docker compose -f docker-compose.yml build
```

### 2. Migraciones
```bash
docker compose exec api alembic upgrade head
```

### 3. Levantar
```bash
FRONTEND_TARGET=production docker compose -f docker-compose.yml up -d
```

### 4. Smoke Test
```bash
# 1. Health check
curl -f https://talentpath.uce.edu.ec/api/v1/health

# 2. Listar vacantes (público)
curl -f https://talentpath.uce.edu.ec/api/v1/vacancies/

# 3. Login via Clerk (frontend)
# Navegar a https://talentpath.uce.edu.ec y autenticarse

# 4. Subir CV (applicant)
# POST /api/v1/applications/ con PDF

# 5. Verificar scoring y flujo completo
# HR → autoridades → HIRED
```

## Health Checks

| Servicio | Tipo | Intervalo | Timeout | Retries |
|----------|------|-----------|---------|---------|
| postgres | `pg_isready` | 10s | 5s | 5 |
| api | `GET /api/v1/health` | 30s | 5s | 3 |
| frontend | `GET /` | 30s | 5s | 3 |
| nginx | `nginx -t` | 30s | 5s | 3 |

## Volúmenes

| Nombre | Montaje | Persistencia |
|--------|---------|-------------|
| `postgres_data` | `/var/lib/postgresql/data` | Datos de BD |

## Red

Todos los servicios comparten la red default de Docker Compose. Nginx expone el puerto 80 al host.
