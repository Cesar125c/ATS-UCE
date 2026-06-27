"""Domain-level exceptions. These are raised by domain services and caught at the API layer."""


class DomainError(Exception):
    """Base class for all domain rule violations."""
