from __future__ import annotations

from datetime import datetime, timedelta
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.game.base import SQLBase

if TYPE_CHECKING:
    from core.models.game.jam import SQLJam
    from core.models.game.team import SQLTeam


class SQLBout(SQLBase):
    __tablename__ = 'bouts'

    teams: Mapped[list[SQLTeam]] = relationship(init=False)

    # intermission_clock: Mapped[SQLClock] = relationship()
    # FIXME: better one-to-many here
    # game_clock: Mapped[SQLClock] = relationship()
    # lineup_clock: Mapped[SQLClock] = relationship()
    # jam_clock: Mapped[SQLClock] = relationship()

    timeouts: Mapped[list[SQLTimeout]] = relationship(back_populates='bout', init=False)
    jams: Mapped[list[SQLJam]] = relationship(back_populates='bout', init=False)


class SQLTimeout(SQLBase):
    __tablename__ = 'timeouts'
    _bout_id: Mapped[int] = mapped_column(
        ForeignKey('bouts.id'), index=True, init=False
    )
    bout: Mapped[SQLBout] = relationship()
    
    period: Mapped[int] = mapped_column(index=True)
    jam: Mapped[int] = mapped_column(index=True)

    start: Mapped[datetime] = mapped_column()
    stop: Mapped[datetime | None] = mapped_column()
    clock_elapsed: Mapped[timedelta] = mapped_column()
    _team_id: Mapped[int] = mapped_column(ForeignKey('teams.id'))
    team: Mapped[SQLTeam] = relationship(back_populates='timeouts')
    is_review: Mapped[bool] = mapped_column(default=False)

    details: Mapped[str | None] = mapped_column(default=None)
    result: Mapped[str | None] = mapped_column(default=None)
    retained: Mapped[bool] = mapped_column(default=False)
