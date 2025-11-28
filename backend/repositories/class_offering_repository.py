from typing import List, Optional
from repositories.json_utils import load_json, save_json
from models.class_offering import ClassOffering, TimeSlot
from pathlib import Path

# Path to json files
DATA_FILE = Path(__file__).parent.parent / "data" / "class_offerings.json"


class ClassOfferingRepository:
    """
    Repository for handling ClassOffering persistence in JSON.
    Supports:
    - save (create/update)
    - get by ID
    - list all
    - list approved / pending / rejected
    """
    # Internal helpers
    def _load(self) -> List[dict]:
        return load_json(DATA_FILE)

    def _save(self, data: List[dict]):
        save_json(DATA_FILE, data)


    # Public API
    def save(self, offering: ClassOffering) -> ClassOffering:
        """
        Create or update a ClassOffering.
        If an offering with the same ID exists, it is replaced.
        """
        data = self._load()
        offering_dict = self._class_to_dict(offering)

        replaced = False
        for idx, item in enumerate(data):
            if item["id"] == offering.id:
                data[idx] = offering_dict
                replaced = True
                break

        if not replaced:
            data.append(offering_dict)

        self._save(data)
        return offering

    def get(self, offering_id: str) -> Optional[ClassOffering]:
        data = self._load()
        for item in data:
            if item["id"] == offering_id:
                return self._dict_to_class(item)
        return None

    def list_all(self) -> List[ClassOffering]:
        return [self._dict_to_class(x) for x in self._load()]


    # Convenient filters --------------------------
    def list_approved(self) -> List[ClassOffering]:
        return [
            self._dict_to_class(x)
            for x in self._load()
            if x.get("status") == "approved"
        ]

    def list_pending(self) -> List[ClassOffering]:
        return [
            self._dict_to_class(x)
            for x in self._load()
            if x.get("status") == "pending"
        ]

    # Enrollment helpers ---------------------------
    def add_student(self, class_id: str, student_id: str):
        offering = self.get(class_id)
        if not offering:
            raise ValueError("Class offering not found.")

        if student_id not in offering.enrolled_students:
            offering.enrolled_students.append(student_id)

        self.save(offering)
        return offering

    def remove_student(self, class_id: str, student_id: str):
        offering = self.get(class_id)
        if not offering:
            raise ValueError("Class offering not found.")

        if student_id in offering.enrolled_students:
            offering.enrolled_students.remove(student_id)

        self.save(offering)
        return offering

    def get_progress_notes_all(self) -> List[dict]:
        """Return all progress notes across all classes."""
        result = []
        data = self._load()

        for cls in data:
            # This still gets 'None' if the key exists and its value is None
            notes = cls.get("progress_notes", {})

            # Explicitly set notes to an empty dict if it was None
            if notes is None:
                notes = {}

                # Now notes is guaranteed to be a dict (empty or full)
            for timestamp, content in notes.items():
                result.append({
                    "class_id": cls["id"],
                    "tutor_id": cls["tutor_id"],
                    "timestamp": timestamp,
                    "content": content
                })
        return result


    # Conversion Utilities
    def _class_to_dict(self, offering: ClassOffering) -> dict:
        """Convert model → JSON dict (full, including new fields)."""
        return {
            "id": offering.id,
            "subject": offering.subject,
            "tutor_id": offering.tutor_id,

            "delivery_mode": offering.delivery_mode,
            "meeting_link": offering.meeting_link,
            "room": offering.room,

            "timeslot": {
                "start": offering.timeslot.start,
                "end": offering.timeslot.end,
            },

            "status": offering.status,

            "enrolled_students": offering.enrolled_students,

            "progress_notes": offering.progress_notes,
        }

    def _dict_to_class(self, data: dict) -> ClassOffering:
        """Convert JSON dict → model."""
        return ClassOffering(
            id=data["id"],
            subject=data["subject"],
            tutor_id=data["tutor_id"],

            delivery_mode=data["delivery_mode"],
            meeting_link=data.get("meeting_link"),
            room=data.get("room"),

            timeslot=TimeSlot(
                start=data["timeslot"]["start"],
                end=data["timeslot"]["end"],
            ),

            status=data["status"],

            enrolled_students=data.get("enrolled_students", []),

            progress_notes=data.get("progress_notes", {}),
        )
