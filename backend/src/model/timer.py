from datetime import datetime, timedelta
from math import floor
from typing import Annotated

from pydantic import Field, PlainSerializer

from model.team import ProjectModel, TeamOfficialString

type millisdelta = Annotated[
    timedelta,
    PlainSerializer(
        lambda td: floor(td.total_seconds() * 1000),
        when_used='unless-none',
        return_type=int,
    ),
]


class Timer(ProjectModel):
    start_timestamp: datetime | None = None
    elapsed: millisdelta = timedelta(seconds=0)

    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError('This clock is already running')
        self.start_timestamp = timestamp

    def stop(self, timestamp: datetime) -> None:
        if self.start_timestamp is None:
            raise RuntimeError('This clock has already stopped')
        if self.start_timestamp > timestamp:
            raise ValueError('Timestamp is invalid')
        self.elapsed += timestamp - self.start_timestamp
        self.start_timestamp = None

    def is_running(self) -> bool:
        return self.start_timestamp is not None

    def reset(self) -> None:
        self.start_timestamp = None
        self.elapsed = timedelta(seconds=0)

    def get_elapsed_at_timestamp(self, timestamp: datetime) -> timedelta:
        elapsed = self.elapsed
        if self.start_timestamp is not None:
            elapsed += timestamp - self.start_timestamp
        return elapsed


class Clock(Timer):
    alarm: millisdelta = timedelta(seconds=0)

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


class Timeout(Timer):
    period_num: int = Field(final=True)
    jam_num: int = Field(final=True)
    period_clock_elapsed: millisdelta = Field(final=True)
    is_review: bool = False
    team: TeamOfficialString | None = None
    details: str = ''
    result: str = ''
    retained: bool = False
