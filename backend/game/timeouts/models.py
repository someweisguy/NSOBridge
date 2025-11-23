from __future__ import annotations

from datetime import timedelta  # noqa: TC003
from typing import TYPE_CHECKING, Any, override

from game.abstract import AbstractOneShotModel
from models import PARENT_RELATIONSHIP, CacheableSQLModel
from sqlalchemy import ForeignKey
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

if TYPE_CHECKING:
    from game.bouts.models import BaseBout
    from game.jams.models import BaseJam
    from game.teams.models import BaseTeam


class Timeout(AbstractOneShotModel, CacheableSQLModel):
    bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))
    jam_id: Mapped[int | None] = mapped_column(ForeignKey('jams.id'))
    team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))

    clock_elapsed: Mapped[timedelta] = mapped_column()
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

    __tablename__: str = 'timeouts'

    def __init__(self, clock_elapsed: timedelta, is_review: bool = False) -> None:
        super().__init__(clock_elapsed=clock_elapsed, is_review=is_review)

    @override
    def cache_key(self) -> tuple[Any, ...]:
        return (self.__tablename__, self.bout.id, self.bout.timeouts.index(self))
