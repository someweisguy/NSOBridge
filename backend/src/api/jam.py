from derby.series import Series
from server import controller
from typing import Any


def get(boutId: str, jamId: tuple[int, int]) -> dict[str | float | int, Any]:
    series: Series = controller.data
    return series.get_bout(boutId).get_jam(jamId).get()
