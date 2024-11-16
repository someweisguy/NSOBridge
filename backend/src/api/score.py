from derby.jam import Jam
from derby.series import Series
from server import controller
from typing import Any


def get(boutId: str, jamId: tuple[int, int], team: str) -> dict[str | float | int, Any]:
    series: Series = controller.data
    jam: Jam = series.get_bout(boutId).get_jam(jamId)
    return jam.score[team].get()
