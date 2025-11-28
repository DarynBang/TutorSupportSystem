from typing import Optional, List
from services.class_offering_service import ClassOfferingService
from repositories.user_repository import UserRepository
from repositories.rooms_repository import RoomRepository


class CoordinatorService:
    def __init__(self,
                 offering_service: Optional[ClassOfferingService] = None,
                 user_repo: Optional[UserRepository] = None,
                 room_repo: Optional[RoomRepository] = None):
        self.offering_service = offering_service or ClassOfferingService()
        self.user_repo = user_repo or UserRepository()
        self.room_repo = room_repo or RoomRepository()


    # Approve class offering (assigns room if offline)
    def approve_class(self, offering_id: str, room: Optional[str] = None):

        offering = self.offering_service.repo.get(offering_id)
        if not offering:
            raise ValueError("Class offering not found.")

        # If class is offline, room MUST be provided
        if offering.delivery_mode == "offline":
            if not room:
                raise ValueError("Offline classes require a room assignment.")

            # Validate room exists
            room_obj = self.room_repo.get_room(room)
            if not room_obj:
                raise ValueError("Assigned room does not exist.")

            # --- NEW: ROOM CONFLICT CHECK ---
            for other in self.offering_service.repo.list_all():
                if other.id == offering.id:
                    continue
                if other.delivery_mode != "offline":
                    continue
                if other.room != room:
                    continue
                if other.status != "Approved":
                    continue

                if timeslot_overlaps(
                        offering.timeslot.start,
                        offering.timeslot.end,
                        other.timeslot.start,
                        other.timeslot.end
                ):
                    raise ValueError(
                        f"Room '{room}' is already booked for class '{other.id}'."
                    )

        # --- OPTIONAL: TUTOR CONFLICT CHECK ---
        for other in self.offering_service.repo.list_all():
            if other.id == offering.id:
                continue
            if other.tutor_id != offering.tutor_id:
                continue
            if other.status != "Approved":
                continue

            if timeslot_overlaps(
                    offering.timeslot.start,
                    offering.timeslot.end,
                    other.timeslot.start,
                    other.timeslot.end
            ):
                raise ValueError(
                    f"Tutor '{offering.tutor_id}' has another class ('{other.id}') "
                    "that overlaps with this timeslot."
                )

        # If all checks pass → approve
        return self.offering_service.approve_offering(
            class_id=offering_id,
            room=room
        )

    # Reject class offering
    def reject_class(self, offering_id: str, reason: Optional[str] = None):
        if not reason:
            raise ValueError("Rejection requires a reason from the coordinator.")
        return self.offering_service.reject_offering(offering_id, reason)

    # Monitor subject coverage:
    # Count how many classes exist per subject
    def monitor_subject_coverage(self) -> dict:
        offerings = self.offering_service.list_all()

        summary = {}
        for o in offerings:
            summary[o.subject] = summary.get(o.subject, 0) + 1

        return summary


    # View list of all offerings
    def view_class_list(self) -> List[dict]:
        all_offerings = self.offering_service.list_all()
        approved_offerings = [o for o in all_offerings if o.status != "Pending"]
        result = []

        for offering in approved_offerings:
            # Tutor lookup
            tutor = self.user_repo.get_by_id(offering.tutor_id) if offering.tutor_id else None
            tutor_name = getattr(tutor, "name", None) if tutor else None
            tutor_name = tutor_name or "Unknown Tutor"

            # Enrolled students: convert list of ids -> list of { id, name, email }
            enrolled_ids = offering.enrolled_students or []
            enrolled_students = []
            for stu_id in enrolled_ids:
                try:
                    stu_obj = self.user_repo.get_by_id(stu_id)

                except Exception:
                    stu_obj = None

                if stu_obj:
                    enrolled_students.append({
                        "id": stu_id,
                        "name": getattr(stu_obj, "name", None) or stu_id,
                        "email": getattr(stu_obj, "email", None)
                    })
                else:
                    enrolled_students.append({
                        "id": stu_id,
                        "name": "Unknown Student",
                        "email": None
                    })

            # Build enriched class entry (keep original offering fields as-is)
            result.append({
                "id": offering.id,
                "subject": offering.subject,
                "tutor_id": offering.tutor_id,
                "tutor_name": tutor_name,
                "delivery_mode": offering.delivery_mode,
                "room": offering.room,
                "meeting_link": offering.meeting_link,
                "timeslot": offering.timeslot,
                "status": offering.status,
                "enrolled_students": enrolled_students,
                "progress_notes": offering.progress_notes or {},
            })

        return result


    def view_pending_rejected_classes(self) -> List[dict]:
        all_offerings = self.offering_service.list_all()
        result = []

        for offering in all_offerings:
            if offering.status not in ["Pending", "Rejected"]:
                continue

            tutor = self.user_repo.get_by_id(offering.tutor_id)
            tutor_name = tutor.name if tutor else "Unknown Tutor"

            result.append({
                "id": offering.id,
                "subject": offering.subject,
                "tutor_id": offering.tutor_id,
                "tutor_name": tutor_name,
                "delivery_mode": offering.delivery_mode,
                "room": offering.room,
                "capacity": getattr(offering, "capacity", None),
                "timeslot": offering.timeslot,
                "status": offering.status,
                "progress_notes": offering.progress_notes,
            })

        return result

    def get_rooms(self):
        return self.room_repo.list_rooms()

def timeslot_overlaps(start1, end1, start2, end2):
    return start1 < end2 and start2 < end1
