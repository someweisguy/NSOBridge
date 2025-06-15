from datetime import datetime, timedelta
from math import floor
from typing import Annotated

from pydantic import Field, PlainSerializer

from core.models import ProjectModel

type millisdelta = Annotated[
    timedelta,
    PlainSerializer(
        lambda td: floor(td.total_seconds() * 1000),
        when_used='unless-none',
        return_type=int,
    ),
]


class Timer(ProjectModel):
    start_timestamp: datetime | None = Field(None, init=False)
    elapsed: millisdelta = Field(timedelta(seconds=0), init=False)

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
