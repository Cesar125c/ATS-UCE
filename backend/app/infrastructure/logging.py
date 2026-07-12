import contextvars
import logging
import logging.config
import sys
from datetime import UTC, datetime

from config import get_settings

request_id_var = contextvars.ContextVar("request_id", default="-")


class AppLoggingFilter(logging.Filter):
    """
    Filter to inject default fields into log records to avoid KeyError
    when using the custom structured formatting.
    """

    def filter(self, record):
        if not hasattr(record, "request_id"):
            record.request_id = request_id_var.get("-")
        if not hasattr(record, "usuario_id"):
            record.usuario_id = "-"
        if not hasattr(record, "evento"):
            record.evento = "-"
        if not hasattr(record, "endpoint"):
            record.endpoint = "-"
        if not hasattr(record, "duracion_ms"):
            record.duracion_ms = "-"
        else:
            if isinstance(record.duracion_ms, (int, float)):
                record.duracion_ms = f"{record.duracion_ms:.1f}ms"
        return True


class ISO8601Formatter(logging.Formatter):
    """
    Formatter to output timestamps in YYYY-MM-DDTHH:MM:SS.sssZ format (UTC).
    """

    def __init__(self, fmt=None, datefmt=None, style="%", validate=True):
        super().__init__(fmt=fmt, datefmt=datefmt, style=style, validate=validate)

    def formatTime(self, record, datefmt=None):
        dt = datetime.fromtimestamp(record.created, UTC)
        return dt.strftime("%Y-%m-%dT%H:%M:%S") + f".{int(record.msecs):03d}Z"


def setup_logging():
    """
    Configure global logging settings for the application using dictConfig.
    """
    settings = get_settings()
    log_level = settings.log_level.upper()

    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "filters": {
            "app_filter": {
                "()": AppLoggingFilter,
            }
        },
        "formatters": {
            "standard": {
                "()": ISO8601Formatter,
                "format": (
                    "%(asctime)s | %(levelname)-5s | [%(request_id)s] | "
                    "[%(usuario_id)s] | [%(evento)s] | [%(endpoint)s] | "
                    "%(message)s | %(duracion_ms)s"
                ),
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "stream": sys.stdout,
                "formatter": "standard",
                "filters": ["app_filter"],
            }
        },
        "loggers": {
            # Root logger
            "": {
                "handlers": ["console"],
                "level": log_level,
            },
            # Internal app logger (all logger names starting with 'app.')
            "app": {
                "level": log_level,
                "handlers": ["console"],
                "propagate": False,
            },
            # Alembic logs
            "alembic": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            # SQLAlchemy logs (mute debug/info engine queries)
            "sqlalchemy.engine": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            # Uvicorn generic logs
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            # Uvicorn access logs muted to avoid duplicating custom HTTP request logs.
            "uvicorn.access": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
        },
    }

    logging.config.dictConfig(logging_config)
