from repositories.rooms_repository import RoomRepository
from typing import Optional


class AdminService:
    def __init__(self, room_repo: Optional[RoomRepository] = None):
        self.room_repo = room_repo or RoomRepository()

    def create_room(self, room_id: str, capacity: int):
        return self.room_repo.add_room(room_id, capacity)

    def edit_room(self, room_id: str, capacity: int):
        return self.room_repo.update_room(room_id, capacity)

    # def remove_room(self, room_id: str):
    #     return self.room_repo.delete_room(room_id)

    def list_rooms(self):
        return self.room_repo.list_rooms()
