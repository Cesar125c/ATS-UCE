# ADR-008: Deployment Architecture — Docker Compose on EC2 (no JAMstack)

**Status:** Accepted  
**Date:** 2026-07-10  

## Context

The project currently deploys to AWS EC2 with Docker Compose:

- 1 EC2 instance
- 4 containers: `nginx` (proxy), `frontend` (Vite build served by `serve`), `api` (FastAPI + uvicorn), `postgres`
- CI/CD via GitHub Actions: push to `qa`/`main` → SSH → `docker compose up -d`
- Frontend and backend are co-located behind Nginx at the same origin

We evaluated migrating to a JAMstack architecture: frontend deployed to a CDN (Vercel, Cloudflare Pages, S3+CloudFront) and backend deployed independently (Railway, Fly.io, or serverless).

## Decision

We will **keep the current Docker Compose + EC2 architecture** and NOT migrate to JAMstack.

### Rationale

1. **No scaling problem** — The university deployment serves thousands of applicants, not millions. A single EC2 instance handles the load. Premature separation adds complexity without payoff.

2. **Single deploy = simpler** — One `docker compose up -d` deploys everything. With JAMstack you maintain 2 pipelines, 2 environments, and coordinate version compatibility between frontend/backend APIs.

3. **Nginx co-location eliminates CORS** — Frontend calls `/api/` at the same origin. No CORS headers, no preflight requests, no staging/prod API URL mismatches.

4. **Docker Compose is already CI/CD** — GitHub Actions workflows for `qa` and `main` are 70 lines each and have been stable. Adding Vercel/Cloudflare would require new secrets, new providers, new failure modes.

5. **Cost** — Current EC2 is ~$15-30/month. Adding a CDN + separate backend host would cost the same or more, not less.

### When we WOULD migrate to JAMstack

- Traffic grows beyond what a single EC2 can handle (thousands of concurrent users)
- Frontend team needs independent deploy velocity (no coordination with backend deploys)
- CDN edge caching becomes necessary for global performance
- Backend is refactored to serverless functions

None of these conditions are met today.

## Consequences

**Positive:**
- Single deploy command — no coordination between frontend/backend versions
- No CORS configuration needed
- Lower operational complexity
- Existing CI/CD unchanged
- Network latency between frontend and backend is negligible (same host)

**Negative:**
- Cannot scale frontend independently from backend
- No CDN edge caching — static assets come from EC2, not a global CDN
- Server hosts both frontend and backend — a single point of failure

## References

- `.github/workflows/deploy-qa.yml` — QA deploy pipeline
- `.github/workflows/deploy-production.yml` — Production deploy pipeline
- `docker-compose.yml` — Service topology
- `nginx/nginx.conf` — Reverse proxy configuration
- `frontend/Dockerfile` — Multi-stage build with dev + production targets
