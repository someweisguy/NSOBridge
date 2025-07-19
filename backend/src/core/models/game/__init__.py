from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import Engine, ForeignKey, UniqueConstraint, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship

engine: Engine = create_engine('sqlite+pysqlite:///:memory:', echo=True)


class SQLBase(DeclarativeBase):
    pass


class SQLBout(SQLBase):
    __tablename__ = 'bouts'
    id: Mapped[int] = mapped_column(primary_key=True)

    teams: Mapped[list[SQLTeam]] = relationship()

    intermission_clock: Mapped[SQLClock] = relationship()
    # FIXME: better one-to-many here
    # game_clock: Mapped[SQLClock] = relationship()
    # lineup_clock: Mapped[SQLClock] = relationship()
    # jam_clock: Mapped[SQLClock] = relationship()

    timeouts: Mapped[list[SQLTimeout]] = relationship()
    jams: Mapped[list[SQLJam]] = relationship()


class SQLTeam(SQLBase):
    __tablename__ = 'teams'
    id: Mapped[int] = mapped_column(primary_key=True)
    bout_id: Mapped[int] = mapped_column(ForeignKey(SQLBout.id))

    # TODO: roster

    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()
    score_offset: Mapped[int] = mapped_column()

    timeouts: Mapped[list[SQLTimeout]] = relationship()
    team_jams: Mapped[list[SQLTeamJam]] = relationship()


class SQLClock(SQLBase):
    __tablename__ = 'clocks'
    id: Mapped[int] = mapped_column(primary_key=True)
    bout_id: Mapped[int] = mapped_column(ForeignKey(SQLBout.id))

    start: Mapped[datetime | None] = mapped_column()
    elapsed: Mapped[timedelta] = mapped_column(default=timedelta(seconds=0))


class SQLTimeout(SQLBase):
    __tablename__ = 'timeouts'
    id: Mapped[int] = mapped_column(primary_key=True)
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
    id: Mapped[int] = mapped_column(primary_key=True)
    bout_id: Mapped[int] = mapped_column(ForeignKey(SQLBout.id))

    period: Mapped[int] = mapped_column(index=True)
    jam: Mapped[int] = mapped_column(index=True)

    start: Mapped[datetime] = mapped_column()
    stop: Mapped[datetime] = mapped_column()

    # FIXME: only 2 SQLTeamJams are allowed to be attached to this record
    # home: Mapped[SQLTeamJam] = relationship()
    # away: Mapped[SQLTeamJam] = relationship()

    stop_reason: Mapped[str | None] = mapped_column()  # TODO

    __table_args__ = (
        UniqueConstraint('bout_id', 'period', 'jam'),  # TODO: metadata naming
    )


class SQLTeamJam(SQLBase):
    __tablename__ = 'team_jams'
    id: Mapped[int] = mapped_column(primary_key=True)
    # jam_id: Mapped[int | None] = mapped_column(ForeignKey(SQLJam.id))
    team_id: Mapped[int | None] = mapped_column(ForeignKey(SQLTeam.id))

    lead: Mapped[bool] = mapped_column(default=False)
    lost: Mapped[bool] = mapped_column(default=False)
    _star_pass_trip_id: Mapped[int | None] = mapped_column(
        ForeignKey('trips.team_jam_id', ondelete='SET NULL'), default=None
    )

    _star_pass_trip: Mapped[SQLTrip | None] = relationship(
        foreign_keys='SQLTeamJam._star_pass_trip_id', post_update=True
    )
    trips: Mapped[list[SQLTrip]] = relationship(
        order_by='SQLTrip.timestamp', primaryjoin='SQLTeamJam.id == SQLTrip.team_jam_id'
    )

    @property
    def star_pass_trip(self) -> SQLTrip | None:
        return self._star_pass_trip

    @star_pass_trip.setter
    def star_pass_trip(self, other: SQLTrip | None) -> None:
        if other is not None and other not in self.trips:
            self.trips.append(other)
        self._star_pass_trip = other


class SQLTrip(SQLBase):
    __tablename__ = 'trips'
    id: Mapped[int] = mapped_column(primary_key=True)
    team_jam_id: Mapped[int] = mapped_column(ForeignKey(SQLTeamJam.id))

    timestamp: Mapped[datetime] = mapped_column()
    passes: Mapped[int] = mapped_column()


SQLBase.metadata.create_all(engine)


with Session(engine) as session:
    tj = SQLTeamJam(lead=False, lost=False)
    trip = SQLTrip(timestamp=datetime.now(), passes=0)
    tj.star_pass_trip = trip
    # tj.trips.append(trip)

    session.add(tj)

    session.commit()
    # session.refresh(trip)

    print(tj.trips)
