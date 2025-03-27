from backend.src.controller import www
from typing import Any


@www.action
def get() -> dict[str | float | int, Any]:
    return www.model.get()
