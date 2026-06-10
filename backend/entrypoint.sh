#!/bin/sh
# =============================================================================
# ATS-UCE Backend Entrypoint
# =============================================================================
# 1. Runs pending database migrations (idempotent)
# 2. Executes the uvicorn server with any passed arguments
# =============================================================================

set -e

echo ">>> Running database migrations..."
alembic upgrade head
echo ">>> Migrations complete. Starting server..."

exec "$@"
