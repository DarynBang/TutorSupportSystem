from typing import Optional
from backend.repositories.user_repository import UserRepository

class AuthService:
    """
    Simple mocked authentication service.
    In MVP we just look up users by username (name) and return user info.
    """

    def __init__(self, user_repo: Optional[UserRepository] = None):
        self.user_repo = user_repo or UserRepository()

    def login(self, username: str, password: str) -> Optional[dict]:
        """
        Mock login - no real password checks. Returns user dict or None.
        """
        user = self.user_repo.get_by_name(username)
        if not user:
            return None
        return {"id": user.id, "name": user.name, "role": user.role}

    def logout(self, user_id: str) -> bool:
        # For mock, just return True
        return True
