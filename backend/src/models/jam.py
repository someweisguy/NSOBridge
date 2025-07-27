from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from sqlalchemy import CheckConstraint, ForeignKey, UniqueConstraint
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.models import SQLModel
from models.team import TeamModel
from models.time import AbstractOneShotModel

type TeamName = Literal['home', 'away']


class TripModel(SQLModel):
    __tablename__ = 'trips'
    _team_jam_id: Mapped[int] = mapped_column(ForeignKey('team_jams._id'), init=False)
    timestamp: Mapped[datetime] = mapped_column()
    passes: Mapped[int] = mapped_column()


class TeamJamModel(SQLModel):
    __tablename__ = 'team_jams'
    _team_id: Mapped[int | None] = mapped_column(ForeignKey('teams._id'), init=False)
    # FIXME
    # _star_pass_trip_id: Mapped[int | None] = mapped_column(
    #     ForeignKey('team_jams._id', ondelete='SET NULL'), default=None, init=False
    # )

    team: Mapped[TeamModel] = relationship(foreign_keys=[_team_id], lazy='selectin')

    lead: Mapped[bool] = mapped_column(default=False)
    lost: Mapped[bool] = mapped_column(default=False)

    # FIXME
    # star_pass_trip: Mapped[TripModel | None] = relationship(
    #     default=None,
    #     foreign_keys=[_star_pass_trip_id],
    #     init=False,
    #     post_update=True,
    #     primaryjoin=(_star_pass_trip_id == TripModel._id),
    # )
    trips: Mapped[list[TripModel]] = relationship(
        init=False, lazy='selectin', order_by=[TripModel.timestamp]
    )

    def add_trip(self, passes: int, timestamp: datetime | None = None) -> TripModel:
        if timestamp is None:
            timestamp = datetime.now()
        trip: TripModel = TripModel(timestamp=timestamp, passes=passes)
        self.trips.append(trip)
        return trip


class JamModel(AbstractOneShotModel):
    __tablename__ = 'jams'
    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts._id'), init=False)
    _home_team_jam_id: Mapped[int | None] = mapped_column(
        ForeignKey('team_jams._id', ondelete='SET NULL'), default=None
    )
    _away_team_jam_id: Mapped[int | None] = mapped_column(
        ForeignKey('team_jams._id', ondelete='SET NULL'), default=None
    )

    period: Mapped[int] = mapped_column(index=True, kw_only=True)
    jam: Mapped[int] = mapped_column(index=True, kw_only=True)
    stop_reason: Mapped[str | None] = mapped_column(default=None, init=False)

    _home: Mapped[TeamJamModel | None] = relationship(
        foreign_keys=[_home_team_jam_id], lazy='joined', init=False
    )
    _away: Mapped[TeamJamModel | None] = relationship(
        foreign_keys=[_away_team_jam_id], lazy='joined', init=False
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

    @property
    def home(self) -> TeamJamModel:
        if self._home is None:
            raise RuntimeError('There is no Home Team assigned to this Jam')
        return self._home

    @property
    def away(self) -> TeamJamModel:
        if self._away is None:
            raise RuntimeError('There is no Away Team assigned to this Jam')
        return self._away

    def assign_teams(self, home: TeamModel, away: TeamModel) -> None:
        self._home = TeamJamModel(team=home)
        self._away = TeamJamModel(team=away)

    def start(self, timestamp: datetime) -> None:
        if self._home is None or self._away is None:
            raise RuntimeError('A Jam cannot be started without assigning Teams')
        return super().start(timestamp)

    def lead_is_declared(self) -> bool:
        if self._home is None or self._away is None:
            return False
        return self.home.lead or self.away.lead
