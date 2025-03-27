from datetime import datetime, timedelta
from derby.bout import Bout
from derby.jam import Jam
from derby.series import Series
from backend.src.controller import www
from typing import Any


@www.action
def get(boutId: str) -> dict[str | float | int, Any]:
    series: Series = www.model
    return series.get_bout(boutId).get()


@www.action
def startJam(boutId: str, latency: int | timedelta) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = www.model
    bout: Bout = series.get_bout(boutId)
    bout.jam.start(now)


@www.action
def stopJam(boutId: str, latency: int | timedelta) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = www.model
    bout: Bout = series.get_bout(boutId)
    bout.jam.stop(now)


@www.action
def setStopReason(boutId: str, jamId: tuple[int, int],
                  stopReason: Jam.stop_reasons) -> None:
    series: Series = www.model
    bout: Bout = series.get_bout(boutId)
    jam: Jam = bout.jam.get(jamId)
    jam.stop_reason = stopReason


@www.action
def callTimeout(boutId: str, latency: int | timedelta) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = www.model
    bout: Bout = series.get_bout(boutId)
    bout.timeout.call(now)


@www.action
def endTimeout(boutId: str, latency: int | timedelta) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = www.model
    bout: Bout = series.get_bout(boutId)
    bout.timeout.end(now)


@www.action
def advanceGameState(boutId: str) -> None:
    series: Series = www.model
    bout: Bout = series.get_bout(boutId)
    bout.advance_game()


@www.action
def startIntermission(boutId: str, latency: int | timedelta) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = www.model
    bout: Bout = series.get_bout(boutId)
    bout.start_intermission(now)


@www.action
def stopIntermission(boutId: str, latency: int | timedelta) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = www.model
    bout: Bout = series.get_bout(boutId)
    bout.stop_intermission(now)
