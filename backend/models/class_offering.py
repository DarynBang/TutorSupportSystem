from dataclasses import dataclass
from typing import Optional, List, Literal, Dict

DeliveryMode = Literal["online", "offline"]
ClassStatus = Literal["Pending", "Approved", "Rejected"]

@dataclass
class TimeSlot:
    start: str
    end: str

@dataclass
class ClassOffering:
    id: str
    subject: str
    tutor_id: str
    timeslot: TimeSlot
    delivery_mode: DeliveryMode          # online or offline

    # For offline classes – assigned by Coordinator
    room: Optional[str] = None           # If offline, e.g., "B4-303"
    meeting_link: Optional[str] = None  # If online, could be Google Meeting or Zoom
    capacity: Optional[int] = None       # room_capacity defined by Dept Chair

    status: ClassStatus = "Pending"      # Requires coordinator Approval
    progress_notes: Dict[str, str] = None

    enrolled_students: List[str] = None


@dataclass
class Enrollment:
    student_id: str
    class_id: str
    tutor_id: str
    enrollment_status: str
