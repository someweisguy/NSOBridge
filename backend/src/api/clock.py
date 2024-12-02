from datetime import datetime, timedelta
from typing import Any
from derby.series import Series
from derby.clock import Clock
from server import controller


@controller.action
def get(boutId: str, type: str, latency: int | timedelta) -> dict:
    now = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = controller.model
    clock: Clock = series.get_bout(boutId).get_clock(type)
    return clock.get(now)
