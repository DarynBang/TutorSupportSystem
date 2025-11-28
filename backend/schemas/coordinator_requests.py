from pydantic import BaseModel
from typing import Optional
from models.class_offering import TimeSlot

class ApproveRequest(BaseModel):
    offering_id: str
    room: Optional[str] = None

class RejectRequest(BaseModel):
    offering_id: str
    reason: Optional[str] = None

class ModifyClassRequest(BaseModel):
    offering_id: str
    room: Optional[str] = None
    # capacity: Optional[int] = None
    # timeslot: Optional[TimeSlot] = None
