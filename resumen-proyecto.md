# Resumen del Proyecto ATS-UCE

## Información General

- **Repositorio:** `/home/l4ta/Desktop/ATS-UCE`
- **Rama activa:** `fix/clerk-backend-integration` (working tree clean)
- **Arquitectura:** Clean Architecture / DDD (Frontend React + Backend FastAPI + PostgreSQL)
- **Despliegue:** Docker Compose (4 servicios: postgres, api, frontend, nginx)

---

## 1. Estructura del Proyecto

```
ATS-UCE/
├── .env                        # Variables de entorno (contiene API keys reales de Clerk)
├── docker-compose.yml          # Servicios: postgres, api, frontend, nginx
├── docker-compose.override.yml # Override dev con hot-reload
├── frontend/                   # React 19 + Vite 8 + TypeScript 6
├── backend/                    # FastAPI + SQLAlchemy async + PostgreSQL
└── nginx/
    ├── nginx.conf              # Proxy reverso (dev)
    └── nginx.prod.conf         # Proxy reverso (prod con SSL)
```

---

## 2. Frontend (React + Vite + TypeScript)

### Stack
| Componente | Versión |
|---|---|
| React | ^19.2.5 |
| Vite | ^8.0.16 |
| TypeScript | ~6.0.2 |
| Tailwind CSS | ^4.3.0 |
| Clerk (auth) | ^6.7.0 |
| react-hook-form | ^7.76.0 |

### Dependencias clave
- **runtime:** `@clerk/react`, `lucide-react`, `react-hook-form`
- **dev:** `@tailwindcss/vite`, `@vitejs/plugin-react`, `vitest`, `playwright`, `storybook`, `eslint`

### Enrutamiento
**No usa React Router.** El enrutamiento es manual en `src/App.tsx` con `window.location.pathname`:
| Ruta | Componente | Estado |
|---|---|---|
| `/` | Home (landing page) | Implementado |
| `/sign-up` | SignUp (registro) | Implementado |
| `/applicant` | Applicant | Placeholder |
| `/human-resources` | HumanResources | Placeholder |
| `/administrator` | Administrator | Placeholder |

Las redirecciones usan `window.location.assign()` (recarga completa de página).

### Componentes
- **layout:** `Header.tsx` (nav con Clerk SignIn/UserButton), `Footer.tsx`
- **home:** `HeroSection.tsx`, `CTASection.tsx`, `SignInModal.tsx`, `SelectRoleModal.tsx`, `RegisterForm.tsx`
- **ui:** 12 componentes base (Button, Input, Modal, Select, Badge, Card, etc.)
- **services:** `userService.ts` (llamadas API para auth/usuarios)
- **hooks:** `useSignUpWithRole.ts`

### Archivos problemáticos
- `src/pages/Authorities.tsx` → **archivo vacío** (0 líneas), página muerta

---

## 3. Backend (FastAPI + Python 3.12)

### Stack
| Componente | Versión |
|---|---|
| Python | 3.12 |
| FastAPI | >=0.115.0 |
| SQLAlchemy | >=2.0.36 (async + asyncpg) |
| Alembic | >=1.13.0 |
| Pydantic | >=2.9.0 |
| Clerk SDK | >=1.0.0 |

### Estructura (Clean Architecture)
```
backend/
├── app/
│   ├── api/v1/           # Endpoints FastAPI
│   ├── application/      # Casos de uso + DTOs
│   │   ├── dtos/         # Pydantic schemas
│   │   └── use_cases/    # Lógica de aplicación
│   ├── domain/           # Core del negocio (sin dependencias externas)
│   │   ├── entities/     # Entidades: Applicant, Application, Evaluation, etc.
│   │   ├── repositories/ # Interfaces (contratos)
│   │   ├── services/     # Servicios de dominio
│   │   └── value_objects/# Value objects: FlowStatus, AIScore, etc.
│   └── infrastructure/   # Adaptadores externos
│       ├── adapters/     # ClerkAuth, Backblaze, OpenAI, Resend
│       ├── database/     # Modelos ORM, mappers, sesión
│       └── repositories/ # Implementaciones SQLAlchemy
├── migrations/           # Alembic (1 migración inicial)
└── tests/                # Tests unitarios + integración
```

### Endpoints API (`/api/v1`)

| Método | Ruta | Estado | Auth | Notas |
|---|---|---|---|---|
| GET | `/health` | ✅ Implementado | No | Health check + DB |
| POST | `/register` | ✅ Implementado | No | Registro completo (Clerk + DB + rol) |
| GET | `/users/me` | ✅ Implementado | JWT (mock dev) | Perfil usuario actual |
| POST | `/users/set-role` | ✅ Implementado | No | Asignar rol durante registro OAuth |
| POST | `/applications/` | ✅ Implementado | applicant | Enviar postulación con CV PDF |
| GET | `/applications/` | ❌ Sprint 3 | hr_staff | Listar postulaciones |
| GET | `/applications/pending-count` | ❌ Sprint 3 | dean/rector/finance | Conteo pendientes |
| GET | `/applications/{id}` | ❌ Sprint 3 | hr_staff/dean/rector/finance | Detalle postulación |
| POST | `/applications/{id}/evaluations` | ❌ Sprint 3 | varios | Registrar decisión |
| GET | `/applicants/me/status` | ❌ Sprint 3 | applicant | Estado del postulante |
| GET | `/dashboard/stats` | ❌ Sprint 3 | hr_staff | Estadísticas dashboard |

### Casos de Uso

| Caso de Uso | Estado | Notas |
|---|---|---|
| `SubmitApplicationUseCase` | ✅ Implementado | Valida, sube CV a B2, guarda en RECEIVED |
| `ProcessAIScoreUseCase` | ✅ Implementado | Analiza CV con OpenAI, asigna score, avanza a HR_STAGE o REJECTED |
| `RecordAuthorityDecisionUseCase` | ❌ Sprint 3 | NotImplementedError |
| `ReviewRankingUseCase` | ❌ Sprint 3 | NotImplementedError |
| `GetApplicationStatusUseCase` | ❌ Sprint 3 | NotImplementedError |

### Adaptadores Externos

| Adaptador | Estado | Notas |
|---|---|---|
| `ClerkAuthAdapter` | ✅ Implementado | `verify_token()` y `set_user_role()` funcionales |
| `BackblazeStorageAdapter` | ❌ Sprint 2 | Todos los métodos: NotImplementedError |
| `OpenAIAnalysisAdapter` | ❌ Sprint 2 | `analyze_cv()`: NotImplementedError |
| `ResendEmailAdapter` | ❌ Sprint 2 | Todos los métodos: NotImplementedError |

### Base de Datos (PostgreSQL 16)

6 tablas + 2 enums de PostgreSQL:
- **users** → **applicants** (1:1) → **applications** (1:N) → **evaluations** (1:N), **status_history** (1:N)
- **vacancies** → **applications** (1:N)

**FlowStatus** (máquina de estados): RECEIVED → PROCESSING_AI → HR_STAGE → DEAN_STAGE → RECTOR_STAGE → FINANCE_STAGE → HIRED (+ REJECTED desde cualquier estado)

### Tests
- **Unitarios:** ~40+ tests (entidades, value objects, DTOs)
- **Integración:** `test_health_api.py` (3 tests), `test_application_repository.py`
- **Frontend tests:** ❌ No existen (solo Storybook stories)

---

## 4. Problemas Actuales y Bugs

### 4.1 Seguridad

- `.env` contiene **API keys reales de Clerk** y está commiteado en el repo (filtración de credenciales)

### 4.2 Autenticación y Autorización

- `get_current_user()` en `dependencies.py` (línea 33) tiene un **mock dev** que bypassea toda la autenticación con `TODO: Remove before Sprint 2`
- `AuthMiddleware` está definido en `auth_middleware.py` pero **nunca se añade a la app FastAPI** en `main.py`
- En producción, el JWT verification lanza `HTTPException(501)` porque Clerk JWK verification no está implementado completamente
- `handleOAuthUser` en `userService.ts` asigna rol `"applicant"` a **todos** los usuarios OAuth (Microsoft, Google, LinkedIn) independientemente del flujo de selección de rol, creando un posible conflicto con `SelectRoleModal`

### 4.3 Implementaciones Pendientes

- **6 endpoints** del Sprint 3 lanzan `HTTPException(501, "Not implemented — Sprint 3")`
- **3 adaptadores** (Backblaze, OpenAI, Resend) tienen todos sus métodos como `NotImplementedError`
- **3 casos de uso** (RecordAuthorityDecision, ReviewRanking, GetApplicationStatus) son `NotImplementedError`

### 4.4 Problemas de Código

- `src/pages/Authorities.tsx` → **archivo vacío** (página muerta)
- `Applicant` entidad de dominio está definida pero **nunca se usa**; el registro crea `ApplicantModel` directamente
- `user_role_store.py` (in-memory store) está definido pero **nunca se importa ni usa**
- Manejo de errores genérico: `SignInModal.tsx` usa `console.error()` sin mostrar errores al usuario
- No hay React Router → navegación con `window.location.assign()` causa recarga completa de página
- No hay TanStack Query (mencionado en README pero no en package.json)

### 4.5 Cobertura de Tests

- **Frontend:** 0 tests (ni Vitest, ni Playwright)
- **Backend:** Tests de integración requieren PostgreSQL real (dependen de `DATABASE_URL`)

---

## 5. Estado de Git

- **Rama actual:** `fix/clerk-backend-integration`
- **Working tree:** Limpio (sin cambios sin committear)
- **Ramas disponibles:** `dev`, `main`, `fix/clerk-backend-integration`, `qa`
- **Últimos commits:** Merge del revert de `feature/backend-auth-flow`, fixes de Clerk integration, refactor de Dockerfiles
- **Nota:** La rama activa es `fix/clerk-backend-integration` (no `dev` ni `main`), sugiriendo que hay un fix en curso

---

## 6. Pendientes Prioritarios

1. **Remover mock dev** en `dependencies.py` e implementar JWT verification real con Clerk
2. **Resolver conflicto de roles OAuth** entre `handleOAuthUser` y `SelectRoleModal`
3. **Implementar adaptadores** Backblaze, OpenAI, Resend (Sprint 2)
4. **Implementar endpoints** del Sprint 3
5. **Eliminar/decidir sobre** `Authorities.tsx` vacío, `user_role_store.py` no usado, `Applicant` entity no usada
6. **Agregar manejo de errores** visible para el usuario en el frontend
7. **Mover API keys** del `.env` a secrets reales y agregar `.env` a `.gitignore`
8. **Agregar enrutador** (React Router) para evitar recargas completas de página
