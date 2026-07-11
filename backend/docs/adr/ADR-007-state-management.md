# ADR-007: State Management — Local State + TanStack Query (no Zustand)

**Status:** Accepted  
**Date:** 2026-07-10  

## Context

The frontend manages 3 kinds of state:
- **Server state** — postulantes, vacantes, stats (fetched from API)
- **Auth state** — user, roles, session
- **UI/ephemeral state** — search inputs, modals, pagination, active filters

After implementing debounced search across 3 components (Filters, VacancyFilters, TopNavbar), we evaluated whether a global store like Zustand was needed to manage search state across pages.

## Decision

We will **not** use Zustand or any global state library. The existing stack already covers all state categories:

| Category | Tool | Why |
|---|---|---|
| Server state | TanStack Query | Caching, deduplication, invalidation, loading/error states built-in |
| Auth | Clerk React SDK | Provider-based, already handles session, JWT, role metadata |
| UI/ephemeral | `useState` + `useDebounce` hook | Scoped per page, no cross-component sharing needed |

### Rationale

1. **Search is local per page** — Candidates search, HR search, and Vacancy search are independent. Putting them in a global store adds indirection without benefit.
2. **No cross-page state** — Users don't keep a search term when navigating from Candidates to Administrator. No shared state exists.
3. **useDebounce hook** covers the only non-trivial UI state requirement (debounced input) in 12 lines with zero dependencies.
4. **YAGNI** — Adding Zustand before there's a concrete need for cross-component state is premature optimization.

### When we WOULD adopt Zustand

- A shared "candidate selection cart" that persists across pages (e.g., select applicants in Candidates, review in a separate page)
- Theme system (dark/light mode toggled from anywhere)
- Real-time global notifications state

None of these exist today.

## Consequences

**Positive:**
- Zero extra dependencies
- Search is testable in isolation per page
- State lifetime matches component lifetime (auto-cleanup on unmount)
- Simpler mental model for new developers

**Negative:**
- If cross-component state is needed later, migration requires refactoring
- No devtools for inspectable global state (Redux DevTools for Zustand)

## References

- `frontend/src/hooks/useDebounce.ts` — debounced value hook
- `frontend/src/pages/Candidates.tsx` — local search state with useDebounce
- `frontend/src/pages/HumanResources.tsx` — same pattern
- `frontend/src/pages/Administrator.tsx` — same pattern for vacancy search
