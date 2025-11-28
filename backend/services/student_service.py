from typing import Optional
from services.class_offering_service import ClassOfferingService
from services.enrollment_service import EnrollmentService
from services.report_service import ReportService
from repositories.user_repository import UserRepository
from datetime import datetime


class StudentService:
    def __init__(self,
                 offering_service: Optional[ClassOfferingService] = None,
                 enrollment_service: Optional[EnrollmentService] = None,
                 report_service: Optional[ReportService] = None,
                 user_repo: Optional[UserRepository] = None):
        self.offering_service = offering_service or ClassOfferingService()
        self.enrollment_service = enrollment_service or EnrollmentService()
        self.report_service = report_service or ReportService()
        self.user_repo = user_repo or UserRepository()

    def browse_classes(self, student_id: str, subject: Optional[str] = None, tutor_id: Optional[str] = None):
        # Get all approved offerings
        offerings = self.offering_service.list_approved()

        # Remove classes student is already enrolled in
        enrolled = {e["class_id"] for e in self.enrollment_service.list_enrollments_for_student(student_id)}
        offerings = [o for o in offerings if o.id not in enrolled]

        # Apply optional subject filter
        if subject:
            offerings = [o for o in offerings if o.subject.lower() == subject.lower()]

        # Apply optional tutor filter
        if tutor_id:
            offerings = [o for o in offerings if o.tutor_id == tutor_id]

        # Organize by subject -> tutor
        results = {}
        for o in offerings:
            if o.subject not in results:
                results[o.subject] = {}

            # Get tutor info from user repository
            tutor = self.user_repo.get_by_id(o.tutor_id)
            tutor_info = {
                "tutor_name": tutor.name if tutor else "Unknown",
                "tutor_email": tutor.email if tutor else None,
            }

            if o.tutor_id not in results[o.subject]:
                results[o.subject][o.tutor_id] = {
                    "tutor_info": tutor_info,
                    "classes": []
                }

            results[o.subject][o.tutor_id]["classes"].append({
                "class_id": o.id,
                "delivery_mode": o.delivery_mode,
                "meeting_link": o.meeting_link,
                "room": o.room,
                "timeslot": o.timeslot,
                "status": o.status,
            })

        return results

    # Join a class: update enrollment record + class roster
    def join_class(self, student_id: str, class_id: str):
        target = self.offering_service.get_by_id(class_id)

        enrolled_classes = self.list_enrolled_classes(student_id)

        # Check for schedule conflicts
        for cls in enrolled_classes:
            a_start = datetime.fromisoformat(cls["timeslot"].start)
            a_end = datetime.fromisoformat(cls["timeslot"].end)
            b_start = datetime.fromisoformat(target.timeslot.start)
            b_end = datetime.fromisoformat(target.timeslot.end)

            # Overlap condition
            if a_start < b_end and b_start < a_end:
                raise ValueError("Schedule conflict with class " + cls["class_id"])

        # Add record to enrollment list
        self.enrollment_service.join_class(student_id, class_id)

        # Add student to offering list
        return self.offering_service.add_student(class_id, student_id)

    # Leave a class
    def leave_class(self, student_id: str, class_id: str):
        self.enrollment_service.leave_class(student_id, class_id)
        return self.offering_service.remove_student(class_id, student_id)

    # Student evaluates tutor / class
    def evaluate_tutor(self, class_id: str, tutor_id: str, student_id: str, content: str):
        # minimal MVP structure
        return self.report_service.add_student_evaluation(
            class_id=class_id,
            tutor_id=tutor_id,
            student_id=student_id,
            content=content
        )

    # List student's enrolled classes (based on enrollments)
    def list_enrolled_classes(self, student_id: str):
        enrollments = self.enrollment_service.list_enrollments_for_student(student_id)
        results = []

        for enr in enrollments:
            offering = self.offering_service.get_by_id(enr["class_id"])

            tutor_name = self.user_repo.get_by_id(offering.tutor_id).name

            if not offering:
                continue  # class deleted or missing

            results.append({
                "class_id": enr["class_id"],
                "status": enr["enrollment_status"],
                "student_id": enr["student_id"],
                "tutor_id": enr["tutor_id"],

                # From class offering
                "subject": offering.subject,
                "delivery_mode": offering.delivery_mode,
                "meeting_link": offering.meeting_link,
                "room": offering.room,
                "timeslot": offering.timeslot,
                "tutor_name": tutor_name
            })

        return results
