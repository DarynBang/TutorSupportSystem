from dataclasses import dataclass
from typing import Literal

Role = Literal[
    "student",
    "tutor",
    "coordinator",
    "deptchair",
    "program_admin"
]


@dataclass
class User:
    id: str
    name: str
    email: str
    role: Role

