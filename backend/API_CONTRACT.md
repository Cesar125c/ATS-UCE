# ATS-UCE API Contract — Authentication Sprint

Base URL (dev): http://localhost:8000/api/v1
Auth header: Authorization: Bearer \<clerk_jwt_token\>

## Implemented endpoints (this sprint)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /health | No | Public | System health + DB check |
| POST | /auth/register | No | Public | Register user after Clerk signup |
| GET | /users/me | JWT | Any | Get authenticated user profile |

## Stub endpoints (future sprints — return 501)

| Method | Path | Sprint |
|--------|------|--------|
| POST | /applications | Sprint 4 |
| GET  | /applications | Sprint 5 |
| GET  | /applications/{id} | Sprint 5 |
| GET  | /applications/pending-count | Sprint 6 |
| POST | /applications/{id}/evaluations | Sprint 5 |
| GET  | /applicants/me/status | Sprint 7 |
| GET  | /dashboard/stats | Sprint 5 |

## Role values (Clerk publicMetadata.role)

"applicant" | "human_resources" | "authorities"

## Email rules

- applicant → any valid email
- human_resources → must end in @uce.edu.ec
- authorities → must end in @uce.edu.ec

## POST /auth/register

Body:
```json
{
  "clerk_user_id": "user_xxx",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@uce.edu.ec",
  "role": "human_resources"
}
```

Success (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "user_id": "uuid",
  "role": "human_resources"
}
```

Errors:

- 422 → invalid role or email domain mismatch
- 409 → clerk_user_id already registered

## GET /users/me

Requires: Authorization: Bearer \<token\>

Response:
```json
{
  "id": "uuid",
  "email": "...",
  "first_name": "...",
  "last_name": "...",
  "role": "...",
  "is_active": true
}
```

## Error format (all endpoints)

- 401 → {"detail": "Invalid or expired token"}
- 403 → {"detail": "Role 'X' not authorized."}
- 403 → {"detail": "Account is deactivated."}
- 422 → {"detail": [{"loc": [...], "msg": "...", "type": "..."}]}
- 409 → {"detail": "User already registered."}
