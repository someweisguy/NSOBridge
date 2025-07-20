from __future__ import annotations

from datetime import timedelta
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.game.base import SQLBase, TimedeltaAsMilliseconds
from core.models.game.jam import SQLJam
from core.models.game.time import SQLOneShot

if TYPE_CHECKING:
    from core.models.game.team import SQLTeam
    from core.models.game.time import SQLClock


class SQLBout(SQLBase):
    __tablename__ = 'bouts'

    teams: Mapped[list[SQLTeam]] = relationship(init=False)

    _game_clock_id: Mapped[int] = mapped_column(ForeignKey('clocks.id'), init=False)
    game_clock: Mapped[SQLClock] = relationship(foreign_keys=[_game_clock_id])

    # intermission_clock: Mapped[SQLClock] = relationship()
    # FIXME: better one-to-many here
    # game_clock: Mapped[SQLClock] = relationship()
    # lineup_clock: Mapped[SQLClock] = relationship()
    # jam_clock: Mapped[SQLClock] = relationship()

    timeouts: Mapped[list[SQLTimeout]] = relationship(back_populates='bout', init=False)
    jams: Mapped[list[SQLJam]] = relationship(
        back_populates='bout', init=False, order_by=[SQLJam.period, SQLJam.jam]
    )


class SQLTimeout(SQLOneShot):
    __tablename__ = 'timeouts'
    _bout_id: Mapped[int] = mapped_column(
        ForeignKey('bouts.id'), index=True, init=False
    )
    bout: Mapped[SQLBout] = relationship(init=False)

    period: Mapped[int] = mapped_column(index=True, kw_only=True)
    jam: Mapped[int] = mapped_column(index=True, kw_only=True)

    clock_elapsed: Mapped[timedelta] = mapped_column(
        TimedeltaAsMilliseconds, kw_only=True
    )
    _team_id: Mapped[int] = mapped_column(ForeignKey('teams.id'), init=False)
    team: Mapped[SQLTeam | None] = relationship(back_populates='timeouts', default=None)
    is_review: Mapped[bool] = mapped_column(default=False)

    details: Mapped[str | None] = mapped_column(default=None)
    result: Mapped[str | None] = mapped_column(default=None)
    retained: Mapped[bool] = mapped_column(default=False)
