from typing import Optional, List
from repositories.json_utils import load_json
from models.user import User
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "users.json"


class UserRepository:

    def _load(self) -> List[dict]:
        return load_json(DATA_FILE)

    def get_all(self) -> List[User]:
        return [User(**x) for x in self._load()]

    def get_by_id(self, user_id: str) -> Optional[User]:
        for item in self._load():
            if item["id"] == user_id:
                return User(**item)
        return None

    def get_by_name(self, username: str) -> Optional[User]:
        for item in self._load():
            if item["name"] == username:
                return User(**item)
        return None
