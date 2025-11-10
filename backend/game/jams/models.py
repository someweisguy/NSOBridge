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
    MappedSQLExpression,
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
    team_jams: Mapped[list[BaseTeamJamModel]] = relationship(
        back_populates='jam',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
    )

    ruleset: MappedSQLExpression[str] = column_property(
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

    def lead_is_declared(self) -> bool:
        for team_jam in self.team_jams:
            if any(event.lead for event in team_jam.events):
                return True
        return False

    async def add_trip_event(self, event: TripEventModel) -> None: ...


class TripEventModel(BaseSQLModel):
    team_jam_id: Mapped[int | None] = mapped_column(ForeignKey('team_jams.id'))
    timestamp: Mapped[datetime] = mapped_column()
    lead: Mapped[bool] = mapped_column(default=False)
    lost: Mapped[bool] = mapped_column(default=False)
    passes: Mapped[int | None] = mapped_column(default=None)
    star_pass: Mapped[bool] = mapped_column(default=False)

    team_jam: Mapped[BaseTeamJamModel | None] = relationship(
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[team_jam_id],
        lazy='joined',
    )

    __tablename__: str = 'trip_events'
    __table_args__: tuple[Constraint, ...] = (
        CheckConstraint('passes IS NULL OR (lead = 0 AND lost = 0 AND star_pass = 0)'),
    )

    def __init__(
        self,
        timestamp: datetime,
        *,
        lead: bool = False,
        lost: bool = False,
        passes: int = 0,
        star_pass: bool = False,
    ) -> None:
        super().__init__(
            team_jam=None,
            timestamp=timestamp,
            lead=lead,
            lost=lost,
            passes=passes,
            star_pass=star_pass,
        )

    def is_empty(self) -> bool:
        return not any((self.lead, self.lost, self.passes, self.star_pass))


class BaseTeamJamModel(BaseSQLModel):
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

    ruleset: MappedSQLExpression[str] = column_property(
        select(BaseJamModel.ruleset)
        .where(BaseJamModel.id == jam_id)
        .limit(1)
        .scalar_subquery()
    )
    jam_num: MappedSQLExpression[int] = column_property(
        select(BaseJamModel.num)
        .where(BaseJamModel.id == jam_id)
        .limit(1)
        .scalar_subquery()
    )
    period_num: MappedSQLExpression[int] = column_property(
        select(BaseJamModel.period)
        .where(BaseJamModel.id == jam_id)
        .limit(1)
        .scalar_subquery()
    )

    __tablename__: str = 'team_jams'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_abstract': True,
        'polymorphic_on': ruleset,
    }

    def __init__(self, team: BaseTeamModel) -> None:
        super().__init__(team=team)
