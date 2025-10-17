from __future__ import annotations

from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any

from sqlalchemy import CheckConstraint, ForeignKey
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .models import SQLModel, TimedeltaAsMilliseconds

if TYPE_CHECKING:
    from .bout import GenericBoutModel
    from .jam import JamModel
    from .team import TeamModel


class ClockModel(SQLModel):
    __tablename__ = 'clocks'

    bout: Mapped[GenericBoutModel | None] = relationship(
        back_populates='clock', lazy='joined'
    )

    start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    elapsed: Mapped[timedelta] = mapped_column(
        TimedeltaAsMilliseconds, default=timedelta(seconds=0)
    )
    alarm: Mapped[timedelta] = mapped_column(TimedeltaAsMilliseconds)

    @property
    def parents(self) -> tuple[SQLModel | None, ...]:
        return (self.bout,)

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

    def reset(self) -> None:
        self.elapsed = timedelta(seconds=0)

    def get_duration(self, timestamp: datetime | None = None) -> timedelta:
        if timestamp is None:
            timestamp = datetime.now()
        if self.start_timestamp is None:
            return self.elapsed
        if timestamp < self.start_timestamp:
            raise ValueError('Cannot get a duration for a time that is in the past')
        return (timestamp - self.start_timestamp) + self.elapsed


class AbstractOneShotModel(SQLModel):
    __abstract__ = True

    start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    stop_timestamp: Mapped[datetime | None] = mapped_column(default=None)

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


class TimeoutModel(AbstractOneShotModel):
    __tablename__ = 'timeouts'
    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))
    _team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))
    _jam_id: Mapped[int] = mapped_column(ForeignKey('jams.id'))

    bout: Mapped[GenericBoutModel | None] = relationship(back_populates='timeouts')
    jam: Mapped[JamModel] = relationship(foreign_keys=[_jam_id])

    clock_elapsed: Mapped[timedelta] = mapped_column(TimedeltaAsMilliseconds)
    team: Mapped[TeamModel | None] = relationship(
        back_populates='timeouts', foreign_keys=[_team_id]
    )
    is_review: Mapped[bool] = mapped_column(default=False)

    details: Mapped[str | None] = mapped_column(default=None)
    result: Mapped[str | None] = mapped_column(default=None)
    retained: Mapped[bool] = mapped_column(default=False)

    @property
    def parents(self) -> tuple[SQLModel | None, ...]:
        return (self.bout,)
