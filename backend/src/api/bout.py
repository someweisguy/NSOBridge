from datetime import datetime, timedelta
from derby.bout import Bout
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
def callTimeout(boutId: str, latency: int | timedelta) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = controller.model
    bout: Bout = series.get_bout(boutId)
    bout.call_timeout(now)


@controller.action
def endTimeout(boutId: str, latency: int | timedelta) -> None:
    now: datetime = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = controller.model
    bout: Bout = series.get_bout(boutId)
    bout.end_timeout(now)
