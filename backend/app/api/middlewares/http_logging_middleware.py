import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.infrastructure.logging import request_id_var


logger = logging.getLogger(__name__)


class HttpLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        method = request.method
        path = request.url.path

        try:
            response = await call_next(request)
        except Exception:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.exception(
                "HTTP request failed method=%s path=%s",
                method,
                path,
                extra={
                    "request_id": request_id_var.get("-"),
                    "evento": "http_request_failed",
                    "endpoint": f"{method} {path}",
                    "duracion_ms": duration_ms,
                    "method": method,
                    "path": path,
                },
            )
            raise

        duration_ms = (time.perf_counter() - start_time) * 1000
        status_code = response.status_code
        log_level = logging.INFO
        if status_code >= 500:
            log_level = logging.ERROR
        elif status_code >= 400:
            log_level = logging.WARNING

        logger.log(
            log_level,
            "HTTP request completed method=%s path=%s status_code=%s",
            method,
            path,
            status_code,
            extra={
                "request_id": request_id_var.get("-"),
                "evento": "http_request_completed",
                "endpoint": f"{method} {path}",
                "duracion_ms": duration_ms,
                "method": method,
                "path": path,
                "status_code": status_code,
            },
        )
        return response
