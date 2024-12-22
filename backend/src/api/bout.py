from datetime import datetime, timedelta
from derby.bout import Bout
from derby.jam import Jam
from derby.series import Series
from server import controller
from typing import Any


@controller.action
def get(boutId: str) -> dict[str | float | int, Any]:
    series: Series = controller.model
    return series.get_bout(boutId).get()


@controller.action
def startJam(boutId: str, latency: int | timedelta) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = controller.model
    bout: Bout = series.get_bout(boutId)
    bout.start_jam(now)


@controller.action
def stopJam(boutId: str, latency: int | timedelta) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = controller.model
    bout: Bout = series.get_bout(boutId)
    bout.stop_jam(now)


@controller.action
def setStopReason(boutId: str, jamId: tuple[int, int],
                  stopReason: Jam.stop_reasons) -> None:
    series: Series = controller.model
    bout: Bout = series.get_bout(boutId)
    jam: Jam = bout.get_jam(jamId)
    jam.stop_reason = stopReason


@controller.action
def callTimeout(boutId: str, latency: int | timedelta) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = controller.model
    bout: Bout = series.get_bout(boutId)
    bout.timeout.call(now)


@controller.action
def endTimeout(boutId: str, latency: int | timedelta) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = controller.model
    bout: Bout = series.get_bout(boutId)
    bout.timeout.end(now)


@controller.action
def startIntermission(boutId: str, latency: int | timedelta,
                      advanceGameState: bool) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = controller.model
    bout: Bout = series.get_bout(boutId)
    bout.start_intermission(now)

    if advanceGameState:
        bout.advance_game()


@controller.action
def stopIntermission(boutId: str, latency: int | timedelta) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = controller.model
    bout: Bout = series.get_bout(boutId)
    bout.stop_intermission(now)
