# =============================================================================
# Multi-stage Dockerfile: development | build | production
# =============================================================================
# Uso en docker-compose.yml:
#   target: ${FRONTEND_TARGET:-development}
# =============================================================================

# ─── Stage 1: Base ───────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# ─── Stage 2: Development (Vite dev server) ─────────────────────────────────
FROM base AS development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ─── Stage 3: Build (static production assets) ──────────────────────────────
FROM base AS build
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
RUN npm run build

# ─── Stage 4: Production (static server) ────────────────────────────────────
FROM node:20-alpine AS production
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
