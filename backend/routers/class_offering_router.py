from fastapi import APIRouter
from services.class_offering_service import ClassOfferingService

router = APIRouter(tags=["ClassOfferings"])

offering_service = ClassOfferingService()


@router.get("/")
def list_all():
    return offering_service.list_all()


@router.get("/approved")
def list_approved():
    return offering_service.list_approved()


@router.get("/pending")
def list_pending():
    return offering_service.list_pending()


@router.get("/{offering_id}")
def get_by_id(offering_id: str):
    return offering_service.repo.get(offering_id)
