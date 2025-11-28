from pydantic import BaseModel
from typing import Literal


Role = Literal[
    "student",
    "tutor",
    "coordinator",
    "deptchair",
    "programadmin"
]

class UserLoginRequest(BaseModel):
    email: str
    # password: str  # mock but kept for structure



