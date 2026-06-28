# Frontend ↔ Backend Sync Report
Fecha: 2026-06-28
Rama: fix/clerk-backend-integration

## Resultado por punto

| Punto | Estado | Acción tomada |
|---|---|---|
| 1. URL base y variables de entorno | ✅ OK | Nginx proxy y Vite proxy configurados correctamente. Health check responde por ambas vías. |
| 2. Rutas de endpoints | ✅ OK | Frontend llama `/api/v1/users/set-role` y `/api/v1/users/sync-role`. Backend expone exactamente esas rutas. Sin discrepancias. |
| 3. Schemas request/response | ✅ OK | Frontend envía `{clerkUserId, role, email, firstName, lastName}`. Backend `SetRoleRequest` acepta exactamente esos campos. Sync-role coincide también. |
| 4. Strings de roles | ❌ Corregido | **Raíz del problema:** `flow_status.py::required_role()` retornaba `hr_staff`, `dean`, `rector`, `finance_director` en lugar de los 3 roles canónicos. **Corregido** en `flow_status.py`, `dependencies.py` (mock user), `evaluations.py`, `dashboard.py`, `applications.py`. Tests de unidad actualizados. |
| 5. Formato de errores HTTP | ✅ OK | Backend retorna `{"detail": "..."}` (estándar FastAPI). Frontend lee `body.detail \|\| body.message` — compatible. Status codes: 401, 403, 409, 422 verificados en vivo. |
| 6. CORS — orígenes | ✅ OK | Agregado `file://` y `http://localhost:3000` a ALLOWED_ORIGINS en `.env`. Preflight verificado para los 3 orígenes: localhost:5173, file://, localhost. |
| 7. Header de autenticación | ❌ Corregido | **Bug crítico:** `dependencies.py` usaba `ClerkAuthAdapter` y `logger` sin importarlos, causando 500 en cualquier endpoint protegido. **Corregido** agregando los imports faltantes. |
| 8. Redirección post-login | ✅ OK | `useRoleRedirect.ts` mapea los 3 roles canónicos a rutas que coinciden con las definidas en `App.tsx`. `RegisterForm.tsx` y `SignInModal.tsx` usan la misma lógica de redirección. |

## Archivos modificados

| Archivo | Descripción del cambio |
|---|---|
| `backend/app/api/dependencies.py` | Agregados imports faltantes (`logging`, `ClerkAuthAdapter`). Mock user role cambiado de `hr_staff` a `human_resources`. |
| `backend/app/domain/value_objects/flow_status.py` | `required_role()` mapeo actualizado: HR_STAGE→`human_resources`, DEAN/RECTOR/FINANCE→`authorities`. |
| `backend/app/api/v1/evaluations.py` | `require_role()` actualizado a `["human_resources", "authorities"]`. |
| `backend/app/api/v1/dashboard.py` | `require_role()` actualizado a `["human_resources"]`. |
| `backend/app/api/v1/applications.py` | `require_role()` del listado actualizado a `["human_resources"]`. |
| `backend/tests/unit/domain/test_flow_status.py` | Aserciones actualizadas a los roles canónicos. |
| `backend/tests/unit/domain/test_evaluation.py` | Dato de test `reviewer_role` cambiado a `human_resources`. |
| `.env` | CORS: agregados `file://` y `http://localhost:3000` a `ALLOWED_ORIGINS`. |

## Estado del sistema
- Health check: ✅ `{"status":"ok","database":"connected"}`
- Unit tests: ✅ 58/58 passing
- Integration tests: ⚠️ 5/15 passing (10 errores preexistentes por falta de API keys para Backblaze/OpenAI — no relacionados con este fix)
- Flujo registro → BD: ✅ verificado (POST /api/v1/register escribe en tabla users)
- Validación de rol: ✅ verificado (hr_staff rechazado con 422, human_resources aceptado con 201)
- Validación de email institucional: ✅ verificado (gmail rechazado para human_resources con 422, @uce.edu.ec aceptado)
- Duplicado: ✅ verificado (HTTP 409 en segundo registro)
- CORS preflight: ✅ verificado para los 3 orígenes requeridos

## Discrepancias conocidas no corregidas

| Endpoint | Status | Motivo |
|---|---|---|
| `GET /api/v1/applications/` | Implementado | Requiere `require_role(["human_resources"])` — correcto |
| `POST /api/v1/applications/` | Implementado | Requiere `require_role(["applicant"])` — correcto |
| `GET /api/v1/applicants/me/status` | Implementado | Requiere `require_role(["applicant"])` — correcto |
| `GET /api/v1/dashboard/stats` | Implementado | Requiere `require_role(["human_resources"])` — correcto |
| `POST /api/v1/applications/{id}/evaluations` | Implementado | Requiere `require_role(["human_resources", "authorities"])` — correcto |
| `POST /api/v1/vacancies/` | Sprint 5+ | Retorna 501 — esperado |
| `GET /api/v1/vacancies/` | Sprint 5+ | Retorna 501 — esperado |
| Tests de integración con Backblaze/OpenAI | Preexistentes | Faltan API keys en el entorno de test |

## Resumen de roles canónicos (verificación final)

| Rol | String exacto | Uso en frontend | Uso en backend |
|---|---|---|---|
| Postulante | `applicant` | RegisterForm, useRoleRedirect, App, userService | RegisterRequest, SetRoleRequest, require_role, DB |
| RRHH | `human_resources` | RegisterForm, useRoleRedirect, App, userService | RegisterRequest, SetRoleRequest, require_role, flow_status, DB |
| Autoridades | `authorities` | RegisterForm, useRoleRedirect, App, userService | RegisterRequest, SetRoleRequest, require_role, flow_status, DB |
