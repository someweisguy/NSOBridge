from datetime import timedelta

from pydantic import Field

from core.models.time.timer import Timer, millisdelta


class Alarm(Timer):
    alarm: millisdelta = Field(timedelta(seconds=0), init=False)

    def set_alarm(
        self,
        delta: timedelta | None = None,
        *,
        hours: float = 0,
        minutes: float = 0,
        seconds: float = 0,
        milliseconds: float = 0,
    ) -> None:
        if delta is not None:
            new_alarm = delta
        else:
            new_alarm: timedelta | None = timedelta(
                hours=hours, minutes=minutes, seconds=seconds, milliseconds=milliseconds
            )
        if new_alarm.total_seconds() <= 0:
            raise ValueError('Alarm value must be greater than 0 seconds')
        self.alarm = new_alarm
