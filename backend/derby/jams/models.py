from __future__ import annotations

from datetime import datetime  # noqa: TC003
from typing import TYPE_CHECKING, Literal

from clocks.models import AbstractOneShotModel
from models import (
    CHILD_RELATIONSHIP,
    PARENT_RELATIONSHIP,
    BaseSQLModel,
    CacheableSQLModel,
)
from sqlalchemy import CheckConstraint, Constraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from bouts.models import GenericBoutModel, GenericTeamModel

type TeamName = Literal['home', 'away']


class TripEventModel(BaseSQLModel):
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

    __tablename__: str = 'trip_events'
    __table_args__: tuple[Constraint, ...] = (
        CheckConstraint('passes IS NULL OR (lead = 0 AND lost = 0 AND star_pass = 0)'),
    )


class TeamJamModel(BaseSQLModel):
    _team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))
    _jam_id: Mapped[int | None] = mapped_column(ForeignKey('jams.id'))

    jam: Mapped[JamModel] = relationship(
        back_populates='team_jams',
        cascade=PARENT_RELATIONSHIP,
        lazy='selectin',
    )
    team: Mapped[GenericTeamModel | None] = relationship(
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[_team_id],
        lazy='selectin',
    )
    events: Mapped[list[TripEventModel]] = relationship(
        back_populates='team_jam',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=[TripEventModel.timestamp],
    )

    __tablename__: str = 'team_jams'

    def __init__(self, team: GenericTeamModel) -> None:
        super().__init__(team=team)


class JamModel(AbstractOneShotModel, CacheableSQLModel):
    bout_id: Mapped[int | None] = mapped_column(ForeignKey('bouts.id'))

    num: Mapped[int] = mapped_column(index=True)
    period: Mapped[int] = mapped_column(index=True)
    stop_reason: Mapped[str | None] = mapped_column(default=None)

    bout: Mapped[GenericBoutModel] = relationship(
        back_populates='jams',
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[bout_id],
        lazy='selectin',
    )
    team_jams: Mapped[list[TeamJamModel]] = relationship(
        back_populates='jam',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
    )

    __tablename__: str = 'jams'

    def __init__(
        self,
        period_num: int,
        jam_num: int,
        teams: list[GenericTeamModel],
    ) -> None:
        super().__init__(
            period=period_num,
            num=jam_num,
            team_jams=[TeamJamModel(team) for team in teams],
        )
