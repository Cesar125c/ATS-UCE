# Deploy — ATS-UCE en AWS

## Arquitectura

```
                          ┌──────────────────┐
                          │   AWS ALB (SSL)   │
                          └────────┬─────────┘
                                   │
                          ┌────────▼─────────┐
                          │   nginx:80/443    │
                          │   (EC2 / Docker)  │
                          └──┬────────────┬──┘
                             │            │
                     ┌───────▼───┐  ┌────▼────────┐
                     │ Frontend   │  │ Backend API  │
                     │ serve :5173│  │ uvicorn :8000│
                     │ (estático) │  └──────┬───────┘
                     └───────────┘          │
                                    ┌──────▼───────┐
                                    │  PostgreSQL   │
                                    │  (RDS / cont) │
                                    └──────────────┘
```

## Requisitos previos (AWS)

- EC2 con Docker y docker-compose
- RDS PostgreSQL 16 (o contenedor PostgreSQL en EC2)
- Nombre de dominio (Route53 u otro DNS)
- Certificados SSL (Let's Encrypt / certbot)

## QA vs Producción

| Variable | QA | Producción |
|----------|----|-----------|
| `APP_ENV` | `qa` | `production` |
| `FRONTEND_TARGET` | `production` | `production` |
| `DB_NAME` | `ats_uce_qa` | `ats_uce_prod` |
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

```bash
cp .env.example .env
# Editar .env con los valores del entorno correspondiente
nano .env
```

### 3. SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d ats-uce.example.com
# Certificados en /etc/letsencrypt/live/ats-uce.example.com/
```

### 4. Build y deploy

Un solo comando para cualquier entorno:

```bash
FRONTEND_TARGET=production docker compose -f docker-compose.yml up -d --build
```

Las migraciones de DB se ejecutan automáticamente en el entrypoint del contenedor `api`.

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

# Migraciones (automáticas, pero si se necesita manual)
docker compose exec api alembic upgrade head

# Backup DB
docker compose exec postgres pg_dump -U ats_uce ats_uce_prod > backup.sql

# Restore DB
docker compose exec -T postgres psql -U ats_uce ats_uce_prod < backup.sql
```

## Notas importantes

- El frontend de producción sirve archivos **estáticos** (build de Vite) mediante `serve -s dist` dentro del contenedor `frontend`, puerto 5173. Nginx proxy-pasa a `frontend:5173`.
- Las migraciones de Alembic corren automáticamente al iniciar el contenedor `api` via `entrypoint.sh`. No es necesario ejecutarlas manualmente.
- `ALLOWED_ORIGINS` debe ser un JSON array válido, ej: `["https://dominio.com"]`
- `VITE_CLERK_PUBLISHABLE_KEY` se inyecta en **build time** (ARG del Dockerfile), no en runtime.
- Para producción con SSL, usar `nginx/nginx.prod.conf` como referencia montándolo en el contenedor nginx.
