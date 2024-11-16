from server import controller
from typing import Any


def get() -> dict[str | float | int, Any]:
    return controller.data.get()
