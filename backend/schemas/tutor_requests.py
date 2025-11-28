from pydantic import BaseModel
from typing import Optional
from models.class_offering import TimeSlot

class OpenClassOfferingRequest(BaseModel):
    id: Optional[str] = None  # Optional and generated in Backend
    tutor_id: str
    subject: str
    delivery_mode: str   # "online" or "offline"
    meeting_link: Optional[str] = None
    room: Optional[str] = None
    timeslot: TimeSlot


class ProgressRequest(BaseModel):
    class_id: str
    student_id: str
    notes: str
