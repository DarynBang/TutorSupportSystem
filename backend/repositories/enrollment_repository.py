from typing import List
from repositories.json_utils import load_json, save_json
from models.class_offering import Enrollment
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "enrollments.json"


class EnrollmentRepository:

    def _load(self) -> List[dict]:
        return load_json(DATA_FILE)

    def _save(self, data: List[dict]):
        save_json(DATA_FILE, data)

    def add(self, enrollment: Enrollment) -> Enrollment:
        data = self._load()
        data.append(enrollment.__dict__)
        self._save(data)
        return enrollment

    def get_for_student(self, student_id: str) -> List[Enrollment]:
        return [
            Enrollment(**item)
            for item in self._load()
            if item["student_id"] == student_id
        ]

    def get_for_class(self, class_id: str) -> List[Enrollment]:
        return [
            Enrollment(**item)
            for item in self._load()
            if item["class_id"] == class_id
        ]
