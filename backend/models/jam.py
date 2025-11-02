from __future__ import annotations

from datetime import datetime  # noqa: TC003
from typing import TYPE_CHECKING, Any, Literal, override

from core.database import SQLModel
from sqlalchemy import CheckConstraint, Constraint, ForeignKey, UniqueConstraint
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .models import AbstractOneShotModel, CacheableModel

if TYPE_CHECKING:
    from .bout import GenericBoutModel
    from .team import TeamModel

type TeamName = Literal['home', 'away']


class TripEventModel(SQLModel):
    __tablename__: str = 'trip_events'

    _team_jam_id: Mapped[int] = mapped_column(ForeignKey('team_jams.id'))
    timestamp: Mapped[datetime] = mapped_column()
    lead: Mapped[bool] = mapped_column(default=False)
    lost: Mapped[bool] = mapped_column(default=False)
    passes: Mapped[int | None] = mapped_column(default=None)
    star_pass: Mapped[bool] = mapped_column(default=False)

    team_jam: Mapped[TeamJamModel | None] = relationship(
        foreign_keys=[_team_jam_id], lazy='joined'
    )

    __table_args__: tuple[Constraint, ...] = (
        CheckConstraint('passes IS NULL OR (lead = 0 AND lost = 0 AND star_pass = 0)'),
    )

    @property
    @override
    def parents(self) -> tuple[SQLModel | None, ...]:
        return (self.team_jam,)


class TeamJamModel(SQLModel):
    __tablename__: str = 'team_jams'

    _team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))

    _home: Mapped[JamModel | None] = relationship(
        foreign_keys='JamModel._home_team_jam_id', lazy='joined'
    )
    _away: Mapped[JamModel | None] = relationship(
        foreign_keys='JamModel._away_team_jam_id', lazy='joined'
    )
    team: Mapped[TeamModel | None] = relationship(
        foreign_keys=[_team_id], lazy='selectin'
    )
    events: Mapped[list[TripEventModel]] = relationship(
        back_populates='team_jam', lazy='selectin', order_by=[TripEventModel.timestamp]
    )

    def __init__(self, team: TeamModel) -> None:
        super().__init__(team=team)

    @property
    @override
    def parents(self) -> tuple[SQLModel | None, ...]:
        if self._home is not None:
            return (self._home,)
        elif self._away is not None:
            return (self._away,)
        else:
            raise RuntimeError('This TeamJam does not have a parent Jam')


class JamModel(AbstractOneShotModel, CacheableModel):
    __tablename__: str = 'jams'

    bout_id: Mapped[int | None] = mapped_column(ForeignKey('bouts.id'))
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
    bout: Mapped[GenericBoutModel] = relationship(
        foreign_keys=[bout_id], lazy='selectin'
    )
    home: Mapped[TeamJamModel] = relationship(
        back_populates='_home',
        foreign_keys=[_home_team_jam_id],
        lazy='joined',
    )

    def __init__(
        self, period_num: int, jam_num: int, home: TeamModel, away: TeamModel
    ) -> None:
        super().__init__(
            period=period_num,
            jam=jam_num,
            home=TeamJamModel(home),
            away=TeamJamModel(away),
        )

    @declared_attr
    @classmethod
    def __table_args__(cls) -> Any:
        return super().__table_args__ + (
            UniqueConstraint(cls.bout_id, cls.period, cls.jam),
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
    def key(self) -> tuple[str, int | None, int, int]:
        return (self.__tablename__, self.bout_id, self.period, self.jam)
