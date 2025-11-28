from typing import Dict, Any, Optional
from repositories.report_repository import ReportRepository
from repositories.class_offering_repository import ClassOfferingRepository
from models.report import Report
from datetime import datetime


class ReportService:

    def __init__(self, report_repo: Optional[ReportRepository] = None,
                 class_repo: Optional[ClassOfferingRepository] = None):
        self.report_repo = report_repo or ReportRepository()
        self.class_repo = class_repo or ClassOfferingRepository()


    # TUTOR PROGRESS REPORT
    def add_tutor_progress(self, class_id: str, tutor_id: str, note: str):
        class_obj: Dict[str, Any] = self.class_repo.get(class_id)  # Assuming get returns a dict/object

        if class_obj.tutor_id != tutor_id:
            raise ValueError("Tutor is not assigned to this class")

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

        # Check if progress_notes is None and initialize it if necessary
        if class_obj.progress_notes is None:
            class_obj.progress_notes = {}

        # Now that we guarantee it's a dictionary, assignment works
        class_obj.progress_notes[timestamp] = note

        self.class_repo.save(class_obj)

        return {"message": "Progress added", "timestamp": timestamp}


    # STUDENT EVALUATION REPORT
    def add_student_evaluation(self, class_id: str, tutor_id: str, student_id: str, content: str):
        report = Report(
            report_id=None,
            class_id=class_id,
            tutor_id=tutor_id,
            student_id=student_id,
            type="student_evaluation",
            content=content,
            date=datetime.now().strftime("%Y-%m-%d")
        )

        return self.report_repo.create(report)


    # Retrieval
    def get_reports_for_student(self, student_id: str):
        return self.report_repo.get_by_student(student_id)

    def get_reports_for_tutor(self, tutor_id: str):
        return self.report_repo.get_by_tutor(tutor_id)

    def get_reports_for_class(self, class_id: str):
        return self.report_repo.get_by_class(class_id)
