from typing import Optional, Literal
from pydantic import BaseModel

class Report(BaseModel):
    report_id: Optional[str] = None
    class_id: str
    tutor_id: Optional[str] = None
    type: Literal["tutor_progress", "student_evaluation"]
    content: str
    date: str
    student_id: Optional[str] = None
