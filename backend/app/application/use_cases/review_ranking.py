"""Use case: Retrieve ranked applications for HR review. Implemented in Sprint 3."""


class ReviewRankingUseCase:
    """Returns paginated, ranked list of applications in HR_STAGE for the dashboard view."""

    async def execute(self, page: int = 1, page_size: int = 20) -> dict:
        raise NotImplementedError("ReviewRankingUseCase — Sprint 3")
