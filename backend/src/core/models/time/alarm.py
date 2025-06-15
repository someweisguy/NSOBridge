from datetime import timedelta

from pydantic import computed_field

from core.models.time.timer import Timer, millisdelta


class Alarm(Timer):
    _alarm: millisdelta = timedelta(seconds=0)

    @computed_field
    @property
    def alarm(self) -> millisdelta:
        return self._alarm

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
        self._alarm = new_alarm
