
from derby.series import Series
from server import controller
from typing import Any


@controller.action
def get(boutId: str) -> dict[str | float | int, Any]:
    series: Series = controller.model
    return series.get_bout(boutId).get()
