from __future__ import annotations

from typing import Any, override

from game.abstract import AbstractOneShotModel
from game.bouts.models import BaseBout
from models import (
    CHILD_RELATIONSHIP,
    PARENT_RELATIONSHIP,
    CacheableSQLModel,
)
from pip._vendor.platformdirs.version import TYPE_CHECKING
from sqlalchemy import Constraint, ForeignKey, UniqueConstraint, select
from sqlalchemy.orm import (
    Mapped,
    MappedSQLExpression,
    column_property,
    declared_attr,
    mapped_column,
    relationship,
)

if TYPE_CHECKING:
    from game.team_jams.models import BaseTeamJam
    from game.trip_events.models import TripEvent


class BaseJam(AbstractOneShotModel, CacheableSQLModel):
    bout_id: Mapped[int | None] = mapped_column(ForeignKey('bouts.id'))

    num: Mapped[int] = mapped_column(index=True)
    period: Mapped[int] = mapped_column(index=True)
    stop_reason: Mapped[str | None] = mapped_column(default=None)

    bout: Mapped[BaseBout] = relationship(
        back_populates='jams',
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[bout_id],
        lazy='selectin',
    )
    team_jams: Mapped[list[BaseTeamJam]] = relationship(
        back_populates='jam',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
    )

    ruleset: MappedSQLExpression[str] = column_property(
        select(BaseBout.ruleset).where(BaseBout.id == bout_id).scalar_subquery()
    )

    __tablename__: str = 'jams'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_abstract': True,
        'polymorphic_on': ruleset,
    }

    @declared_attr
    def __table_args__(cls):
        return super().__table_args__ + (UniqueConstraint('bout_id', 'num', 'period'),)

    @override
    def cache_key(self) -> tuple[Any, ...]:
        return (self.__tablename__, self.bout_id, self.period, self.num)

    def lead_is_declared(self) -> bool:
        for team_jam in self.team_jams:
            if any(event.lead for event in team_jam.events):
                return True
        return False

    async def add_trip_event(self, event: TripEvent) -> None: ...
