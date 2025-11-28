import json
from typing import List, Optional
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "rooms.json"

class RoomRepository:
    def __init__(self, path="data/rooms.json"):
        self.path = path
        self.rooms = self._load()

    def _load(self) -> List[dict]:
        try:
            with open(self.path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return []

    def _save(self):
        with open(self.path, "w") as f:
            json.dump(self.rooms, f, indent=4)

    def list_rooms(self) -> List[dict]:
        return self.rooms

    def exists(self, room_id: str) -> bool:
        return any(r["room_id"] == room_id for r in self.rooms)

    def get_room(self, room_id: str) -> Optional[dict]:
        for room in self.rooms:
            if room["room_id"] == room_id:
                return room
        return None

    def add_room(self, room_id: str, capacity: int):
        if self.exists(room_id):
            raise ValueError("Room ID already exists")

        new_room = {
            "room_id": room_id,
            "capacity": capacity
        }

        self.rooms.append(new_room)
        self._save()
        return new_room

    def update_room(self, room_id: str, capacity: Optional[int] = None):
        for room in self.rooms:
            if room["room_id"] == room_id:
                if capacity is not None:
                    room["capacity"] = capacity
                self._save()
                return room
        return None