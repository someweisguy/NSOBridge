from datetime import timedelta

from pydantic import computed_field

from core.models.time.timer import Timer


class Alarm(Timer):
    _alarm: timedelta = timedelta(seconds=0)

    @computed_field
    @property
    def alarm(self) -> timedelta:
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
        new_alarm: timedelta = (
            delta
            if delta is not None
            else timedelta(
                hours=hours,
                minutes=minutes,
                seconds=seconds,
                milliseconds=milliseconds,
            )
        )
        if new_alarm.total_seconds() <= 0:
            raise ValueError('Alarm value must be greater than 0 seconds')
        self._alarm = new_alarm
