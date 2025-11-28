from typing import Optional
from repositories.class_offering_repository import ClassOfferingRepository
from repositories.report_repository import ReportRepository

class DepartmentChairService:
    def __init__(self,
                 class_repo: Optional[ClassOfferingRepository] = None,
                 report_repo: Optional[ReportRepository] = None):
        self.class_repo = class_repo or ClassOfferingRepository()
        self.report_repo = report_repo or ReportRepository()

    # --- Reports ---
    def get_all_tutor_progress_notes(self):
        return self.class_repo.get_progress_notes_all()

    def get_all_student_evaluations(self):
        return self.report_repo.list_student_evaluations()

    # --- Tutor Management ---
    # def list_pending_tutors(self):
    #     return self.tutor_repo.list_pending()
    #
    # def approve_tutor(self, tutor_id: str):
    #     return self.tutor_repo.approve(tutor_id)
    #
    # def reject_tutor(self, tutor_id: str):
    #     return self.tutor_repo.reject(tutor_id)
