from fastapi import APIRouter, HTTPException
from typing import Optional

from services.student_service import StudentService
from schemas.student_requests import (
    JoinClassRequest,
    LeaveClassRequest,
    EvaluateTutorRequest
)

import logging

router = APIRouter(tags=["Student"])

logging.basicConfig(
    level=logging.INFO,  # can be DEBUG for more detail
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

student_service = StudentService()

@router.get("/{student_id}/browse")
def browse_classes(student_id: str, subject: Optional[str] = None, tutor_id: Optional[str] = None):
    """
    Returns approved classes grouped by subject and tutor.
    Excludes classes the student is already enrolled in.
    """
    classes = student_service.browse_classes(student_id, subject, tutor_id)

    logger.info(f"-STUDENT- Got classes: {classes}")

    return classes


@router.post("/join")
def join_class(payload: JoinClassRequest):
    logger.info(f"-STUDENT- Joining class for payload {payload}")
    try:
        result = student_service.join_class(payload.student_id, payload.class_id)
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/leave")
def leave_class(payload: LeaveClassRequest):
    logger.info(f"-STUDENT- Leaving class for payload {payload}")
    return student_service.leave_class(payload.student_id, payload.class_id)


@router.post("/evaluate")
def evaluate_tutor(payload: EvaluateTutorRequest):
    logger.info(f"-STUDENT- Evaluating for tutor in payload {payload}")
    return student_service.evaluate_tutor(
        payload.class_id,
        payload.tutor_id,
        payload.student_id,
        payload.content
    )


@router.get("/{student_id}/my-courses")
def list_enrollments(student_id: str):
    logger.info(f"Listing enrolled classes for student {student_id}")
    return student_service.list_enrolled_classes(student_id)
