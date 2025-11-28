from fastapi import APIRouter
from services.tutor_service import TutorService, TutorDashboardService
from services.class_offering_service import ClassOfferingService
from schemas.tutor_requests import (
    OpenClassOfferingRequest,
    ProgressRequest
)
from models.class_offering import ClassOffering

import logging


logging.basicConfig(
    level=logging.INFO,  # can be DEBUG for more detail
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Tutor"])

tutor_service = TutorService()
offering_service = ClassOfferingService()

tutor_dashboard_service = TutorDashboardService(
    offering_service=tutor_service.offering_service,
    report_service=tutor_service.report_service
)


@router.post("/{tutor_id}/open-class")
def open_class(payload: OpenClassOfferingRequest):
    logger.info(f"-TUTOR- Opening class for payload {payload}")
    offering = ClassOffering(**payload.model_dump())
    return tutor_service.open_class_offering(offering)


@router.post("/report")
def submit_report(payload: dict):
    """
    Expected body:
    {
        "class_id": "cls-001",
        "tutor_id": "tut-001",
        "note": "Today we learned about fractions"
    }
    """
    class_id = payload["class_id"]
    tutor_id = payload["tutor_id"]
    note = payload["note"]

    logger.info(f"-TUTOR- Submitting progress for class {class_id}")
    return tutor_service.submit_report(tutor_id, class_id, note)

@router.get("/{tutor_id}/my-classes")
def list_my_classes(tutor_id: str):
    logger.info(f"-TUTOR- Listing classes for tutor {tutor_id}")
    return tutor_service.list_my_classes(tutor_id)


@router.get("/{tutor_id}/dashboard")
def tutor_dashboard(tutor_id: str):
    logger.info(f"-TUTOR- Fetching dashboard for tutor {tutor_id}")

    summary = tutor_dashboard_service.dashboard_summary(tutor_id)

    return summary



