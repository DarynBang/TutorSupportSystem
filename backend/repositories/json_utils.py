import json
import os
from typing import Any

def load_json(path: str) -> Any:
    if not os.path.exists(path):
        return []

    with open(path, "r") as f:
        try:
            return json.load(f)

        except json.JSONDecodeError:
            return []


def save_json(path: str, data: Any) -> None:
    with open(path, "w") as f:
        json.dump(data, f, indent=4)
