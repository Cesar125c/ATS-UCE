# ADR-001: Clean Architecture with Domain-Driven Design

**Status:** Accepted  
**Date:** 2026-05-15  
**Author:** Erik Herrera — Backend Developer / Software Architect  

## Context

The ATS-UCE system requires a modular, testable, and maintainable backend that can evolve across 9 sprints. The team has 4 developers with varying experience levels, so the architecture must provide clear boundaries and conventions that reduce cognitive load.

## Decision

We will implement a Clean Architecture with DDD (Domain-Driven Design) using four layers:

1. **Domain** — Zero external dependencies. Contains entities, value objects, repository interfaces, and domain services. This is the innermost layer.
2. **Application** — Orchestrates use cases. Depends only on Domain. Contains DTOs and use case classes.
3. **Infrastructure** — Implements Domain interfaces. Contains ORM models, repositories, and external adapters (B2, OpenAI, Resend, Clerk).
4. **API (Presentation)** — FastAPI routers and dependency injection. Depends on Application and Infrastructure.

### Dependency rule
Dependencies point inward. Domain never imports from any other layer. Infrastructure implements Domain interfaces (Dependency Inversion Principle).

### Aggregate Root
`Application` is the sole Aggregate Root. All workflow invariants are enforced through its methods (`assign_ai_score`, `advance_flow`, `reject`).

## Consequences

**Positive:**
- Domain logic is fully testable without infrastructure (34 unit tests, 0 external deps)
- Swapping infrastructure (e.g., PostgreSQL → SQLite) requires changing only Infrastructure layer
- Clear SRP: each layer has a single responsibility

**Negative:**
- More boilerplate (mappers, interfaces, DI wiring)
- Steeper learning curve for junior developers

**Mitigation:** We created mappers (`ApplicationMapper`, `EvaluationMapper`) to reduce ORM coupling and documented all patterns in README.

## References

- [Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design — Eric Evans](https://domainlanguage.com/ddd/)
- `backend/app/domain/` — zero external imports verified via `ruff check`
