# TalentPath ATS — UCE
## Tareas de Erik Herrera · Backend Developer / Software Architect

---

## Semana 1 — Analysis & Architecture ✅

| ID | Actividad | Descripción | Estado |
|----|-----------|-------------|--------|
| ARCH-S1-01 | System Architecture Design | Arquitectura general del sistema | ✅ Completado |
| ARCH-S1-02 | Frontend Architecture | Arquitectura frontend | ✅ Completado |
| ARCH-S1-03 | Backend Architecture | Arquitectura backend | ✅ Completado |
| ARCH-S1-04 | Database Schema | Diseño de base de datos | ✅ Completado |
| ARCH-S1-05 | Deployment Architecture | Arquitectura de despliegue | ✅ Completado |

---

## Semana 2 — UI/UX Design & Repository Governance ✅

| ID | Actividad | Descripción | Estado |
|----|-----------|-------------|--------|
| BACK-S2-01 | Database & API Design | Diseño de base de datos y APIs | ✅ Completado |
| BACK-S2-02 | ER Diagram | Diagrama entidad-relación | ✅ Completado |
| BACK-S2-03 | REST API Definition | Definición de endpoints REST | ✅ Completado |
| BACK-S2-04 | API Documentation | Documentación de APIs (`API_CONTRACT.md`) | ✅ Completado |

---

## Semana 3 — Backend Foundation & Authentication 🔲

**Sprint Goal:** Clean Architecture implementada, entidades del dominio, BD con Alembic, JWT + RBAC y scaffold React listos.

| ID | Actividad | Criterios de Aceptación | Estado |
|----|-----------|------------------------|--------|
| US-003 / BE-001 | Clean Architecture Setup | Carpetas `domain/`, `application/`, `infrastructure/`, `api/` con `__init__.py`. Ningún archivo en `domain/` importa librerías externas. README explica la arquitectura. 6 ADRs en el repositorio. | 🔲 To Do |
| US-004 / BE-002 | Domain Entities & Value Objects | Clases Python puras: `Application` (AR), `Applicant`, `Vacancy`, `Evaluation`, `StatusHistory`. Métodos: `assign_ai_score()`, `advance_flow()`, `reject()`. Value Objects: `AIScore` (5 ejes 0–100, `evaluation_summary`), `FlowStatus` (`next_status()`, `required_role()`), `EvaluationDecision`. `WorkflowApprovalService` con lógica de transición. Tests unitarios en pytest. | 🔲 To Do |
| US-005 / BE-003 | PostgreSQL + Alembic | `docker compose up` sin errores. `alembic upgrade head` crea 5 tablas: `applicants`, `vacancies`, `applications`, `evaluations`, `status_history`. `GET /api/v1/health` → `{status:ok, database:connected}`. | 🔲 To Do |
| US-006 / BE-004 | Swagger Stub Endpoints | 8 endpoints en `/docs` con schemas Pydantic completos. Devuelven HTTP 501 con sprint de implementación. `API_CONTRACT.md` publicado y notificado a Jonathan. | 🔲 To Do |
| US-007 / BE-005 | Config Centralizada | `config.py` con `Settings(BaseSettings)`. `.env.example` sin valores reales. App no arranca si falta variable requerida. `.env` en `.gitignore`. | 🔲 To Do |
| US-013 / BE-006 | JWT Middleware — Clerk | `verify_token()` valida JWT de Clerk. Token inválido/expirado → HTTP 401. Token válido inyecta `current_user` (`user_id`, `role`, `email`). `/health` sigue siendo público. | 🔲 To Do |
| US-014 / BE-007 | RBAC — Roles por Endpoint | `require_role([...])` reutilizable en cualquier endpoint. Rol incorrecto → HTTP 403. Validación ocurre en `WorkflowApprovalService` antes de persistir. Test: postulante intenta acceder al dashboard RRHH → 403. | 🔲 To Do |
| US-012 | Auth Flow Design | Diagrama de flujo JWT por los 3 clientes (Web, Electron, React Native) documentado. Mapa `publicMetadata.role` → `FlowStatus.required_role()` definido. | 🔲 To Do |

---

## Semana 4 — Applications & AI Engine 🔲

**Sprint Goal:** Postulante sube CV. Motor IA evalúa con 5 ejes y avanza el flujo automáticamente. CVDropzone operativo.

| ID | Actividad | Criterios de Aceptación | Estado |
|----|-----------|------------------------|--------|
| US-018 | BackgroundTask Pattern Design | Diagrama de secuencia: POST → 201 inmediato → BackgroundTask ejecuta IA. Convención de clave en B2: `cvs/{clerk_user_id}/{application_id}.pdf`. Flujo de error documentado (PDF sin texto, OpenAI falla). | 🔲 To Do |
| US-022 | AI Prompt Design & Retry Strategy | Prompt canónico con los 5 ejes al 20% documentado. Retry: max 3 intentos, backoff 1s → 2s → 4s. Fallback si falla OpenAI: status queda en `PROCESSING_AI` con `error_reason`. | 🔲 To Do |
| US-019 / BE-019 | Backblaze B2 Adapter | `upload_file()`, `generate_presigned_url(expires_in=3600)`, `download_file()`. Errores de B2 no exponen detalles internos al cliente. | 🔲 To Do |
| US-020 / BE-008 | POST /applications | Acepta `multipart/form-data` (PDF + `vacancy_id`). Valida PDF ≤ 10 MB (HTTP 422 si no). Sube a B2 (`cvs/{user_id}/{app_id}.pdf`). Crea `Application` con `status=RECEIVED` + `status_history`. Retorna HTTP 201. Dispara BackgroundTask de IA. | 🔲 To Do |
| US-023 / BE-010 | PDF Text Extraction | `ProcessAIScoreUseCase` descarga PDF de B2 por `cv_storage_key`. PyMuPDF extrae texto legible. PDF sin capa de texto → `REJECTED` con razón `CV_NOT_READABLE` + email al candidato. | 🔲 To Do |
| US-024 / BE-011 | OpenAI Score Engine | Prompt inyecta `vacancy_title` y `vacancy_faculty`. JSON: `total_score`, `score_academic`, `score_experience`, `score_production`, `score_profile_match`, `score_languages`, `evaluation_summary`. `total >= 60` → `HR_STAGE`. `total < 60` → `REJECTED`. Score persistido en BD + `status_history`. | 🔲 To Do |

---

## Semana 5 — RRHH Dashboard & Notifications 🔲

**Sprint Goal:** RRHH ve ranking de candidatos, filtra, emite dictamen y el sistema envía emails automáticos en cada transición.

| ID | Actividad | Criterios de Aceptación | Estado |
|----|-----------|------------------------|--------|
| US-025 | Pagination & DB Indexes Design | Query con JOIN a `applicants` y `vacancies` (sin N+1). 3 índices en Alembic: `status`, `score_total DESC`, `status+score_total`. Pre-signed URL generada en el Use Case. | 🔲 To Do |
| US-026 / BE-012 | GET /applications — Ranking RRHH | `GET /api/v1/applications?status=HR_STAGE` con filtros: `faculty`, `min_score`, `page`, `page_size`. Ordenado por `score_total DESC`. URL pre-firmada al PDF (TTL 60 min). `GET /api/v1/dashboard/stats` → `{total_applicants, avg_score, in_progress, completed}`. | 🔲 To Do |
| US-027 / BE-013 | POST /evaluations — RRHH | `APPROVED` → `DEAN_STAGE` + `status_history` + notificación al Decano. `REJECTED` sin `observations` → HTTP 422. Evaluation persiste como registro inmutable. Solo `hr_staff` en `HR_STAGE`. | 🔲 To Do |
| US-038 / BE-017 | Email Notifications — Resend | Mapa completo de transiciones: `HR_STAGE`→RRHH, `DEAN_STAGE`→Decano, `RECTOR_STAGE`→Rector, `FINANCE_STAGE`→Director Fin., `HIRED`→candidato, `REJECTED`→candidato. Fallo de email **NO** bloquea la transición de estado. | 🔲 To Do |
| US-036 / BE-009 | GET /applicants/me/status | Retorna postulaciones del JWT actual con `status_history` (`transitioned_at` ISO 8601 UTC por etapa). Sin acceso a datos de otros usuarios. | 🔲 To Do |

---

## Semana 6 — Authorities Approval Flow 🔲

**Sprint Goal:** Flujo jerárquico HR→Decano→Rector→Director Financiero→HIRED completo y portal de autoridades operativo.

| ID | Actividad | Criterios de Aceptación | Estado |
|----|-----------|------------------------|--------|
| US-030 / BE-S6-01 | WorkflowApprovalService Tests | Test: autoridad en etapa incorrecta → `DomainError` antes de persistir. Test: rechazo en cualquier etapa → `REJECTED` final. Test: flujo completo con 7 entradas en `status_history` y 4 en `evaluations`. | 🔲 To Do |
| US-031 / BE-014 | Dean Stage Endpoint | `POST /evaluations` para rol `dean` en `DEAN_STAGE`. Expediente incluye observaciones previas de RRHH. `GET /api/v1/applications/pending-count` para badge de cabecera. `APPROVED` → `RECTOR_STAGE` + notificación al Rector. | 🔲 To Do |
| US-032 / BE-015 | Rector Stage Endpoint | `POST /evaluations` para rol `rector` en `RECTOR_STAGE`. Expediente incluye observaciones de RRHH y Decano. `APPROVED` → `FINANCE_STAGE` + notificación al Director Financiero. | 🔲 To Do |
| US-033 / BE-016 | Finance Stage Endpoint | `POST /evaluations` para `finance_director` en `FINANCE_STAGE`. Expediente incluye observaciones de todas las autoridades anteriores. `APPROVED` → `HIRED` + `status_history` + email de contratación al candidato. | 🔲 To Do |

---

## Semana 7 — Applicant Portal & Status Tracking 🔲

**Sprint Goal:** Postulante consulta estado con timestamps exactos. Stepper de 7 nodos operativo en todos los clientes.

| ID | Actividad | Criterios de Aceptación | Estado |
|----|-----------|------------------------|--------|
| US-035 / BE-S7-01 | GetApplicationStatusUseCase | Response incluye `status_history: [{status, transitioned_at}]` ordenado ASC. Todos los timestamps en ISO 8601 UTC. Documentado en `API_CONTRACT.md`. Funciona desde los 3 clientes. | 🔲 To Do |
| US-041 / BE-S7-02 | Rate Limiting | `slowapi` en FastAPI. `POST /applications` → 5 req/min por usuario. HTTP 429 con header `Retry-After` si se excede. | 🔲 To Do |
| US-042 / BE-S7-03 | Input Validation & Sanitization | Longitudes máximas en DTOs Pydantic. Campo `observations` sanitizado contra inyección. UUIDs validados antes de consultar BD. | 🔲 To Do |

---

## Semana 8 — Security, Testing & Production Deploy 🔲

**Sprint Goal:** Sistema auditado en seguridad, cobertura ≥ 70%, tests de integración pasando y desplegado con URL pública + HTTPS.

| ID | Actividad | Criterios de Aceptación | Estado |
|----|-----------|------------------------|--------|
| US-040 / BE-S8-01 | Security Audit Checklist | Todos los endpoints protegidos. Roles solo desde JWT (nunca desde body/query param). Postulante no accede a datos de otro usuario. URLs con TTL configurado. Sin stack traces en producción. Sin API keys en logs. Reporte firmado entregado a Emily (SM). | 🔲 To Do |
| US-044 / BE-S8-02 | Unit Tests ≥ 70% Coverage | `pytest tests/unit/ --cov=app/domain` muestra ≥ 70%. Todos los invariantes de dominio cubiertos. `AIScore`, `FlowStatus` y `EvaluationDecision` completamente testeados. | 🔲 To Do |
| US-045 / BE-S8-03 | Integration Tests E2E | BD de test en Docker separada. Test flujo completo: submit → AI (mock) → HR → Dean → Rector → Finance → HIRED. 7 entradas en `status_history`. 4 en `evaluations`. Mocks: OpenAI, B2, Resend. `pytest tests/integration/ -v` pasa. | 🔲 To Do |
| US-047 / BE-S8-04 | Production Architecture Doc | Documento: servicios, contenedores, puertos, variables de entorno. Instrucciones: `alembic upgrade head`. Smoke test documentado (5 pasos). Entregado a Cesar (SRE). | 🔲 To Do |

---

## Semana 9 — CI/CD, Documentation & Final Demo 🔲

**Sprint Goal:** Pipeline CD automático operativo. Documentación completa. Todos los bugs críticos cerrados. Demo ensayada y lista.

| ID | Actividad | Criterios de Aceptación | Estado |
|----|-----------|------------------------|--------|
| US-055 / BE-S9-01 | Backend Final Documentation | `README.md`: instalación en 5 pasos, descripción de Clean Architecture, endpoints principales. `API_CONTRACT.md` en sync con implementación real. Diagrama de arquitectura actualizado. 6 ADRs en el repositorio. | 🔲 To Do |
| US-057 / BE-S9-02 | Critical Bug Fixes | Cerrar todos los issues marcados como `critical` en Huly (backend). Sin ningún HTTP 500 en el flujo principal. Prueba del flujo completo en producción. | 🔲 To Do |
| BE-S9-03 | Final Smoke Test — Backend | Verificar en producción: login → postulación → IA → RRHH → Decano → Rector → Financiero → HIRED. Confirmar que los emails llegan correctamente a cada actor. | 🔲 To Do |

---

## Resumen por semana

| Semana | Sprint | Tasks BE/ARQ | Estado |
|--------|--------|:------------:|--------|
| S1 | Analysis & Architecture | 5 | ✅ |
| S2 | UI/UX & Repository Governance | 4 | ✅ |
| S3 | Backend Foundation & Authentication | 8 | 🔲 |
| S4 | Applications & AI Engine | 6 | 🔲 |
| S5 | RRHH Dashboard & Notifications | 5 | 🔲 |
| S6 | Authorities Approval Flow | 4 | 🔲 |
| S7 | Applicant Portal & Status Tracking | 3 | 🔲 |
| S8 | Security, Testing & Production Deploy | 4 | 🔲 |
| S9 | CI/CD, Documentation & Final Demo | 3 | 🔲 |
| **Total** | | **42** | **9 completadas · 33 pendientes** |
