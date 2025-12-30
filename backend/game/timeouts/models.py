"""The Timeout model and associated business logic."""

from __future__ import annotations

from datetime import timedelta  # noqa: TC003
from typing import TYPE_CHECKING, Any, override

from core import PARENT_RELATIONSHIP, BaseSQLModel
from game.bouts.models import BaseBout
from game.models import AbstractOneShotModel, CacheableSQLModel, CacheKey
from sqlalchemy import ForeignKey, select
from sqlalchemy.orm import (
    Mapped,
    MappedSQLExpression,
    column_property,
    mapped_column,
    relationship,
)
from sqlalchemy.sql.schema import Constraint, UniqueConstraint

if TYPE_CHECKING:
    from game.jams.models import BaseJam
    from game.teams.models import BaseTeam


class BaseTimeout(AbstractOneShotModel, CacheableSQLModel):
    """An abstract Timeout without any associated ruleset."""

    bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))
    jam_id: Mapped[int | None] = mapped_column(ForeignKey('jams.id'))
    team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))

    num: Mapped[int] = mapped_column()
    clock_elapsed: Mapped[timedelta | None] = mapped_column(default=None)
    team_is_officials: Mapped[bool] = mapped_column(default=False)
    is_review: Mapped[bool] = mapped_column(default=False)
    details: Mapped[str] = mapped_column(default='')
    result: Mapped[str] = mapped_column(default='')
    retained: Mapped[bool] = mapped_column(default=False)

    bout: Mapped[BaseBout] = relationship(
        back_populates='timeouts',
        cascade=PARENT_RELATIONSHIP,
    )
    jam: Mapped[BaseJam | None] = relationship(
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[jam_id],
    )
    team: Mapped[BaseTeam | None] = relationship(
        back_populates='timeouts',
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[team_id],
    )

    ruleset: MappedSQLExpression[str] = column_property(
        select(BaseBout.ruleset).where(BaseBout.id == bout_id).scalar_subquery()
    )

    __tablename__: str = 'timeouts'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_abstract': True,
        'polymorphic_on': ruleset,
    }
    __table_args__: tuple[Constraint, ...] = (UniqueConstraint('bout_id', 'num'),)

    def __init__(self, bout: BaseBout, num: int) -> None:
        super().__init__(bout=bout, bout_id=bout.id, num=num)

    @override
    def cache_key(self) -> CacheKey:
        return (self.__tablename__, self.bout_id, self.id)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (await self.awaitable_attrs.bout, await self.awaitable_attrs.team)

    def set_type(self, is_review: bool) -> None: ...

    def set_team(self, team: BaseTeam | None) -> None: ...

    def set_retained(self, retained: bool) -> None: ...
