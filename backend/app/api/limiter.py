from slowapi import Limiter

from app.api.dependencies import rate_limit_key

limiter = Limiter(key_func=rate_limit_key, default_limits=["200/minute"])
