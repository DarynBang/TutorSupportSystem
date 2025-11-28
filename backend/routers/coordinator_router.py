from fastapi import APIRouter, HTTPException
from services.coordinator_service import CoordinatorService
from schemas.coordinator_requests import (
    ApproveRequest,
    RejectRequest,
    ModifyClassRequest
)

import logging


logging.basicConfig(
    level=logging.INFO,  # can be DEBUG for more detail
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


router = APIRouter(tags=["Coordinator"])

coord_service = CoordinatorService()


@router.post("/approve")
def approve_class(payload: ApproveRequest):
    logger.info(f"-COORDINATOR- Approving class for payload {payload}")
    try:
        return coord_service.approve_class(payload.offering_id, payload.room)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reject")
def reject_class(payload: RejectRequest):
    logger.info(f"-COORDINATOR- Rejecting class for payload {payload}")
    try:
        return coord_service.reject_class(payload.offering_id, payload.reason)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/coverage")
def monitor_coverage():
    logger.info(f"-COORDINATOR- Monitoring subject coverage")
    return coord_service.monitor_subject_coverage()


@router.get("/classes")
def view_classes():
    logger.info(f"-COORDINATOR- Viewing class lists")
    return coord_service.view_class_list()


@router.get("/classes/pending")
def view_pending_or_rejected():
    logger.info("-COORDINATOR- Viewing pending/rejected class lists")
    try:
        return coord_service.view_pending_rejected_classes()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@router.get("/rooms")
def get_rooms():
    """
    Returns list of all rooms with capacity information.
    """
    try:
        return coord_service.get_rooms()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))