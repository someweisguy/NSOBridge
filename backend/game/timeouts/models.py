from __future__ import annotations

from datetime import timedelta
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
    from game.bouts.models import GenericBoutModel, GenericTeamModel
    from game.jams.models import JamModel


class TimeoutModel(AbstractOneShotModel, CacheableSQLModel):
    bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))
    jam_id: Mapped[int | None] = mapped_column(ForeignKey('jams.id'))
    team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))

    clock_elapsed: Mapped[timedelta] = mapped_column()
    details: Mapped[str | None] = mapped_column(default=None)
    is_review: Mapped[bool] = mapped_column(default=False)
    result: Mapped[str | None] = mapped_column(default=None)
    retained: Mapped[bool] = mapped_column(default=False)

    bout: Mapped[GenericBoutModel] = relationship(
        back_populates='timeouts',
        cascade=PARENT_RELATIONSHIP,
    )
    jam: Mapped[JamModel] = relationship(
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[jam_id],
    )
    team: Mapped[GenericTeamModel | None] = relationship(
        back_populates='timeouts',
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[team_id],
    )

    __tablename__: str = 'timeouts'

    def __init__(self, clock_elapsed: timedelta, jam: JamModel) -> None:
        # FIXME: don't require a Jam to call a Timeout
        super().__init__(clock_elapsed=clock_elapsed, jam=jam)

    @override
    def cache_key(self) -> tuple[Any, ...]:
        return (self.__tablename__, self.bout.id, self.bout.timeouts.index(self))
