# ADR-005: Clerk for Authentication and Authorization

**Status:** Accepted  
**Date:** 2026-05-15  
**Author:** Erik Herrera — Backend Developer / Software Architect  

## Context

ATS-UCE has 5 user roles (applicant, hr_staff, dean, rector, finance_director) accessing from 3 client types (Web, Electron, React Native). We need a solution that provides:
- JWT-based authentication
- Role management in the token
- Multi-platform SDK support
- Social login (future)

## Decision

We will use **Clerk** as the authentication provider.

### Rationale
1. **publicMetadata** — Roles are embedded in the JWT as `publicMetadata.role`, verified server-side
2. **JWKS verification** — Backend validates tokens using Clerk's JWKS endpoint (no session DB needed)
3. **Multi-platform SDKs** — `@clerk/clerk-react`, `@clerk/clerk-electron`, `@clerk/clerk-expo` for all 3 clients
4. **Free tier** — Sufficient for university deployment scale

### Integration
```python
# backend/app/api/dependencies.py
async def get_current_user(credentials: HTTPAuthorizationCredentials) -> dict:
    token = credentials.credentials
    payload = await verify_clerk_jwt(token)  # JWKS validation
    return {"user_id": payload["sub"], "role": payload["publicMetadata"]["role"], "email": payload["email"]}
```

### Role-to-stage mapping
```python
FlowStatus.HR_STAGE.required_role()        # "hr_staff"
FlowStatus.DEAN_STAGE.required_role()      # "dean"
FlowStatus.RECTOR_STAGE.required_role()    # "rector"
FlowStatus.FINANCE_STAGE.required_role()   # "finance_director"
```

## Consequences

**Positive:**
- No password hashing/storage responsibility
- Social login (Google, Microsoft) available out of the box
- Role changes in Clerk dashboard reflect immediately

**Negative:**
- External dependency — Clerk outage blocks auth
- Rate limits on free tier (may need upgrade for production)
- JWKS caching required for performance

**Mitigation:** JWKS cached with TTL; dev mock available when Clerk keys are not set.

## References

- `backend/app/api/dependencies.py` — `get_current_user()` and `require_role()`
- `backend/app/domain/value_objects/flow_status.py` — `required_role()` method
- Clerk docs: https://clerk.com/docs
