from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import Engine, ForeignKey, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

engine: Engine = create_engine('sqlite+pysqlite:///:memory:', echo=True)


class SQLBase(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True)


class SQLBout(SQLBase):
    __tablename__ = 'bouts'

    teams: Mapped[list[SQLTeam]] = relationship()

    intermission_clock: Mapped[SQLClock] = relationship()
    game_clock: Mapped[SQLClock] = relationship()
    lineup_clock: Mapped[SQLClock] = relationship()
    jam_clock: Mapped[SQLClock] = relationship()

    timeouts: Mapped[list[SQLTimeout]] = relationship()
    jams: Mapped[list[SQLJam]] = relationship()


class SQLTeam(SQLBase):
    __tablename__ = 'teams'
    bout_id: Mapped[int] = mapped_column(ForeignKey(SQLBout.id))

    # TODO: roster

    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()
    score_offset: Mapped[int] = mapped_column()

    timeouts: Mapped[list[SQLTimeout]] = relationship()
    team_jams: Mapped[list[SQLTeamJam]] = relationship()


class SQLClock(SQLBase):
    __tablename__ = 'clocks'
    bout_id: Mapped[int] = mapped_column(ForeignKey(SQLBout.id))

    start: Mapped[datetime | None] = mapped_column()
    elapsed: Mapped[timedelta] = mapped_column(default=timedelta(seconds=0))


class SQLTimeout(SQLBase):
    __tablename__ = 'timeouts'
    bout_id: Mapped[int] = mapped_column(ForeignKey(SQLBout.id))

    # TODO: index on period and jam
    period: Mapped[int] = mapped_column()
    jam: Mapped[int] = mapped_column()
    clock_elapsed: Mapped[timedelta] = mapped_column()

    start: Mapped[datetime] = mapped_column()
    stop: Mapped[datetime | None] = mapped_column()

    team_id: Mapped[int] = mapped_column(ForeignKey(SQLTeam.id))
    is_review: Mapped[bool] = mapped_column(default=False)

    details: Mapped[str | None] = mapped_column(default=None)
    result: Mapped[str | None] = mapped_column(default=None)
    retained: Mapped[bool] = mapped_column(default=False)


class SQLJam(SQLBase):
    __tablename__ = 'jams'
    bout_id: Mapped[int] = mapped_column(ForeignKey(SQLBout.id))

    period: Mapped[int] = mapped_column()
    jam: Mapped[int] = mapped_column()

    start: Mapped[datetime] = mapped_column()
    stop: Mapped[datetime] = mapped_column()

    # FIXME: only 2 SQLTeamJams are allowed to be attached to this record
    # home: Mapped[SQLTeamJam] = relationship()
    # away: Mapped[SQLTeamJam] = relationship()

    stop_reason: Mapped[str | None] = mapped_column()  # TODO


class SQLTeamJam(SQLBase):
    __tablename__ = 'team_jams'
    jam_id: Mapped[int] = mapped_column(ForeignKey(SQLJam.id))
    team_id: Mapped[int] = mapped_column(ForeignKey(SQLTeam.id))

    lead: Mapped[bool] = mapped_column(default=False)
    lost: Mapped[bool] = mapped_column(default=False)
    star_pass: Mapped[bool]

    trips: Mapped[list[SQLTrip]] = relationship()


class SQLTrip(SQLBase):
    __tablename__ = 'trips'
    team_jam_id: Mapped[int] = mapped_column(ForeignKey(SQLTeamJam.id))
    timestamp: Mapped[datetime] = mapped_column()
    passes: Mapped[int] = mapped_column()


SQLBase.metadata.create_all(engine)
