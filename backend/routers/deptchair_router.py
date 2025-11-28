from fastapi import APIRouter
from services.deptchair_service import DepartmentChairService


router = APIRouter(tags=["Department Chair"])

deptchair_service = DepartmentChairService()


@router.get("/progress-notes")
def get_progress_notes():
    return deptchair_service.get_all_tutor_progress_notes()

@router.get("/student-evaluations")
def get_student_evals():
    return deptchair_service.get_all_student_evaluations()

# @router.get("/tutors/pending")
# def list_pending(service: DepartmentChairService = Depends()):
#     return service.list_pending_tutors()
#
# @router.post("/tutors/{tutor_id}/approve")
# def approve(tutor_id: str, service: DepartmentChairService = Depends()):
#     try:
#         return service.approve_tutor(tutor_id)
#     except ValueError:
#         raise HTTPException(status_code=404, detail="Tutor not found")
#
# @router.post("/tutors/{tutor_id}/reject")
# def reject(tutor_id: str, service: DepartmentChairService = Depends()):
#     try:
#         return service.reject_tutor(tutor_id)
#     except ValueError:
#         raise HTTPException(status_code=404, detail="Tutor not found")
