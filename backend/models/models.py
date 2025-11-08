from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from core import BaseSQLModel
from sqlalchemy import CheckConstraint
from sqlalchemy.orm import (
    Mapped,
    declared_attr,
    mapped_column,
)


class AbstractOneShotModel(BaseSQLModel):
    start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    stop_timestamp: Mapped[datetime | None] = mapped_column(default=None)

    __abstract__: bool = True

    @declared_attr
    def __table_args__(cls) -> Any:
        return (
            CheckConstraint('start_timestamp < stop_timestamp'),
            CheckConstraint('start_timestamp IS NOT NULL OR stop_timestamp IS NULL'),
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
