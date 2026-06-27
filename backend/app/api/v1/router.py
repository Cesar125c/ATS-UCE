"""Master v1 router. Aggregates all sub-routers with their prefixes and tags."""

from fastapi import APIRouter

from app.api.v1 import applicants, applications, auth, dashboard, evaluations, health, users, vacancies

router = APIRouter(prefix="/api/v1")
router.include_router(health.router, prefix="", tags=["Health"])
router.include_router(auth.router, prefix="", tags=["Auth"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(applications.router, prefix="/applications", tags=["Applications"])
router.include_router(applicants.router, prefix="/applicants", tags=["Applicants"])
router.include_router(evaluations.router, prefix="", tags=["Evaluations"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
router.include_router(vacancies.router, prefix="/vacancies", tags=["Vacancies"])
