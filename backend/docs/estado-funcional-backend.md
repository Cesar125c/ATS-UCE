# Estado Funcional del Backend — ATS-UCE

> Documento de apoyo para la presentación. Resume qué funciona, qué no, y cómo demostrarlo en vivo.

---

## 1. Lo que SÍ funciona (demostrable en vivo)

### ✅ Health Check — Endpoint público
```bash
curl http://localhost:8000/api/v1/health
```
```json
{"status": "ok", "version": "0.1.0", "database": "connected"}
```
- Muestra que la API y PostgreSQL están operativos
- Si se apaga la DB, cambia a `"database": "unavailable"` — prueba que el health check es real

### ✅ Swagger UI — Documentación interactiva
```
http://localhost:8000/docs
```
- Los 8 endpoints aparecen con sus schemas Pydantic
- Códigos de respuesta documentados (200, 201, 401, 403, 404, 422, 501)
- Se puede probar el health check directamente desde el navegador

### ✅ Clean Architecture — 4 capas visibles en código
| Capa | Carpeta | Contenido | Dependencias externas |
|---|---|---|---|
| **Domain** | `app/domain/` | Entidades, VOs, interfaces, servicio | **CERO** (solo stdlib) |
| **Application** | `app/application/` | Use cases, DTOs | Solo Domain |
| **Infrastructure** | `app/infrastructure/` | ORM, repositorios, adapters | SQLAlchemy, asyncpg |
| **API** | `app/api/` | Routers, DI, middlewares | FastAPI |

Demostración: abrir `app/domain/entities/application.py` → mostrar que `import` solo tiene `uuid`, `datetime`, `dataclasses`.

### ✅ RBAC — Control de roles por endpoint
```python
# Ejemplo: solo hr_staff puede ver el dashboard
@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    _user: dict = Depends(require_role(["hr_staff"])),
    ...
)
```
- `require_role(["hr_staff"])` reusable en cualquier endpoint
- Rol incorrecto → HTTP 403
- Se puede probar con el mock de desarrollo (devuelve `hr_staff`)

### ✅ Base de datos — 5 tablas con migraciones
```bash
docker compose exec api uv run alembic upgrade head
docker compose exec db psql -U ats_uce -d ats_uce_dev -c "\dt"
```
```
 applicants      | tabla de postulantes vinculados a Clerk
 vacancies       | plazas docentes activas/inactivas
 applications    | Aggregate Root — postulaciones
 evaluations     | decisiones inmutables de autoridades
 status_history  | auditoría de cambios de estado
```

### ✅ Tests unitarios — 34 pasando
```bash
docker compose exec api uv run pytest tests/unit -v
```
- `test_ai_score.py` — 13 tests (validación de 5 ejes, grade, preselection)
- `test_application.py` — 9 tests (invariantes del Aggregate Root)
- `test_evaluation.py` — 5 tests (regla de observations en reject)
- `flow_status.py` — 7 tests (transiciones, terminal states, roles)

### ✅ Documentación generada
| Archivo | Contenido |
|---|---|
| `backend/docs/adr/ADR-001` a `ADR-006` | 6 Architecture Decision Records |
| `backend/docs/API_CONTRACT.md` | Contrato completo de los 8 endpoints |
| `backend/docs/auth-flow-diagram.md` | Diagramas Mermaid del flujo JWT |
| `backend/docs/DIAGRAMAS_BACKEND.md` | 10 diagramas de arquitectura |
| `backend/docs/ANALISIS_PROYECTO.md` | Análisis técnico completo |

---

## 2. Lo que NO funciona aún (y por qué)

### ❌ POST /applications/ — Subir CV
**Devuelve:** `NotImplementedError` del adapter `BackblazeStorageAdapter`

**Motivo:** Backblaze B2 es un servicio externo que requiere configuración de DevOps (crear bucket, generar keys). El adapter está diseñado, la validación (PDF, 10 MB) está en el endpoint, el caso de uso orquesta todo — falta la implementación real del storage.

### ❌ POST /evaluations/ — Decisiones de autoridades
**Devuelve:** HTTP 501

**Motivo:** Tarea del Sprint 5 (US-025 a US-027). El `WorkflowApprovalService` con la lógica de transición ya existe en Domain, los DTOs (`EvaluationRequest`) con validación están listos — falta conectar el endpoint con el repositorio.

### ❌ GET /applications/ — Ranking con filtros
**Devuelve:** HTTP 501

**Motivo:** Sprint 5 (US-026). La query de ranking con `JOIN`, índices compuestos y pre-signed URLs está diseñada pero no implementada.

### ❌ JWT Clerk real (verify_token)
**Devuelve:** 501 en producción, mock en desarrollo

**Motivo:** Depende de la tarea US-011/DEVOPS-S3 (Cesar Cueva) — crear la app en Clerk, configurar roles en `publicMetadata`, compartir las keys. Sin eso, no hay JWKS endpoint contra el cual validar.

---

## 3. Tabla resumen de los 8 endpoints

| # | Método | Ruta | Rol | Estado | Demostrable |
|---|---|---|---|---|---|
| 1 | GET | `/api/v1/health` | Público | ✅ | Sí |
| 2 | GET | `/api/v1/applications/` | hr_staff | 🔲 S5 | No (501) |
| 3 | GET | `/api/v1/applications/pending-count` | dean/rector/finance | 🔲 S5 | No (501) |
| 4 | GET | `/api/v1/applications/{id}` | hr_staff+ | 🔲 S5 | No (501) |
| 5 | POST | `/api/v1/applications/` | applicant | ⚠️ Sprint 2 | Parcial (valida PDF/10MB) |
| 6 | POST | `/api/v1/applications/{id}/evaluations` | hr_staff+ | 🔲 S5 | No (501) |
| 7 | GET | `/api/v1/applicants/me/status` | applicant | 🔲 S5 | No (501) |
| 8 | GET | `/api/v1/dashboard/stats` | hr_staff | 🔲 S5 | No (501) |

---

## 4. Checklist para la presentación

- [ ] `docker compose up --build -d` en `backend/`
- [ ] Mostrar `curl localhost:8000/api/v1/health`
- [ ] Abrir `http://localhost:8000/docs` en el navegador
- [ ] Mostrar `app/domain/` sin imports externos
- [ ] Ejecutar `uv run pytest tests/unit -v` (34 tests)
- [ ] Mostrar `docs/API_CONTRACT.md` y `docs/adr/`
- [ ] Explicar por qué los endpoints restantes devuelven 501 (plan de sprints)

---

*Documento generado el 2026-06-01 — Erik Herrera, Backend Developer / Software Architect*
