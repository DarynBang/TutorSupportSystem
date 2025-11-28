from typing import List, Optional
from repositories.class_offering_repository import ClassOfferingRepository
from models.class_offering import ClassOffering, TimeSlot


class ClassOfferingService:
    def __init__(self, repository: Optional[ClassOfferingRepository] = None):
        self.repo = repository or ClassOfferingRepository()

    # Tutor creates class offering (subject, time, mode, etc.)
    def create_offering(self, offering: ClassOffering):
        # Load all existing classes
        data = self.list_all()

        if isinstance(offering.timeslot, dict):
            try:
                print("-Tutor Creating Offering- Timeslot is a Dictionary")
                offering.timeslot = TimeSlot(**offering.timeslot)
                print("-Tutor Creating Offering- Converted Timeslot to TimeSlot Object.")
            except TypeError as e:
                # Handle case where the dict keys don't match TimeSlot fields
                raise ValueError(f"Invalid keys in timeslot dictionary: {e}")

        # Get max ID
        max_id = 0
        for cls in data:
            cls_num = int(cls.id.split("-")[1])
            if cls_num > max_id:
                max_id = cls_num
        # Assign next ID
        offering.id = f"cls-{str(max_id + 1).zfill(3)}"
        offering.status = "Pending"
        offering.enrolled_students = []
        offering.room = None
        offering.meeting_link = None
        return self.repo.save(offering)


    # Coordinator approves or rejects offering
    def approve_offering(self, class_id: str, room: Optional[str] = None):
        offering = self.repo.get(class_id)
        offering.status = "Approved"

        # If offline, coordinator assigns room
        if offering.delivery_mode == "offline":
            offering.room = room

        self.repo.save(offering)
        return offering


    def reject_offering(self, class_id: str, reason: str):
        offering = self.repo.get(class_id)
        offering.status = "Rejected"

        # optionally store reason in a metadata field
        self.repo.save(offering)
        return offering


    # List approved / pending / all offerings
    def list_approved(self) -> List[ClassOffering]:
        return [o for o in self.repo.list_all() if o.status == "Approved"]

    def list_pending(self) -> List[ClassOffering]:
        return [o for o in self.repo.list_all() if o.status == "Pending"]

    def list_all(self) -> List[ClassOffering]:
        return self.repo.list_all()


    # Enrollment handling (StudentService)
    def add_student(self, class_id: str, student_id: str):
        offering = self.repo.get(class_id)

        if offering.status != "Approved":
            raise ValueError("Cannot join an unapproved class.")

        # if student_id not in offering.enrolled_students:
        #     if len(offering.enrolled_students) >= offering.capacity:
        #         raise ValueError("Class is full.")

        offering.enrolled_students.append(student_id)

        self.repo.save(offering)
        return offering

    def remove_student(self, class_id: str, student_id: str):
        offering = self.repo.get(class_id)
        if not offering:
            raise ValueError(f"Class {class_id} not found")

        if student_id not in offering.enrolled_students:
            raise ValueError(f"Student {student_id} is not enrolled in class {class_id}")

        offering.enrolled_students.remove(student_id)
        self.repo.save(offering)
        return offering

    def get_by_id(self, class_id: str):
        return self.repo.get(class_id)

    # Progress and reports (TutorService)
    def record_progress(self, class_id: str, student_id: str, notes: str):
        offering = self.repo.get(class_id)

        # assume offering.progress_notes is dict[str, str]
        offering.progress_notes[student_id] = notes

        self.repo.save(offering)
        return offering
