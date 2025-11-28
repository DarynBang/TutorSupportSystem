from typing import Optional
from services.class_offering_service import ClassOfferingService
from services.report_service import ReportService
from models.class_offering import ClassOffering
from datetime import datetime
from repositories.user_repository import UserRepository

class TutorService:
    def __init__(self,
                 offering_service: Optional[ClassOfferingService] = None,
                 report_service: Optional[ReportService] = None,
                 user_repo: Optional[UserRepository] = None):
        self.offering_service = offering_service or ClassOfferingService()
        self.report_service = report_service or ReportService()
        self.user_repo = user_repo or UserRepository()

    # Tutor opens a class (creates a ClassOffering)
    def open_class_offering(self, offering: ClassOffering):
        return self.offering_service.create_offering(offering)

    # Tutor submits a class-level report
    def submit_report(self, tutor_id: str, class_id: str, note: str):
        return self.report_service.add_tutor_progress(
            class_id=class_id,
            tutor_id=tutor_id,
            note=note,
        )

    def list_my_classes(self, tutor_id: str):
        all_offerings = self.offering_service.list_all()
        offerings = [o for o in all_offerings if o.tutor_id == tutor_id]

        return offerings


class TutorDashboardService:
    def __init__(self,
                 offering_service: ClassOfferingService,
                 report_service: ReportService):
        self.offering_service = offering_service
        self.report_service = report_service

    def get_upcoming_classes(self, tutor_id: str):
        classes = self._get_tutor_classes(tutor_id)
        now = datetime.now()

        upcoming_classes = [c for c in classes if c.status == "Approved"]

        upcoming = [
            c for c in upcoming_classes
            if datetime.fromisoformat(c.timeslot.start) > now
        ]
        return sorted(upcoming,
                      key=lambda c: c.timeslot.start)


    def get_pending_reports(self, tutor_id: str):
        classes = self._get_tutor_classes(tutor_id)
        pending = []

        completed_classes = [c for c in classes if c.status == "Completed"]
        for c in completed_classes:
            reports = self.report_service.get_reports_for_class(c.id)
            if len(reports) == 0:
                pending.append(c)

        return pending


    def get_total_active_students(self, tutor_id: str):
        classes = self._get_tutor_classes(tutor_id)
        active_classes = [c for c in classes if c.status != "Completed"]
        return sum(len(c.enrolled_students) if c.enrolled_students else 0
                   for c in active_classes)


    def dashboard_summary(self, tutor_id: str):
        upcoming = self.get_upcoming_classes(tutor_id)
        pending = self.get_pending_reports(tutor_id)
        total_students = self.get_total_active_students(tutor_id)

        return {
            "quick_stats": {
                "upcoming_classes": len(upcoming),
                "pending_reports": len(pending),
                "total_students": total_students,
            },
            "upcoming_classes_detail": upcoming[:3]
        }

    def _get_tutor_classes(self, tutor_id: str):
        return [
            o for o in self.offering_service.list_all()
            if o.tutor_id == tutor_id
        ]
