from server import controller
from typing import Any


@controller.action
def get() -> dict[str | float | int, Any]:
    return controller.data.get()
