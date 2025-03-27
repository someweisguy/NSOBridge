from derby.series import Series
from backend.src.controller import www
from typing import Any


@www.action
def get(boutId: str, jamId: tuple[int, int]) -> dict[str | float | int, Any]:
    series: Series = www.model
    return series.get_bout(boutId).jam.get(jamId).get()
