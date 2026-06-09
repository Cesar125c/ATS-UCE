# Authentication Flow — JWT + Clerk + RBAC

## Multi-Client Auth Flow

```mermaid
sequenceDiagram
    participant User
    participant Web as Web (React)
    participant Electron as Electron App
    participant Mobile as React Native
    participant Clerk as Clerk Auth
    participant Backend as FastAPI Backend
    
    Note over User,Mobile: 1. LOGIN
    
    User->>Web: Click "Sign In"
    User->>Electron: Click "Sign In"
    User->>Mobile: Tap "Sign In"
    
    Web->>Clerk: <ClerkProvider> renders <SignIn />
    Electron->>Clerk: Clerk SDK opens sign-in modal
    Mobile->>Clerk: Clerk Expo renders sign-in screen
    
    User->>Clerk: Enter credentials / Social login
    Clerk-->>Web: JWT token + publicMetadata.role
    Clerk-->>Electron: JWT token + publicMetadata.role
    Clerk-->>Mobile: JWT token + publicMetadata.role
    
    Note over Web,Mobile: 2. API REQUEST
    
    Web->>Backend: GET /api/v1/applications<br/>Authorization: Bearer <JWT>
    Electron->>Backend: GET /api/v1/applications<br/>Authorization: Bearer <JWT>
    Mobile->>Backend: GET /api/v1/applications<br/>Authorization: Bearer <JWT>
    
    Note over Backend: 3. TOKEN VERIFICATION
    
    Backend->>Backend: Extract JWT from Authorization header
    Backend->>Clerk: Fetch JWKS (cached, TTL 1h)
    Backend->>Backend: Verify token signature & expiry
    Backend->>Backend: Extract user_id, role, email from payload
    
    alt Invalid / Expired Token
        Backend-->>Web: HTTP 401 Unauthorized
        Web->>Clerk: Redirect to /login
    else Valid Token
        Note over Backend: 4. RBAC CHECK
        
        alt Role matches endpoint requirement
            Backend-->>Web: HTTP 200 (resource data)
        else Role mismatch
            Backend-->>Web: HTTP 403 Forbidden
        end
    end
```

## Client-Specific Authentication

```mermaid
flowchart TD
    A[User arrives] --> B{Which client?}
    
    B -->|Web Browser| C[React App with @clerk/clerk-react]
    B -->|Desktop| D[Electron App with @clerk/clerk-electron]
    B -->|Mobile| E[React Native with @clerk/clerk-expo]
    
    C --> F[<ClerkProvider> wraps app]
    D --> G[Clerk SDK handles proxy]
    E --> H[Clerk Expo handles native]
    
    F --> I[User signs in via Clerk Hosted UI]
    G --> I
    H --> I
    
    I --> J[JWT stored in client session]
    J --> K[Axios interceptor adds<br/>Authorization: Bearer <JWT>]
    
    K --> L[Backend verifies JWT via JWKS]
    L --> M{publicMetadata.role?}
    
    M -->|applicant| N[Can only access /applicants/me/status<br/>POST /applications]
    M -->|hr_staff| O[Can access GET /applications<br/>POST /evaluations (HR_STAGE)<br/>GET /dashboard/stats]
    M -->|dean| P[Can access POST /evaluations (DEAN_STAGE)<br/>GET /applications/pending-count]
    M -->|rector| Q[Can access POST /evaluations (RECTOR_STAGE)<br/>GET /applications/pending-count]
    M -->|finance_director| R[Can access POST /evaluations (FINANCE_STAGE)<br/>GET /applications/pending-count]
    
    N --> S[Response or 403]
    O --> S
    P --> S
    Q --> S
    R --> S
```

## Role-to-Stage Mapping

```mermaid
flowchart LR
    subgraph Flow["Application Flow"]
        RECEIVED --> PROCESSING_AI
        PROCESSING_AI --> HR_STAGE
        HR_STAGE --> DEAN_STAGE
        DEAN_STAGE --> RECTOR_STAGE
        RECTOR_STAGE --> FINANCE_STAGE
        FINANCE_STAGE --> HIRED
        HR_STAGE -->|Rejected| REJECTED
        DEAN_STAGE -->|Rejected| REJECTED
        RECTOR_STAGE -->|Rejected| REJECTED
        FINANCE_STAGE -->|Rejected| REJECTED
    end
    
    subgraph Roles["Clerk publicMetadata.role"]
        R1[hr_staff]
        R2[dean]
        R3[rector]
        R4[finance_director]
    end
    
    HR_STAGE -->|required_role| R1
    DEAN_STAGE -->|required_role| R2
    RECTOR_STAGE -->|required_role| R3
    FINANCE_STAGE -->|required_role| R4
```

## JWT Payload Structure

```json
{
  "sub": "user_2abc123def456",
  "email": "professor@uce.edu.ec",
  "publicMetadata": {
    "role": "dean"
  },
  "iat": 1716288000,
  "exp": 1716374400
}
```

## Backend Verification Flow

```python
# Pseudocode for Clerk JWT verification (Sprint 3 implementation)
async def verify_clerk_jwt(token: str) -> dict:
    jwks = await get_jwks()                  # Cached from Clerk JWKS endpoint
    header = decode_jwt_header(token)         # Extract kid, alg
    signing_key = jwks[header["kid"]]         # Match key ID
    payload = decode_and_verify(token, signing_key, algorithms=["RS256"])
    
    if payload["exp"] < time.time():
        raise HTTPException(401, "Token expired")
    
    return {
        "user_id": payload["sub"],
        "role": payload["publicMetadata"]["role"],
        "email": payload["email"],
    }
```

*Last updated: 2026-06-01*
