from derby.jam import Jam
from derby.series import Series
from backend.src.controller import www
from typing import Any


@www.action
def get(boutId: str, jamId: tuple[int, int],
        team: str) -> dict[str | float | int, Any]:
    series: Series = www.model
    jam: Jam = series.get_bout(boutId).jam.get(jamId)
    return jam.score[team].get()


@www.action
def setTrip(boutId: str, jamId: tuple[int, int], team: str, tripId: int,
            points: int, validPass: bool) -> None:
    series: Series = www.model
    jam: Jam = series.get_bout(boutId).jam.get(jamId)
    jam.score[team].set_trip(tripId, points, validPass)


@www.action
def deleteTrip(boutId: str, jamId: tuple[int, int], team: str,
               tripId: int) -> None:
    series: Series = www.model
    jam: Jam = series.get_bout(boutId).jam.get(jamId)
    jam.score[team].del_trip(tripId)


@www.action
def setLead(boutId: str, jamId: tuple[int, int], team: str, lead: bool) -> None:
    series: Series = www.model
    jam: Jam = series.get_bout(boutId).jam.get(jamId)

    jam.score[team].lead = lead


@www.action
def setLost(boutId: str, jamId: tuple[int, int], team: str, lost: bool) -> None:
    series: Series = www.model
    jam: Jam = series.get_bout(boutId).jam.get(jamId)

    jam.score[team].lost = lost


@www.action
def setStarPass(boutId: str, jamId: tuple[int, int], team: str,
                starPass: bool) -> None:
    series: Series = www.model
    jam: Jam = series.get_bout(boutId).jam.get(jamId)

    jam.score[team].star_pass = (jam.score[team].num_trips() if starPass
                                 else None)
