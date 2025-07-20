from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import (
    ForeignKey,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from core.models.game.base import SQLBase
from core.models.game.bout import SQLBout

if TYPE_CHECKING:
    from core.models.game.bout import SQLTimeout
    from core.models.game.jam import SQLTeamJam


class SQLTeam(SQLBase):
    __tablename__ = 'teams'
    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'), init=False)
    bout: Mapped[SQLBout] = relationship(back_populates='teams')

    # TODO: roster

    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()
    score_offset: Mapped[int] = mapped_column()

    timeouts: Mapped[list[SQLTimeout]] = relationship(back_populates='team')
    team_jams: Mapped[list[SQLTeamJam]] = relationship()
