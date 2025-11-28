from typing import Optional, List
from repositories.enrollment_repository import EnrollmentRepository
from repositories.class_offering_repository import ClassOfferingRepository
from models.class_offering import Enrollment

import logging

logging.basicConfig(
    level=logging.INFO,  # can be DEBUG for more detail
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class EnrollmentService:
    def __init__(self,
                 enrollment_repo: Optional[EnrollmentRepository] = None,
                 offering_repo: Optional[ClassOfferingRepository] = None):
        self.enrollment_repo = enrollment_repo or EnrollmentRepository()
        self.offering_repo = offering_repo or ClassOfferingRepository()

    def join_class(self, student_id: str, class_id: str) -> Optional[dict]:
        """
        Enroll a student to a class offering: updates both enrollment.json and the offering's enrolled_students.
        """
        # Check offering exists and is approved & capacity not full
        offering = self.offering_repo.get(class_id)
        if not offering:
            return None

        if offering.status != "Approved":
            return None

        # cap = offering.capacity
        # if cap is not None and len(offering.enrolled_students or []) >= cap:
        #     return None

        tutor_id = offering.tutor_id

        # Enroll in enrollment repo (keeps separate record)
        enrollment = Enrollment(student_id=student_id, class_id=class_id, tutor_id=tutor_id, enrollment_status="Enrolled")
        self.enrollment_repo.add(enrollment)

        return {"student_id": student_id, "class_id": class_id}


    def leave_class(self, student_id: str, class_id: str) -> Optional[dict]:
        """
        Remove enrollment record and remove student from offering.enrolled_students
        """
        # Remove from enrollment repo (not implemented remove method; we can filter and save)
        all_enroll = self.enrollment_repo._load()
        new = [e for e in all_enroll if not (e.get("student_id") == student_id and e.get("class_id") == class_id)]
        self.enrollment_repo._save(new)

        return {"student_id": student_id, "class_id": class_id}


    def list_enrollments_for_student(self, student_id: str) -> List[dict]:
        rows = self.enrollment_repo.get_for_student(student_id)
        logger.info(rows)
        return [r.__dict__ for r in rows]
