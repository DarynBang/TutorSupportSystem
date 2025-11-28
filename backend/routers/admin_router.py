from fastapi import APIRouter
from pydantic import BaseModel
from services.admin_service import AdminService

router = APIRouter(tags=["Admin"])


admin_service = AdminService()

class RoomCreateRequest(BaseModel):
    room_id: str
    capacity: int

class RoomUpdateRequest(BaseModel):
    capacity: int

@router.get("/rooms")
def list_rooms():
    return admin_service.list_rooms()

@router.post("/rooms")
def create_room(request: RoomCreateRequest):
    return admin_service.create_room(request.room_id, request.capacity)

@router.put("/rooms/{room_id}")
def update_room(room_id: str, request: RoomUpdateRequest):
    updated = admin_service.edit_room(room_id, request.capacity)
    if not updated:
        return {"error": "Room not found"}
    return updated

# @router.delete("/rooms/{room_id}")
# def delete_room(room_id: str):
#     success = admin_service.remove_room(room_id)
#     return {"deleted": success}
