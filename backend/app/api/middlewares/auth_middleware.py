"""Auth middleware placeholder. JWT verification handled in dependencies.py for Sprint 1."""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class AuthMiddleware(BaseHTTPMiddleware):
    """Placeholder auth middleware — JWT enforcement implemented in Sprint 2 via Clerk."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        return response
