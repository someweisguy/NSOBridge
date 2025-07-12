from datetime import timedelta

from pydantic import Field, field_validator

from core.models.time.interval import Resettable


class Alarmable(Resettable):
    alarm: timedelta = Field(timedelta(seconds=0))

    @classmethod
    @field_validator('alarm', mode='after')
    def _validate_alarm(cls, alarm: timedelta) -> timedelta:
        if alarm.total_seconds() < 0:
            return timedelta(seconds=0)
        return alarm
