"""The Clock model and associated business logic."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import TYPE_CHECKING, override

from game.models import TimeableModel
from sqlalchemy.orm import Mapped, mapped_column

if TYPE_CHECKING:
    from core import BaseSQLModel


class Clock(TimeableModel):
    """Represent a Clock.

    Clocks differ from one-shots in that Clocks can be started and stopped multiple
    times. They can be used to represent time objects such as the Period or Penalty
    clocks.
    """

    start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    elapsed: Mapped[timedelta] = mapped_column(default=timedelta(seconds=0))
    alarm: Mapped[timedelta] = mapped_column(default=timedelta(seconds=0))

    __tablename__: str = 'clocks'

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return ()

    @override
    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError('Cannot start a Clock when it is already running')
        self.start_timestamp = timestamp

    @override
    def stop(self, timestamp: datetime) -> None:
        if self.start_timestamp is None:
            raise RuntimeError('Cannot stop a one-shot when it is not running')
        if timestamp < self.start_timestamp:
            raise ValueError('Cannot stop a one-shot before it has been started')
        self.elapsed += timestamp - self.start_timestamp
        self.start_timestamp = None

    @override
    def is_started(self) -> bool:
        return self.start_timestamp is not None or self.elapsed.total_seconds() > 0

    @override
    def is_running(self) -> bool:
        return self.start_timestamp is not None

    @override
    def is_stopped(self) -> bool:
        return self.start_timestamp is None

    @override
    def get_duration(self, timestamp: datetime | None = None) -> timedelta:
        if timestamp is None:
            timestamp = datetime.now()
        if self.start_timestamp is None:
            return self.elapsed
        if timestamp < self.start_timestamp:
            raise ValueError('Cannot get a duration for a time that is in the past')
        return (timestamp - self.start_timestamp) + self.elapsed

    def reset(self) -> None:
        """Reset the clock to zero."""
        self.elapsed = timedelta(seconds=0)
