from pydantic import BaseModel

class JoinClassRequest(BaseModel):
    student_id: str
    class_id: str

class LeaveClassRequest(BaseModel):
    student_id: str
    class_id: str

class EvaluateTutorRequest(BaseModel):
    class_id: str
    tutor_id: str
    student_id: str
    content: str
