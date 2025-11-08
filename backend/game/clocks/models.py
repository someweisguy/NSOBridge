from __future__ import annotations

from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any

from models import PARENT_RELATIONSHIP, BaseSQLModel
from sqlalchemy import CheckConstraint, ForeignKey
from sqlalchemy.orm import (
    Mapped,
    declared_attr,
    mapped_column,
    relationship,
)

if TYPE_CHECKING:
    from bouts.models import GenericBoutModel, GenericTeamModel
    from jams.models import JamModel


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


class ClockModel(BaseSQLModel):
    start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    elapsed: Mapped[timedelta] = mapped_column(default=timedelta(seconds=0))
    alarm: Mapped[timedelta] = mapped_column()

    bout: Mapped[GenericBoutModel | None] = relationship(
        back_populates='clock',
        cascade=PARENT_RELATIONSHIP,
        lazy='joined',
    )

    __tablename__: str = 'clocks'

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
    bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))
    jam_id: Mapped[int | None] = mapped_column(ForeignKey('jams.id'))
    team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))

    clock_elapsed: Mapped[timedelta] = mapped_column()
    details: Mapped[str | None] = mapped_column(default=None)
    is_review: Mapped[bool] = mapped_column(default=False)
    result: Mapped[str | None] = mapped_column(default=None)
    retained: Mapped[bool] = mapped_column(default=False)

    bout: Mapped[GenericBoutModel | None] = relationship(
        back_populates='timeouts',
        cascade=PARENT_RELATIONSHIP,
    )
    jam: Mapped[JamModel] = relationship(
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[jam_id],
    )
    team: Mapped[GenericTeamModel | None] = relationship(
        back_populates='timeouts',
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[team_id],
    )

    __tablename__: str = 'timeouts'

    def __init__(self, clock_elapsed: timedelta, jam: JamModel) -> None:
        # FIXME: don't require a Jam to call a Timeout
        super().__init__(clock_elapsed=clock_elapsed, jam=jam)
