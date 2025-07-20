from __future__ import annotations

from datetime import datetime, timedelta
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
    _clock_id: Mapped[int] = mapped_column(
        ForeignKey('clocks.id', ondelete='RESTRICT'), init=False
    )

    teams: Mapped[list[SQLTeam]] = relationship(back_populates='bout', init=False)
    clock: Mapped[SQLClock] = relationship(foreign_keys=[_clock_id])
    timeouts: Mapped[list[SQLTimeout]] = relationship(back_populates='bout', init=False)
    jams: Mapped[list[SQLJam]] = relationship(
        back_populates='bout', init=False, order_by=[SQLJam.period, SQLJam.jam]
    )

    def add_jam(self) -> SQLJam:
        period_num: int = 0
        jam_num: int = 0
        if len(self.jams) > 0:
            latest: SQLJam = self.jams[-1]
            period_num = latest.period
            jam_num = latest.jam
        jam: SQLJam = SQLJam(period=period_num, jam=jam_num)
        self.jams.append(jam)
        return jam


class SQLTimeout(SQLOneShot):
    __tablename__ = 'timeouts'
    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'), init=False)
    _team_id: Mapped[int] = mapped_column(ForeignKey('teams.id'), init=False)

    bout: Mapped[SQLBout] = relationship(init=False)
    period: Mapped[int] = mapped_column(index=True, kw_only=True)
    jam: Mapped[int] = mapped_column(index=True, kw_only=True)

    start_timestamp: Mapped[datetime] = mapped_column(use_existing_column=True)
    clock_elapsed: Mapped[timedelta] = mapped_column(
        TimedeltaAsMilliseconds, kw_only=True
    )
    team: Mapped[SQLTeam | None] = relationship(back_populates='timeouts', default=None)
    is_review: Mapped[bool] = mapped_column(default=False)

    details: Mapped[str | None] = mapped_column(default=None)
    result: Mapped[str | None] = mapped_column(default=None)
    retained: Mapped[bool] = mapped_column(default=False)
