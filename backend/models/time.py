from __future__ import annotations

from datetime import datetime, timedelta
from typing import TYPE_CHECKING, override

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .models import AbstractOneShotModel, SQLModel, TimedeltaAsMilliseconds

if TYPE_CHECKING:
    from .bout import GenericBoutModel
    from .jam import JamModel
    from .team import TeamModel


class ClockModel(SQLModel):
    __tablename__: str = 'clocks'

    alarm: Mapped[timedelta] = mapped_column(TimedeltaAsMilliseconds)
    elapsed: Mapped[timedelta] = mapped_column(
        TimedeltaAsMilliseconds, default=timedelta(seconds=0)
    )
    start_timestamp: Mapped[datetime | None] = mapped_column(default=None)

    bout: Mapped[GenericBoutModel | None] = relationship(
        back_populates='clock', lazy='joined'
    )

    @property
    @override
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


class TimeoutModel(AbstractOneShotModel):
    __tablename__: str = 'timeouts'
    
    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))
    _jam_id: Mapped[int] = mapped_column(ForeignKey('jams.id'))
    _team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))
    
    clock_elapsed: Mapped[timedelta] = mapped_column(TimedeltaAsMilliseconds)
    details: Mapped[str | None] = mapped_column(default=None)
    is_review: Mapped[bool] = mapped_column(default=False)
    result: Mapped[str | None] = mapped_column(default=None)
    retained: Mapped[bool] = mapped_column(default=False)

    bout: Mapped[GenericBoutModel | None] = relationship(back_populates='timeouts')
    jam: Mapped[JamModel] = relationship(foreign_keys=[_jam_id])
    team: Mapped[TeamModel | None] = relationship(
        back_populates='timeouts', foreign_keys=[_team_id]
    )

    @property
    @override
    def parents(self) -> tuple[SQLModel | None, ...]:
        return (self.bout,)
