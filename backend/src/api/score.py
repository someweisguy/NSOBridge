from derby.jam import Jam
from derby.series import Series
from server import controller
from typing import Any


@controller.action
def get(boutId: str, jamId: tuple[int, int], team: str) -> dict[str | float | int, Any]:
    series: Series = controller.model
    jam: Jam = series.get_bout(boutId).get_jam(jamId)
    return jam.score[team].get()


@controller.action
def addTrip(boutId: str, jamId: tuple[int, int], team: str, points: int) -> None:
    series: Series = controller.model
    jam: Jam = series.get_bout(boutId).get_jam(jamId)
    jam.score[team].add_trip(points)