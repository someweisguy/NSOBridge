from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import CheckConstraint
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

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


class SQLOneShot(SQLBase):
    __abstract__ = True
    
    start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    stop_timestamp: Mapped[datetime | None] = mapped_column(default=None)

    @declared_attr
    def __table_args__(cls):
        return (
            CheckConstraint(cls.start_timestamp < cls.stop_timestamp),
            CheckConstraint('start_timestamp IS NULL or stop_timestamp is NOT NULL'),
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
