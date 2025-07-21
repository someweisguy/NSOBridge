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

if TYPE_CHECKING:
    from core.models.game.bout import SQLBout, SQLTimeout
    from core.models.game.jam import SQLTeamJam


class SQLRoster(SQLBase):
    __tablename__ = 'rosters'


class SQLTeam(SQLBase):
    __tablename__ = 'teams'
    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'), init=False)
    _roster_id: Mapped[int] = mapped_column(ForeignKey('rosters.id'), init=False)

    bout: Mapped[SQLBout] = relationship(back_populates='teams', init=False)
    roster: Mapped[SQLRoster] = relationship(foreign_keys=[_roster_id])

    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()
    score_offset: Mapped[int] = mapped_column(default=0, init=False)

    timeouts: Mapped[list[SQLTimeout]] = relationship(back_populates='team', init=False)
    team_jams: Mapped[list[SQLTeamJam]] = relationship(init=False)
