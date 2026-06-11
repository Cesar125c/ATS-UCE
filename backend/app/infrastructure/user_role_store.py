_roles: dict[str, str] = {}


def set_role(clerk_user_id: str, role: str) -> None:
    _roles[clerk_user_id] = role


def get_role(clerk_user_id: str) -> str | None:
    return _roles.get(clerk_user_id)
