from derby.jam import Jam
from derby.series import Series
from server import controller
from typing import Any


@controller.action
def get(boutId: str, jamId: tuple[int, int],
        team: str) -> dict[str | float | int, Any]:
    series: Series = controller.model
    jam: Jam = series.get_bout(boutId).get_jam(jamId)
    return jam.score[team].get()


@controller.action
def setTrip(boutId: str, jamId: tuple[int, int], team: str, tripId: int,
            points: int) -> None:
    series: Series = controller.model
    jam: Jam = series.get_bout(boutId).get_jam(jamId)
    jam.score[team].set_trip(tripId, points)


@controller.action
def deleteTrip(boutId: str, jamId: tuple[int, int], team: str,
               tripId: int) -> None:
    series: Series = controller.model
    jam: Jam = series.get_bout(boutId).get_jam(jamId)
    jam.score[team].del_trip(tripId)


@controller.action
def setLead(boutId: str, jamId: tuple[int, int], team: str, lead: bool) -> None:
    series: Series = controller.model
    jam: Jam = series.get_bout(boutId).get_jam(jamId)

    jam.score[team].lead = lead
