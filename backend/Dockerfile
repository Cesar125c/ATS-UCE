FROM python:3.12-slim

WORKDIR /app

# Install system dependencies needed for asyncpg and other native extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency spec first for layer caching
COPY pyproject.toml ./

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -e .

# Copy the rest of the source
COPY . .

# Make entrypoint executable and create non-root user
RUN chmod +x entrypoint.sh \
    && adduser --disabled-password --gecos '' appuser

# Switch to non-root user
USER appuser

# Health check — validates DB connectivity via the existing /api/v1/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python3 -c "import httpx; httpx.get('http://localhost:8000/api/v1/health').raise_for_status()"

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
