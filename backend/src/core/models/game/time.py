from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from core.models.game.base import SQLBase


class SQLClock(SQLBase):
    __tablename__ = 'clocks'
    start: Mapped[datetime | None] = mapped_column(default=None, init=False)
    elapsed: Mapped[timedelta] = mapped_column(default=timedelta(seconds=0), init=False)
    alarm: Mapped[timedelta] = mapped_column()


class SQLOneShot(SQLBase):
    start: Mapped[datetime | None] = mapped_column(default=None)
    stop: Mapped[datetime | None] = mapped_column(default=None)
