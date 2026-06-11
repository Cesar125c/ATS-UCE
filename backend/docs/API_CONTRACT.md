# API Contract — ATS-UCE Backend

**Version:** 0.1.0  
**Base URL:** `/api/v1`  
**Protocol:** HTTP/1.1 + REST  
**Authentication:** Bearer JWT (Clerk)  

---

## 1. Health Check

```
GET /api/v1/health
```

**Access:** Public (no auth required)  
**Sprint:** 1 ✅ Implemented  

### Response `200`
```json
{
  "status": "ok",
  "version": "0.1.0",
  "database": "connected"
}
```

---

## 2. List Applications (Ranking)

```
GET /api/v1/applications
```

**Access:** `hr_staff`  
**Sprint:** 3 🔲  

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

## 3. Get Pending Count

```
GET /api/v1/applications/pending-count
```

**Access:** `dean`, `rector`, `finance_director`  
**Sprint:** 3 🔲  

### Response `200`
```json
{
  "count": 5
}
```

⚠️ This route MUST be declared before `GET /{id}` to prevent FastAPI from matching the literal string `pending-count` as a UUID.

---

## 4. Get Application by ID

```
GET /api/v1/applications/{id}
```

**Access:** `hr_staff`, `dean`, `rector`, `finance_director`  
**Sprint:** 3 🔲  

### Path Parameters
| Param | Type | Description |
|---|---|---|
| `id` | UUID | Application ID |

### Response `200`
Same schema as application item in List response.

### Response `404`
```json
{"detail": "Application not found"}
```

---

## 5. Submit Application

```
POST /api/v1/applications/
```

**Access:** `applicant`  
**Content-Type:** `multipart/form-data`  
**Sprint:** 2 🔲 (stub endpoint ready)  

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

**Access:** `hr_staff`, `dean`, `rector`, `finance_director`  
**Sprint:** 3 🔲  

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
  "reviewer_role": "hr_staff",
  "decision": "APPROVED",
  "observations": "Candidate meets all requirements.",
  "created_at": "2026-05-21T12:00:00Z"
}
```

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
**Sprint:** 3 🔲  

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

**Access:** `hr_staff`  
**Sprint:** 3 🔲  

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

## FlowStatus Enum

| Value | Required Role | Description |
|---|---|---|
| `RECEIVED` | — | Initial state after submission |
| `PROCESSING_AI` | — | AI analysis in progress |
| `HR_STAGE` | `hr_staff` | HR review and ranking |
| `DEAN_STAGE` | `dean` | Dean approval |
| `RECTOR_STAGE` | `rector` | Rector approval |
| `FINANCE_STAGE` | `finance_director` | Finance director approval |
| `HIRED` | — | Final state — hired |
| `REJECTED` | — | Final state — rejected at any stage |

## Error Codes

| Status | Description |
|---|---|
| `401` | Missing or invalid JWT token |
| `403` | Valid JWT but role not authorized |
| `404` | Resource not found |
| `422` | Validation error (invalid input, missing required fields) |
| `429` | Rate limit exceeded (Sprint 7) |
| `500` | Internal server error |
| `501` | Endpoint not yet implemented |

---

*Last updated: 2026-06-01*
