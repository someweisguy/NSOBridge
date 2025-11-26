from __future__ import annotations

from datetime import timedelta  # noqa: TC003
from typing import TYPE_CHECKING, Any, override

from game.abstract import AbstractOneShotModel
from game.bouts.models import BaseBout
from models import PARENT_RELATIONSHIP, CacheableSQLModel
from sqlalchemy import ForeignKey
from sqlalchemy.orm import (
    Mapped,
    MappedSQLExpression,
    column_property,
    mapped_column,
    relationship,
)
from sqlalchemy.sql._selectable_constructors import select

if TYPE_CHECKING:
    from game.jams.models import BaseJam
    from game.teams.models import BaseTeam


class BaseTimeout(AbstractOneShotModel, CacheableSQLModel):
    bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))
    jam_id: Mapped[int | None] = mapped_column(ForeignKey('jams.id'))
    team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))

    clock_elapsed: Mapped[timedelta] = mapped_column()
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

    def __init__(self, clock_elapsed: timedelta) -> None:
        super().__init__(clock_elapsed=clock_elapsed)

    @override
    def cache_key(self) -> tuple[Any, ...]:
        return (self.__tablename__, self.bout.id, self.bout.timeouts.index(self))

    def set_type(self, team: BaseTeam | None, is_review: bool) -> None: ...

    def set_retained(self, retained: bool) -> None: ...
