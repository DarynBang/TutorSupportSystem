from fastapi import APIRouter, HTTPException
import json
from pathlib import Path
import logging
from schemas.user_schemas import (
    UserLoginRequest,
)

# ---------- LOGGER SETUP ----------
logging.basicConfig(
    level=logging.INFO,  # can be DEBUG for more detail
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Auth"])

# Path to json files
USERS_FILE = Path(__file__).parent.parent / "data" / "users.json"


@router.post("/login")
def login(payload: UserLoginRequest):
    """
    Login by email. Returns the user object if found.
    """
    with open(USERS_FILE, "r") as f:
        users = json.load(f)

    user = next((u for u in users if u["email"] == payload.email), None)

    if not user:
        logger.info(f"Login failed for email: {payload.email}")
        raise HTTPException(status_code=404, detail="User not found")

    logger.info(f"Login successful for email: {payload.email}, role: {user['role']}")
    return user  # returns id, name, email, role


@router.post("/logout")
def logout():
    logger.info("Logging out")
    return {"message": "Logged out"}


