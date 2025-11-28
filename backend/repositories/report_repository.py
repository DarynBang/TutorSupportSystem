import uuid
from typing import List
from models.report import Report
from repositories.json_utils import load_json, save_json
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "reports.json"

class ReportRepository:

    def _load(self) -> List[dict]:
        return load_json(DATA_FILE)

    def _save(self, data: List[dict]):
        save_json(DATA_FILE, data)

    def create(self, report: Report) -> Report:
        data = self._load()
        item = report.model_dump()
        item["report_id"] = str(uuid.uuid4())
        data.append(item)
        self._save(data)
        return Report(**item)

    def update(self, report_id: str, content: str) -> Report:
        data = self._load()
        for item in data:
            if item["report_id"] == report_id:
                item["content"] = content
                self._save(data)
                return Report(**item)
        raise ValueError("Report not found")

    def get_by_student(self, student_id: str) -> List[Report]:
        return [Report(**item) for item in self._load() if item.get("student_id") == student_id]


    def get_by_tutor(self, tutor_id: str) -> List[Report]:
        return [Report(**item) for item in self._load() if item["tutor_id"] == tutor_id]


    def get_by_class(self, class_id: str) -> List[Report]:
        return [Report(**item) for item in self._load() if item["class_id"] == class_id]

    def list_all(self) -> List[Report]:
        return [Report(**item) for item in self._load()]

    def list_student_evaluations(self) -> List[Report]:
        data = self._load()
        return [
            Report(**item)
            for item in data
            if item["type"] == "student_evaluation"
        ]
