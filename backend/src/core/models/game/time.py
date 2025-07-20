from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import CheckConstraint
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import Mapped, mapped_column

from core.models.game.base import SQLBase, TimedeltaAsMilliseconds


class SQLClock(SQLBase):
    __tablename__ = 'clocks'

    start_timestamp: Mapped[datetime | None] = mapped_column(default=None, init=False)
    elapsed: Mapped[timedelta] = mapped_column(
        TimedeltaAsMilliseconds, default=timedelta(seconds=0), init=False
    )
    alarm: Mapped[timedelta] = mapped_column(TimedeltaAsMilliseconds)

    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError('Cannot start a Clock when it is already running')
        self.start_timestamp = timestamp

    def stop(self, timestamp: datetime) -> None:
        if not self.is_running():
            raise RuntimeError('Cannot stop a Clock when it is already stopped')
        assert self.start_timestamp is not None
        if timestamp < self.start_timestamp:
            raise RuntimeError('Cannot stop a Clock before it has been started')
        self.elapsed += timestamp - self.start_timestamp
        self.start_timestamp = None

    def is_running(self) -> bool:
        return self.start_timestamp is not None

    def get_duration(self, timestamp: datetime | None = None) -> timedelta:
        if timestamp is None:
            timestamp = datetime.now()
        if self.start_timestamp is None:
            return self.elapsed
        if timestamp < self.start_timestamp:
            raise ValueError('Cannot get a duration for a time that is in the past')
        return (timestamp - self.start_timestamp) + self.elapsed


class SQLOneShot(SQLBase):
    __abstract__ = True

    start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    stop_timestamp: Mapped[datetime | None] = mapped_column(default=None)

    @declared_attr
    def __table_args__(cls):
        return (
            CheckConstraint('start_timestamp < stop_timestamp'),
            CheckConstraint('start_timestamp IS NULL OR stop_timestamp IS NOT NULL'),
        )

    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError('Cannot start a Clock when it is already running')
        self.start_timestamp = timestamp

    def stop(self, timestamp: datetime) -> None:
        if not self.is_running():
            raise RuntimeError('Cannot stop a Clock when it is already stopped')
        assert self.start_timestamp is not None
        if timestamp < self.start_timestamp:
            raise RuntimeError('Cannot stop a Clock before it has been started')
        self.stop_timestamp = timestamp

    def is_running(self) -> bool:
        return self.start_timestamp is not None and self.stop_timestamp is None

    def is_finished(self) -> bool:
        return self.start_timestamp is not None and self.stop_timestamp is not None

    def get_duration(self, timestamp: datetime | None = None) -> timedelta:
        if timestamp is None:
            timestamp = datetime.now()
        if self.start_timestamp is None:
            return timedelta(seconds=0)
        elif self.stop_timestamp is not None:
            return self.stop_timestamp - self.start_timestamp
        else:
            if timestamp < self.start_timestamp:
                raise ValueError('Cannot get a duration for a time that is in the past')
            return timestamp - self.start_timestamp
