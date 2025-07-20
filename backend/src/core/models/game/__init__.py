from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import (
    CheckConstraint,
    Engine,
    ForeignKey,
    UniqueConstraint,
    create_engine,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    MappedAsDataclass,
    Session,
    mapped_column,
    relationship,
)

engine: Engine = create_engine('sqlite+pysqlite:///:memory:', echo=True)


class SQLBase(MappedAsDataclass, DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True, init=False)


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


class SQLTeam(SQLBase):
    __tablename__ = 'teams'
    bout_id: Mapped[int] = mapped_column(ForeignKey(SQLBout.id), init=False)

    # TODO: roster

    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()
    score_offset: Mapped[int] = mapped_column()

    timeouts: Mapped[list[SQLTimeout]] = relationship(back_populates='team')
    team_jams: Mapped[list[SQLTeamJam]] = relationship()


class SQLClock(SQLBase):
    __tablename__ = 'clocks'
    bout_id: Mapped[int] = mapped_column(ForeignKey(SQLBout.id))

    start: Mapped[datetime | None] = mapped_column()
    elapsed: Mapped[timedelta] = mapped_column(default=timedelta(seconds=0))


class SQLTimeout(SQLBase):
    __tablename__ = 'timeouts'
    bout_id: Mapped[int] = mapped_column(ForeignKey(SQLBout.id), index=True, init=False)
    period: Mapped[int] = mapped_column(index=True)
    jam: Mapped[int] = mapped_column(index=True)
    bout: Mapped[SQLBout] = relationship()

    start: Mapped[datetime] = mapped_column()
    stop: Mapped[datetime | None] = mapped_column()
    clock_elapsed: Mapped[timedelta] = mapped_column()
    _team_id: Mapped[int] = mapped_column(ForeignKey(SQLTeam.id))
    team: Mapped[SQLTeam] = relationship(back_populates='timeouts')
    is_review: Mapped[bool] = mapped_column(default=False)

    details: Mapped[str | None] = mapped_column(default=None)
    result: Mapped[str | None] = mapped_column(default=None)
    retained: Mapped[bool] = mapped_column(default=False)


class SQLTrip(SQLBase):
    __tablename__ = 'trips'
    team_jam_id: Mapped[int] = mapped_column(ForeignKey('team_jams.id'), init=False)

    timestamp: Mapped[datetime] = mapped_column()
    passes: Mapped[int] = mapped_column()


class SQLTeamJam(SQLBase):
    __tablename__ = 'team_jams'
    team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'), init=False)

    lead: Mapped[bool] = mapped_column(default=False)
    lost: Mapped[bool] = mapped_column(default=False)
    _star_pass_trip_id: Mapped[int | None] = mapped_column(
        ForeignKey('team_jams.id', ondelete='SET NULL'), default=None, init=False
    )

    _star_pass_trip: Mapped[SQLTrip | None] = relationship(
        default=None, foreign_keys=[_star_pass_trip_id], init=False, post_update=True,
        primaryjoin='SQLTeamJam._star_pass_trip_id==SQLTrip.id'
    )
    trips: Mapped[list[SQLTrip]] = relationship(
        init=False,
        order_by=[SQLTrip.timestamp],
        primaryjoin='SQLTeamJam.id==SQLTrip.team_jam_id',
    )

    @property
    def star_pass_trip(self) -> SQLTrip | None:
        return self._star_pass_trip

    @star_pass_trip.setter
    def star_pass_trip(self, other: SQLTrip | None) -> None:
        if other is not None and other.team_jam_id is None:
            self.trips.append(other)
        self._star_pass_trip = other


class SQLJam(SQLBase):
    __tablename__ = 'jams'
    bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'), init=False)
    bout: Mapped[SQLBout] = relationship(init=False)

    period: Mapped[int] = mapped_column(index=True)
    jam: Mapped[int] = mapped_column(index=True)

    _home_team_jam_id: Mapped[int | None] = mapped_column(
        ForeignKey('team_jams.id', ondelete='SET NULL'), default=None
    )
    _away_team_jam_id: Mapped[int | None] = mapped_column(
        ForeignKey('team_jams.id', ondelete='SET NULL'), default=None
    )
    home: Mapped[SQLTeamJam] = relationship(
        foreign_keys=[_home_team_jam_id], init=False
    )
    away: Mapped[SQLTeamJam] = relationship(
        foreign_keys=[_away_team_jam_id], init=False
    )

    start: Mapped[datetime | None] = mapped_column(default=None)
    stop: Mapped[datetime | None] = mapped_column(default=None, init=False)
    stop_reason: Mapped[str | None] = mapped_column(default=None, init=False)

    __table_args__ = (
        UniqueConstraint('bout_id', 'period', 'jam'),  # TODO: metadata naming
        CheckConstraint('_home_team_jam_id <> _away_team_jam_id'),
    )


SQLBase.metadata.create_all(engine)


with Session(engine) as session:
    bout = SQLBout()
    jam = SQLJam(period=0, jam=0)
    bout.jams.append(jam)

    session.add(bout)

    tj = SQLTeamJam(lead=False, lost=False)

    jam.home = tj

    session.add(tj)

    session.commit()
