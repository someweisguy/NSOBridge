from __future__ import annotations

from datetime import datetime  # noqa: TC003
from typing import TYPE_CHECKING, Any, Literal, override

from game.abstract import AbstractOneShotModel
from game.bouts.models import BaseBoutModel
from models import (
    CHILD_RELATIONSHIP,
    PARENT_RELATIONSHIP,
    BaseSQLModel,
    CacheableSQLModel,
)
from sqlalchemy import CheckConstraint, Constraint, ForeignKey, UniqueConstraint, select
from sqlalchemy.orm import (
    Mapped,
    column_property,
    declared_attr,
    mapped_column,
    relationship,
)

if TYPE_CHECKING:
    from game.teams.models import BaseTeamModel

type TeamName = Literal['home', 'away']


class BaseJamModel(AbstractOneShotModel, CacheableSQLModel):
    bout_id: Mapped[int | None] = mapped_column(ForeignKey('bouts.id'))

    num: Mapped[int] = mapped_column(index=True)
    period: Mapped[int] = mapped_column(index=True)
    stop_reason: Mapped[str | None] = mapped_column(default=None)

    bout: Mapped[BaseBoutModel] = relationship(
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

    # Define a column_property that fetches the type name
    ruleset = column_property(
        select(BaseBoutModel.ruleset)
        .where(BaseBoutModel.id == bout_id)
        .scalar_subquery()
    )

    __tablename__: str = 'jams'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_abstract': True,
        'polymorphic_on': ruleset,
    }

    @declared_attr
    def __table_args__(cls) -> Any:
        return super().__table_args__ + (UniqueConstraint('bout_id', 'num', 'period'),)

    @override
    def cache_key(self) -> tuple[Any, ...]:
        return (self.__tablename__, self.bout_id, self.period, self.num)


class TripEventModel(BaseSQLModel):
    team_jam_id: Mapped[int] = mapped_column(ForeignKey('team_jams.id'))
    timestamp: Mapped[datetime] = mapped_column()
    lead: Mapped[bool] = mapped_column(default=False)
    lost: Mapped[bool] = mapped_column(default=False)
    passes: Mapped[int | None] = mapped_column(default=None)
    star_pass: Mapped[bool] = mapped_column(default=False)

    team_jam: Mapped[TeamJamModel | None] = relationship(
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[team_jam_id],
        lazy='joined',
    )

    __tablename__: str = 'trip_events'
    __table_args__: tuple[Constraint, ...] = (
        CheckConstraint('passes IS NULL OR (lead = 0 AND lost = 0 AND star_pass = 0)'),
    )


class TeamJamModel(BaseSQLModel):
    team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))
    jam_id: Mapped[int | None] = mapped_column(ForeignKey('jams.id'))

    jam: Mapped[BaseJamModel] = relationship(
        back_populates='team_jams',
        cascade=PARENT_RELATIONSHIP,
        lazy='selectin',
    )
    team: Mapped[BaseTeamModel | None] = relationship(
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[team_id],
        lazy='selectin',
    )
    events: Mapped[list[TripEventModel]] = relationship(
        back_populates='team_jam',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=[TripEventModel.timestamp],
    )

    jam_num: Mapped[int] = column_property(
        select(BaseJamModel.num)
        .where(BaseJamModel.id == jam_id)
        .limit(1)
        .scalar_subquery()
    )
    period_num: Mapped[int] = column_property(
        select(BaseJamModel.period)
        .where(BaseJamModel.id == jam_id)
        .limit(1)
        .scalar_subquery()
    )

    __tablename__: str = 'team_jams'

    def __init__(self, team: BaseTeamModel) -> None:
        super().__init__(team=team)
