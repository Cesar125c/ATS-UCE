import re
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.infrastructure.logging import request_id_var

REQUEST_ID_PATTERN = re.compile(r"^[A-Za-z0-9_.-]{1,64}$")


def _generate_request_id() -> str:
    return f"req_{uuid.uuid4().hex[:12]}"


def _is_valid_request_id(request_id: str | None) -> bool:
    return bool(request_id and REQUEST_ID_PATTERN.fullmatch(request_id))


class RequestIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware to assign a unique request ID (X-Request-ID) to each HTTP request.
    Stores the value in a contextvars.ContextVar for async-safe traceability.
    """

    async def dispatch(self, request: Request, call_next):
        # Retrieve client-provided request ID or generate a new one
        request_id = request.headers.get("X-Request-ID")
        if not _is_valid_request_id(request_id):
            request_id = _generate_request_id()

        # Set ContextVar value
        token = request_id_var.set(request_id)
        try:
            response = await call_next(request)
            # Inject request ID in the response headers
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            # Always reset context to prevent leaks
            request_id_var.reset(token)
