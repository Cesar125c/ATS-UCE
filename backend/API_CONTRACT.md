# ATS-UCE API Contract

**Base URL (dev):** `http://localhost:8000/api/v1`
**Auth header:** `Authorization: Bearer <clerk_jwt_token>`
**Content-Type:** `application/json` (except file upload: `multipart/form-data`)

## Endpoints

| Method | Path | Auth | Role | Body | Response | Sprint |
|--------|------|------|------|------|----------|--------|
| GET | /health | No | Public | — | `{"status","version","database"}` | S3 ✅ |
| POST | /users/set-role | No | Public | SetRoleRequest | SetRoleResponse | S3 ✅ |
| POST | /applications | JWT | applicant | multipart: vacancy_id+cv_file | ApplicationResponse 201 | S4 |
| GET | /applications | JWT | hr_staff | ?page&page_size&faculty&min_score | ApplicationListResponse | S5 |
| GET | /applications/pending-count | JWT | authority | — | PendingCountResponse | S6 |
| GET | /applications/{id} | JWT | hr_staff,authority | — | ApplicationResponse | S5 |
| POST | /applications/{id}/evaluations | JWT | hr_staff,authority | EvaluationRequest | EvaluationResponse 201 | S5 |
| GET | /applicants/me/status | JWT | applicant | — | list[ApplicationResponse] | S7 |
| GET | /dashboard/stats | JWT | hr_staff | — | DashboardStatsResponse | S5 |

## Role values (Clerk `publicMetadata.role`)

```
"applicant" | "hr_staff" | "authority"
```

## FlowStatus values

```
RECEIVED | PROCESSING_AI | HR_STAGE | DEAN_STAGE | RECTOR_STAGE | FINANCE_STAGE | HIRED | REJECTED
```

## AIScoreDTO fields

| Field | Type | Range |
|-------|------|-------|
| total | float | 0–100 |
| academic_training | float | 0–100 |
| experience | float | 0–100 |
| publications | float | 0–100 |
| profile_match | float | 0–100 |
| languages_competencies | float | 0–100 |
| evaluation_summary | str | max 200 chars |
| grade | str | EXCELLENT / GOOD / ACCEPTABLE / INSUFFICIENT |

## Error format

| Code | Body |
|------|------|
| 422 | `{"detail": [{"loc": [...], "msg": "...", "type": "..."}]}` |
| 401 | `{"detail": "Invalid or expired token"}` |
| 403 | `{"detail": "Role '...' not authorized."}` |
| 404 | `{"detail": "Application not found"}` |
| 429 | `{"detail": "Rate limit exceeded"}` + `Retry-After` header |
