from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Literal, override

from sqlalchemy import CheckConstraint, ForeignKey, UniqueConstraint
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .models import AbstractOneShotModel, CacheableModel, SQLModel

if TYPE_CHECKING:
    from .bout import GenericBoutModel
    from .team import TeamModel

type TeamName = Literal['home', 'away']


class TripModel(SQLModel):
    __tablename__: str = 'trips'

    _team_jam_id: Mapped[int] = mapped_column(ForeignKey('team_jams.id'))
    passes: Mapped[int] = mapped_column()
    timestamp: Mapped[datetime] = mapped_column()

    _team_jam: Mapped[TeamJamModel | None] = relationship(
        foreign_keys=[_team_jam_id], lazy='joined'
    )

    @property
    @override
    def parents(self) -> tuple[SQLModel | None, ...]:
        return (self._team_jam,)


class StarPassModel(SQLModel):
    __tablename__: str = 'star_passes'

    _team_jam_id: Mapped[int] = mapped_column(ForeignKey('team_jams.id'))
    _trip_id: Mapped[int | None] = mapped_column(
        ForeignKey('trips.id', ondelete='CASCADE')
    )
    timestamp: Mapped[datetime] = mapped_column()

    _team_jam: Mapped[TeamJamModel | None] = relationship(
        foreign_keys=[_team_jam_id], lazy='joined'
    )
    trip: Mapped[TripModel | None] = relationship(foreign_keys=[_trip_id])

    @property
    @override
    def parents(self) -> tuple[SQLModel | None, ...]:
        return (self._team_jam,)


class TeamJamModel(SQLModel):
    __tablename__: str = 'team_jams'

    _team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))
    lead: Mapped[datetime | None] = mapped_column(default=None)
    lost: Mapped[bool] = mapped_column(default=False)

    _home: Mapped[JamModel | None] = relationship(
        foreign_keys='JamModel._home_team_jam_id'
    )
    _away: Mapped[JamModel | None] = relationship(
        foreign_keys='JamModel._away_team_jam_id'
    )
    team: Mapped[TeamModel | None] = relationship(
        foreign_keys=[_team_id], lazy='selectin'
    )
    star_passes: Mapped[list[StarPassModel]] = relationship(
        back_populates='_team_jam', lazy='selectin'
    )
    trips: Mapped[list[TripModel]] = relationship(
        back_populates='_team_jam', lazy='selectin', order_by=[TripModel.timestamp]
    )

    def __init__(self, team: TeamModel) -> None:
        super().__init__(team=team)
        self.lead = None
        self.lost = False

    @property
    @override
    def parents(self) -> tuple[SQLModel | None, ...]:
        if self._home is not None:
            return (self._home,)
        elif self._away is not None:
            return (self._away,)
        else:
            raise RuntimeError('This TeamJam does not have a parent Jam')

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


class JamModel(AbstractOneShotModel, CacheableModel):
    __tablename__: str = 'jams'

    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))
    _away_team_jam_id: Mapped[int] = mapped_column(
        ForeignKey('team_jams.id', ondelete='SET NULL')
    )
    _home_team_jam_id: Mapped[int] = mapped_column(
        ForeignKey('team_jams.id', ondelete='SET NULL')
    )
    jam: Mapped[int] = mapped_column(index=True)
    period: Mapped[int] = mapped_column(index=True)
    stop_reason: Mapped[str | None] = mapped_column(default=None)

    away: Mapped[TeamJamModel] = relationship(
        back_populates='_away',
        foreign_keys=[_away_team_jam_id],
        lazy='joined',
    )
    bout: Mapped[GenericBoutModel] = relationship(foreign_keys=[_bout_id])
    home: Mapped[TeamJamModel] = relationship(
        back_populates='_home',
        foreign_keys=[_home_team_jam_id],
        lazy='joined',
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
    @override
    def parents(self) -> tuple[SQLModel | None, ...]:
        return (self.bout,)

    @property
    @override
    def key(self) -> tuple[str, int, int, int]:
        return (self.__tablename__, self._bout_id, self.period, self.jam)

    def lead_is_declared(self) -> bool:
        return self.home.lead is not None or self.away.lead is not None
