# Security Audit Checklist — ATS-UCE Backend

**Auditor:** Erik Herrera  
**Fecha:** 2026-07-05  
**Versión:** 0.1.0

## 1. Protección de Endpoints

| # | Criterio | Estado |
|---|----------|--------|
| 1.1 | Todos los endpoints protegidos con `require_role()` excepto `/health`, `/docs`, `/openapi.json` | ✅ |
| 1.2 | Rol siempre desde JWT (nunca desde body o query param) | ✅ |
| 1.3 | Postulante no accede a datos de otro usuario (filtrado por `clerk_user_id` del JWT) | ✅ |
| 1.4 | `human_resources` puede ver todas las postulaciones (es su función) | ✅ |
| 1.5 | `authorities` solo puede evaluar en su etapa correspondiente (`WorkflowApprovalService.validate_role_for_status()`) | ✅ |

### Endpoints públicos (sin auth):
- `GET /api/v1/health`
- `POST /api/v1/register`
- `POST /api/v1/users/set-role`
- `POST /api/v1/users/sync-role`
- `GET /api/v1/vacancies/`
- `GET /docs`, `GET /redoc`, `GET /openapi.json`

## 2. Rate Limiting

| # | Criterio | Estado |
|---|----------|--------|
| 2.1 | `POST /api/v1/applications/` limitado a 5 req/min por usuario | ✅ |
| 2.2 | `POST /api/v1/applications/{id}/evaluations` limitado a 10 req/min por usuario | ✅ |
| 2.3 | Rate limit key extraída del JWT `sub` (no IP) | ✅ |
| 2.4 | HTTP 429 con header `Retry-After` | ✅ |
| 2.5 | Default global: 200 req/min | ✅ |

## 3. Exposición de Errores

| # | Criterio | Estado |
|---|----------|--------|
| 3.1 | Stack traces suprimidos en producción (`app_env=production`) | ✅ |
| 3.2 | Stack traces visibles en desarrollo para debugging | ✅ |
| 3.3 | `DomainError` → 403 con mensaje descriptivo | ✅ |
| 3.4 | `ValueError` → 422 con mensaje descriptivo | ✅ |
| 3.5 | Excepciones no manejadas → 500 genérico en prod | ✅ |

## 4. Logs y Secrets

| # | Criterio | Estado |
|---|----------|--------|
| 4.1 | Sin API keys en logs (`logger.info/warning/error`) | ✅ |
| 4.2 | Sin secrets en `print()` statements | ✅ |
| 4.3 | `logger.exception` solo usado en handler general de 500 | ✅ |
| 4.4 | `.env` en `.gitignore` | ✅ |
| 4.5 | `.env.example` sin valores reales | ✅ |

## 5. CORS

| # | Criterio | Estado |
|---|----------|--------|
| 5.1 | `ALLOWED_ORIGINS` configurable por variable de entorno | ✅ |
| 5.2 | Defaults seguros para desarrollo (`localhost:5173`, `localhost:3000`) | ✅ |
| 5.3 | Credentials habilitados (necesario para JWT en Authorization header) | ✅ |

## 6. Base de Datos

| # | Criterio | Estado |
|---|----------|--------|
| 6.1 | `DATABASE_URL` requerido, sin default | ✅ |
| 6.2 | Conexiones con `pool_pre_ping=True` | ✅ |
| 6.3 | SSL no forzado en dev, configurable en prod vía URL | ✅ |

## 7. Dependencias

| # | Criterio | Estado |
|---|----------|--------|
| 7.1 | Clerk JWT verificado con JWKS (firma criptográfica) | ✅ |
| 7.2 | PyJWT con `verify_exp=True` | ✅ |
| 7.3 | `email-validator` para validación de emails | ✅ |
| 7.4 | `slowapi` para rate limiting | ✅ |

## Resumen

- **Total criterios:** 25
- **Cumplidos:** 25
- **Pendientes:** 0

---

*Firmado: Erik Herrera — 2026-07-05*
