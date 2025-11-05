from __future__ import annotations

from datetime import datetime  # noqa: TC003
from typing import TYPE_CHECKING, Literal, override

from core.database import SQLModel
from sqlalchemy import CheckConstraint, Constraint, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .models import (
    CHILD_RELATIONSHIP,
    PARENT_RELATIONSHIP,
    AbstractOneShotModel,
    CacheableModel,
)

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
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[_team_jam_id],
        lazy='joined',
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
    _jam_id: Mapped[int | None] = mapped_column(ForeignKey('jams.id'))
    _is_away: Mapped[bool] = mapped_column()

    team: Mapped[TeamModel | None] = relationship(
        cascade=PARENT_RELATIONSHIP, foreign_keys=[_team_id], lazy='selectin'
    )
    jam: Mapped[JamModel] = relationship(
        back_populates='_team_jams',
        cascade=PARENT_RELATIONSHIP,
        lazy='selectin',
    )
    events: Mapped[list[TripEventModel]] = relationship(
        back_populates='team_jam',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=[TripEventModel.timestamp],
    )

    __table_args__: tuple[Constraint, ...] = (
        UniqueConstraint(_jam_id, _is_away),
        CheckConstraint('0 <= _is_away <= 1'),
    )

    def __init__(self, team: TeamModel, is_away: bool) -> None:
        super().__init__(team=team, _is_away=is_away)

    @property
    @override
    def parents(self) -> tuple[SQLModel | None, ...]:
        return (self.jam,)


class JamModel(AbstractOneShotModel, CacheableModel):
    __tablename__: str = 'jams'

    bout_id: Mapped[int | None] = mapped_column(ForeignKey('bouts.id'))

    num: Mapped[int] = mapped_column(index=True)
    period: Mapped[int] = mapped_column(index=True)
    stop_reason: Mapped[str | None] = mapped_column(default=None)

    _team_jams: Mapped[list[TeamJamModel]] = relationship(
        back_populates='jam',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by='TeamJamModel._is_away',
    )
    bout: Mapped[GenericBoutModel] = relationship(
        cascade=PARENT_RELATIONSHIP, foreign_keys=[bout_id], lazy='selectin'
    )

    def __init__(
        self, period_num: int, jam_num: int, home: TeamModel, away: TeamModel
    ) -> None:
        super().__init__(
            period=period_num,
            jam=jam_num,
            _team_jams=[
                TeamJamModel(home, False),
                TeamJamModel(away, True),
            ],
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
        return (self.__tablename__, self.bout_id, self.period, self.num)

    @property
    def home(self) -> TeamJamModel:
        return self._team_jams[0]

    @property
    def away(self) -> TeamJamModel:
        return self._team_jams[1]
