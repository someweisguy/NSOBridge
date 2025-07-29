from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Literal

from sqlalchemy import CheckConstraint, ForeignKey, UniqueConstraint
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.models import SQLModel
from models.team import TeamModel
from models.time import AbstractOneShotModel

if TYPE_CHECKING:
    from models.bout import GenericBoutModel

type TeamName = Literal['home', 'away']


class TripModel(SQLModel):
    __tablename__ = 'trips'
    _team_jam_id: Mapped[int] = mapped_column(ForeignKey('team_jams._id'), init=False)
    timestamp: Mapped[datetime] = mapped_column()
    passes: Mapped[int] = mapped_column()


class StarPassModel(SQLModel):
    __tablename__ = 'star_passes'
    _team_jam_id: Mapped[int] = mapped_column(ForeignKey('team_jams._id'), init=False)
    _trip_id: Mapped[int | None] = mapped_column(
        ForeignKey('trips._id', ondelete='CASCADE'), init=False
    )
    timestamp: Mapped[datetime] = mapped_column()

    trip: Mapped[TripModel | None] = relationship(foreign_keys=[_trip_id])


class TeamJamModel(SQLModel):
    __tablename__ = 'team_jams'
    _team_id: Mapped[int | None] = mapped_column(ForeignKey('teams._id'), init=False)

    team: Mapped[TeamModel] = relationship(foreign_keys=[_team_id], lazy='selectin')

    lead: Mapped[datetime | None] = mapped_column(default=None)
    lost: Mapped[bool] = mapped_column(default=False)
    star_passes: Mapped[list[StarPassModel]] = relationship(init=False, lazy='selectin')
    trips: Mapped[list[TripModel]] = relationship(
        init=False, lazy='selectin', order_by=[TripModel.timestamp]
    )

    def add_trip(self, passes: int, timestamp: datetime | None = None) -> TripModel:
        if timestamp is None:
            timestamp = datetime.now()
        trip: TripModel = TripModel(timestamp=timestamp, passes=passes)
        self.trips.append(trip)
        return trip

    def add_star_pass(self, timestamp: datetime | None = None) -> StarPassModel:
        if timestamp is None:
            timestamp = datetime.now()
        trip: TripModel | None = self.trips[-1] if len(self.trips) > 0 else None
        star_pass: StarPassModel = StarPassModel(timestamp=timestamp, trip=trip)
        self.star_passes.append(star_pass)
        return star_pass


class JamModel(AbstractOneShotModel):
    __tablename__ = 'jams'
    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts._id'), init=False)
    _home_team_jam_id: Mapped[int] = mapped_column(
        ForeignKey('team_jams._id', ondelete='SET NULL'), default=None
    )
    _away_team_jam_id: Mapped[int] = mapped_column(
        ForeignKey('team_jams._id', ondelete='SET NULL'), default=None
    )

    bout: Mapped[GenericBoutModel] = relationship(
        foreign_keys=[_bout_id], init=False
    )

    period: Mapped[int] = mapped_column(index=True, kw_only=True)
    jam: Mapped[int] = mapped_column(index=True, kw_only=True)
    stop_reason: Mapped[str | None] = mapped_column(default=None, init=False)

    home: Mapped[TeamJamModel] = relationship(
        foreign_keys=[_home_team_jam_id], kw_only=True, lazy='joined'
    )
    away: Mapped[TeamJamModel] = relationship(
        foreign_keys=[_away_team_jam_id], kw_only=True, lazy='joined'
    )

    @declared_attr
    @classmethod
    def __table_args__(cls) -> Any:
        return super().__table_args__ + (
            UniqueConstraint(cls._bout_id, cls.period, cls.jam),
            UniqueConstraint(cls._home_team_jam_id),
            UniqueConstraint(cls._away_team_jam_id),
            CheckConstraint('_home_team_jam_id != _away_team_jam_id'),
            CheckConstraint("""(_home_team_jam_id IS NOT NULL
                                AND _away_team_jam_id IS NOT NULL)
                               OR start_timestamp IS NULL"""),
        )

    def __getitem__(self, team_name: TeamName) -> TeamJamModel:
        if team_name not in {'home', 'away'}:
            raise KeyError(f'Unknown team name ({team_name=})')
        return self.home if team_name == 'home' else self.away

    def lead_is_declared(self) -> bool:
        return self.home.lead is not None or self.away.lead is not None
