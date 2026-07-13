---

# API Contract — ATS-UCE Backend

**Version:** 0.1.0  
**Base URL:** `/api/v1`  
**Protocol:** HTTP/1.1 + REST  
**Authentication:** Bearer JWT (Clerk)  

## Roles

The system has exactly **3 roles**:

| Role | Description |
|---|---|
| `applicant` | Postulante — submits applications, checks own status |
| `human_resources` | Recursos Humanos — reviews at HR_STAGE, manages vacancies, views dashboard |
| `authorities` | Autoridades — reviews at DEAN_STAGE, RECTOR_STAGE, FINANCE_STAGE |

All three authority stages (dean, rector, finance) share the single `authorities` role. There is no per-stage role distinction — the stage sequence is ceremonial rather than a multi-signer authorization chain.

---

## 1. Health Check

```
GET /api/v1/health
```

**Access:** Public (no auth required)  
**Status:** ✅ Implemented  

### Response `200`
```json
{
  "status": "ok",
  "version": "0.1.0",
  "database": "connected"
}
```

---

## 2. Register User

```
POST /api/v1/register
```

**Access:** Public (no auth required)  
**Status:** ✅ Implemented  

Called immediately after Clerk signup to sync the user into the local database.

### Request Body
```json
{
  "clerk_id": "user_xxx",
  "email": "user@example.com",
  "full_name": "Jane Doe"
}
```

### Response `201`
```json
{
  "id": "uuid",
  "clerk_id": "user_xxx",
  "email": "user@example.com",
  "full_name": "Jane Doe",
  "role": null
}
```

---

## 3. List Applications (Ranking)

```
GET /api/v1/applications
```

**Access:** `human_resources`  
**Status:** ✅ Implemented  

### Query Parameters
| Param | Type | Required | Default | Description |
|---|---|---|---|---|
| `page` | int | No | `1` | Page number (1-indexed) |
| `page_size` | int | No | `20` | Items per page (max 100) |
| `faculty` | string | No | — | Filter by faculty |
| `min_score` | float | No | — | Minimum AI score filter |

### Response `200`
```json
{
  "items": [
    {
      "id": "uuid",
      "applicant_id": "uuid",
      "vacancy_id": "uuid",
      "status": "HR_STAGE",
      "ai_score": {
        "total": 78.5,
        "academic_training": 80.0,
        "experience": 75.0,
        "publications": 70.0,
        "profile_match": 85.0,
        "languages_competencies": 80.0,
        "evaluation_summary": "Strong academic background.",
        "grade": "GOOD"
      },
      "status_history": [
        {"status": "RECEIVED", "transitioned_at": "2026-05-21T12:00:00Z"},
        {"status": "PROCESSING_AI", "transitioned_at": "2026-05-21T12:00:05Z"}
      ],
      "created_at": "2026-05-21T12:00:00Z",
      "updated_at": "2026-05-21T12:00:05Z"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 20
}
```

### Response `403`
```json
{"detail": "Role 'applicant' is not authorized for this endpoint."}
```

---

## 4. Get CV Presigned URL

```
GET /api/v1/applications/cv-presigned/{storage_key}
```

**Access:** `human_resources`, `authorities`  
**Status:** ✅ Implemented  

Returns a time-limited presigned URL to download the applicant's CV from Backblaze B2.

---

## 5. Submit Application

```
POST /api/v1/applications/
```

**Access:** `applicant`  
**Content-Type:** `multipart/form-data`  
**Status:** ✅ Implemented  

### Form Data
| Field | Type | Required | Description |
|---|---|---|---|
| `vacancy_id` | UUID | Yes | Target vacancy |
| `cv_file` | File (PDF) | Yes | CV document, max 10 MB |

### Validation
- File must be `application/pdf`
- File size must be ≤ 10 MB
- Both violations return `HTTP 422`

### Response `201`
```json
{
  "id": "uuid",
  "applicant_id": "uuid",
  "vacancy_id": "uuid",
  "status": "RECEIVED",
  "ai_score": null,
  "status_history": [],
  "created_at": "2026-05-21T12:00:00Z",
  "updated_at": "2026-05-21T12:00:00Z"
}
```

### Response `422`
```json
{"detail": "File must be a PDF under 10 MB"}
```
```json
{"detail": "Applicant profile not found"}
```
```json
{"detail": "Vacancy not found or not active"}
```

---

## 6. Create Evaluation (Authority Decision)

```
POST /api/v1/applications/{application_id}/evaluations
```

**Access:** `human_resources`, `authorities`  
**Status:** ✅ Implemented  

### Path Parameters
| Param | Type | Description |
|---|---|---|
| `application_id` | UUID | Application to evaluate |

### Request Body
```json
{
  "decision": "APPROVED",
  "observations": "Candidate meets all requirements."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `decision` | enum | Yes | `APPROVED` or `REJECTED` |
| `observations` | string | No | Reason (required if REJECTED) |

### Validation
- `observations` is required when `decision === REJECTED` (HTTP 422)
- Reviewer role must match current `FlowStatus.required_role()` (HTTP 403)

### Response `201`
```json
{
  "id": "uuid",
  "application_id": "uuid",
  "reviewer_role": "human_resources",
  "decision": "APPROVED",
  "observations": "Candidate meets all requirements.",
  "created_at": "2026-05-21T12:00:00Z"
}
```

### Role Validation
- API layer: JWT role must be `human_resources` or `authorities` → `403` if not
- Domain layer: `WorkflowApprovalService.validate_role_for_status()` checks that the reviewer's role matches the stage's `required_role()`:
  - `HR_STAGE` requires `human_resources`
  - `DEAN_STAGE`, `RECTOR_STAGE`, `FINANCE_STAGE` require `authorities`
  - Mismatch → `403` with `DomainError`

### Response `422`
```json
{"detail": "observations are required when decision is REJECTED"}
```

---

## 7. Get My Application Status (Applicant Portal)

```
GET /api/v1/applicants/me/status
```

**Access:** `applicant`  
**Status:** ✅ Implemented  

### Response `200`
```json
[
  {
    "id": "uuid",
    "applicant_id": "uuid",
    "vacancy_id": "uuid",
    "status": "HR_STAGE",
    "ai_score": {
      "total": 78.5,
      "grade": "GOOD",
      "evaluation_summary": "Strong academic background.",
      "academic_training": 80.0,
      "experience": 75.0,
      "publications": 70.0,
      "profile_match": 85.0,
      "languages_competencies": 80.0
    },
    "status_history": [
      {"status": "RECEIVED", "transitioned_at": "2026-05-21T12:00:00Z"},
      {"status": "PROCESSING_AI", "transitioned_at": "2026-05-21T12:00:05Z"},
      {"status": "HR_STAGE", "transitioned_at": "2026-05-21T12:00:10Z"}
    ],
    "created_at": "2026-05-21T12:00:00Z",
    "updated_at": "2026-05-21T12:00:10Z"
  }
]
```

Returns all applications belonging to the authenticated JWT user. No access to other applicants' data.

---

## 8. Dashboard Stats

```
GET /api/v1/dashboard/stats
```

**Access:** `human_resources`  
**Status:** ✅ Implemented  

### Response `200`
```json
{
  "total_applicants": 42,
  "avg_score": 72.3,
  "in_progress": 15,
  "completed": 3
}
```

| Field | Type | Description |
|---|---|---|
| `total_applicants` | int | Total applications received |
| `avg_score` | float | Average AI score across scored apps (0.0 if none) |
| `in_progress` | int | Count in non-terminal states (not HIRED/REJECTED) |
| `completed` | int | Count in HIRED state |

---

## 9. User Management

### Get Current User

```
GET /api/v1/users/me
```

**Access:** Any authenticated user  
**Status:** ✅ Implemented  

Returns the authenticated user's profile from the local database.

### Set User Role

```
POST /api/v1/users/set-role
```

**Access:** Public (no auth required)  
**Status:** ✅ Implemented  

Sets or updates a user's role in Clerk public metadata and local DB.

### Sync User Role

```
POST /api/v1/users/sync-role
```

**Access:** Public (no auth required)  
**Status:** ✅ Implemented  

Syncs the role from Clerk public metadata to the local DB.

---

## 10. Vacancies

### List Vacancies

```
GET /api/v1/vacancies/
```

**Access:** Public (no auth required)  
**Status:** ✅ Implemented  

### Create Vacancy

```
POST /api/v1/vacancies/
```

**Access:** `human_resources`, `authorities`  
**Status:** ✅ Implemented  

### Delete Vacancy

```
DELETE /api/v1/vacancies/{vacancy_id}
```

**Access:** `human_resources`  
**Status:** ✅ Implemented  

---

## FlowStatus Enum

| Value | Required Role | Description |
|---|---|---|
| `RECEIVED` | — | Initial state after submission |
| `PROCESSING_AI` | — | AI analysis in progress |
| `HR_STAGE` | `human_resources` | HR review and ranking |
| `DEAN_STAGE` | `authorities` | Dean approval |
| `RECTOR_STAGE` | `authorities` | Rector approval |
| `FINANCE_STAGE` | `authorities` | Finance director approval |
| `HIRED` | — | Final state — hired |
| `REJECTED` | — | Final state — rejected at any stage |

All three authority stages (DEAN, RECTOR, FINANCE) share the single `authorities` role. There is no per-stage role enforcement — the same reviewer can approve sequentially through all three stages.

## Error Codes

| Status | Description |
|---|---|
| `401` | Missing or invalid JWT token |
| `403` | Valid JWT but role not authorized |
| `404` | Resource not found |
| `422` | Validation error (invalid input, missing required fields) |
| `500` | Internal server error |

---

*Last updated: 2026-07-10*

---

## 11. WebSocket Notifications (Real-Time Dashboard)

**Endpoint:** `ws://host/ws/socket.io/` (via nginx)  
**Endpoint (direct):** `ws://host:8000/ws/socket.io/`  
**Transport:** Socket.IO v5 (WebSocket upgrade with HTTP long-polling fallback)  
**Status:** ✅ Implemented  

### Authentication

The JWT is sent via the Socket.IO `auth` object on the `connect` event:

```js
const socket = io("ws://host:8000", {
  path: "/ws/socket.io/",
  auth: { token: "eyJhbGci..." }
});
```

The token is validated through the same `ClerkAuthAdapter.verify_token()` used by the REST API. Connections with missing, invalid, or expired tokens are rejected.

**Never pass the token as a query parameter** — query strings are logged by proxies and web servers.

### Roles Allowed

Only `human_resources` and `authorities` roles are permitted to connect. Users with role `applicant` are rejected (the MVP does not include applicant-notifications).

### Rooms (per role)

On successful connection, the client is automatically joined to a room matching its role:

| Role | Room |
|---|---|
| `human_resources` | `"human_resources"` |
| `authorities` | `"authorities"` |

All connected clients in a room receive the same events — there is no per-user filtering.

### Event: `status_change`

Emitted when an application enters a stage that requires dashboard attention.

**Payload:**

```json
{
  "application_id": "550e8400-e29b-41d4-a716-446655440000",
  "new_status": "HR_STAGE",
  "timestamp": "2026-07-10T15:30:00Z"
}
```

| Field | Type | Description |
|---|---|---|
| `application_id` | string (UUID) | The application that changed status |
| `new_status` | string | `FlowStatus` value (`HR_STAGE`, `DEAN_STAGE`, `RECTOR_STAGE`, `FINANCE_STAGE`) |
| `timestamp` | string (ISO 8601) | Server time when the notification was emitted |

**Who receives what:**

| Status Transition | Room | Trigger |
|---|---|---|
| `PROCESSING_AI → HR_STAGE` | `human_resources` | AI scoring preselects the application (score ≥ 60) |
| `HR_STAGE → DEAN_STAGE` | `authorities` | HR approves the application |
| `DEAN_STAGE → RECTOR_STAGE` | `authorities` | Dean approves |
| `RECTOR_STAGE → FINANCE_STAGE` | `authorities` | Rector approves |

### Error Handling

If the WebSocket notification fails to deliver (server disconnected, exception), the failure is **logged and silently ignored**. The underlying database transaction and email notifications are **not affected**.

### Frontend Integration

On receiving `status_change`, the frontend should refetch the application list via `GET /api/v1/applications` to get the complete updated data. The WebSocket event acts as a "doorbell" — it tells you **something changed**, but does not carry the full updated record.

---

*Last updated: 2026-07-05*
