# Deploy — ATS-UCE en AWS

## Arquitectura

```
                         ┌──────────────────┐
                         │   AWS ALB (opcional) │
                         │   SSL termination    │
                         └────────┬─────────┘
                                  │
                         ┌────────▼─────────┐
                         │   nginx:80/443    │
                         │   (EC2 / Docker)  │
                         └──┬────────────┬──┘
                            │            │
                    ┌───────▼───┐  ┌────▼────────┐
                    │ Frontend   │  │ Backend API  │
                    │ (estático) │  │ uvicorn x4   │
                    └───────────┘  └──────┬───────┘
                                          │
                                   ┌──────▼───────┐
                                   │  PostgreSQL   │
                                   │  (RDS / cont) │
                                   └──────────────┘
```

## Requisitos previos (AWS)

- EC2 (o ECS/EKS) con Docker y docker-compose
- RDS PostgreSQL 16 (o contenedor PostgreSQL en EC2)
- Nombre de dominio (Route53 u otro DNS)
- Certificados SSL (Let's Encrypt / certbot)

## QA vs Producción

| Variable | QA | Producción |
|----------|----|-----------|
| `APP_ENV` | `qa` | `production` |
| `DB_NAME` | `ats_uce_qa` | `ats_uce_prod` |
| `DOMAIN_NAME` | `qa.ats-uce.example.com` | `ats-uce.example.com` |
| `ALLOWED_ORIGINS` | `["https://qa.ats-uce.example.com"]` | `["https://ats-uce.example.com"]` |
| `CLERK_SECRET_KEY` | QA key | Production key |
| `VITE_CLERK_PUBLISHABLE_KEY` | QA key | Production key |

## Pasos para deploy

### 1. Clonar en la instancia EC2

```bash
ssh ec2-user@<IP>
git clone https://github.com/FostDull/Proyect.git /opt/ats-uce
cd /opt/ats-uce
```

### 2. Configurar variables de entorno

Crear un `.env` para cada entorno:

```bash
# QA
cat > .env.qa <<EOF
APP_ENV=qa
DB_USER=ats_uce
DB_PASSWORD=<password_seguro>
DB_NAME=ats_uce_qa
ALLOWED_ORIGINS=["https://qa.ats-uce.example.com"]
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
EOF

# Producción
cat > .env.prod <<EOF
APP_ENV=production
DB_USER=ats_uce
DB_PASSWORD=<password_seguro>
DB_NAME=ats_uce_prod
ALLOWED_ORIGINS=["https://ats-uce.example.com"]
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
EOF
```

### 3. SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d ats-uce.example.com
# Certificados en /etc/letsencrypt/live/ats-uce.example.com/
```

O copiar los certificados a `/etc/ssl/certs/`:

```bash
sudo cp /etc/letsencrypt/live/ats-uce.example.com/fullchain.pem /etc/ssl/certs/
sudo cp /etc/letsencrypt/live/ats-uce.example.com/privkey.pem /etc/ssl/private/
```

### 4. Build y deploy

**QA:**
```bash
set -a; source .env.qa; set +a
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose exec api python -m alembic upgrade head
```

**Producción:**
```bash
set -a; source .env.prod; set +a
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose exec api python -m alembic upgrade head
```

### 5. Verificar

```bash
curl -s https://ats-uce.example.com/api/v1/health
# {"status":"ok","version":"0.1.0","database":"connected"}
```

## Comandos útiles

```bash
# Ver logs
docker compose logs -f api
docker compose logs -f nginx

# Reiniciar servicio
docker compose restart api

# Migraciones
docker compose exec api python -m alembic upgrade head

# Backup DB
docker compose exec postgres pg_dump -U ats_uce ats_uce_prod > backup.sql

# Restore DB
docker compose exec -T postgres psql -U ats_uce ats_uce_prod < backup.sql
```

## Notas importantes

- El frontend de producción sirve archivos **estáticos** (build de Vite) servidos por nginx, no el servidor de desarrollo de Vite
- `package-lock.json` se regeneró después de resolver conflictos de merge — ejecutar `npm install` si se modifican dependencias
- La DB `postgres` expone puerto solo en `127.0.0.1` en producción — no accesible desde fuera
- El backend corre con `--workers 4` en producción (uvicorn, sin gunicorn)
- `ALLOWED_ORIGINS` debe ser un JSON array válido, ej: `["https://dominio.com"]`
- Clerk `VITE_CLERK_PUBLISHABLE_KEY` se inyecta en **build time** (ARG del Dockerfile), no en runtime
