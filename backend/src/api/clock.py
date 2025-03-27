from datetime import datetime, timedelta
from derby.clock import Clock
from derby.series import Series
from backend.src.controller import www


@www.action
def get(boutId: str, type: str, latency: int | timedelta) -> dict:
    now = datetime.now()
    if isinstance(latency, int):
        latency = timedelta(milliseconds=latency)
    now -= latency

    series: Series = www.model
    clock: Clock = series.get_bout(boutId).clock[type]
    return clock.get(now)
