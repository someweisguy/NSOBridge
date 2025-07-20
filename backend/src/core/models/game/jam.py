from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, UniqueConstraint
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.game.base import SQLBase
from core.models.game.time import SQLOneShot

if TYPE_CHECKING:
    from core.models.game.bout import SQLBout


class SQLTrip(SQLBase):
    __tablename__ = 'trips'
    _team_jam_id: Mapped[int] = mapped_column(ForeignKey('team_jams.id'), init=False)

    timestamp: Mapped[datetime] = mapped_column()
    passes: Mapped[int] = mapped_column()


class SQLTeamJam(SQLBase):
    __tablename__ = 'team_jams'
    _team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'), init=False)
    _star_pass_trip_id: Mapped[int | None] = mapped_column(
        ForeignKey('team_jams.id', ondelete='SET NULL'), default=None, init=False
    )

    lead: Mapped[bool] = mapped_column(default=False)
    lost: Mapped[bool] = mapped_column(default=False)

    star_pass_trip: Mapped[SQLTrip | None] = relationship(
        default=None,
        foreign_keys=[_star_pass_trip_id],
        init=False,
        post_update=True,
        primaryjoin=(_star_pass_trip_id == SQLTrip.id),
    )
    trips: Mapped[list[SQLTrip]] = relationship(
        init=False, order_by=[SQLTrip.timestamp]
    )

    def add_trip(self, passes: int, timestamp: datetime | None = None) -> SQLTrip:
        if timestamp is None:
            timestamp = datetime.now()
        trip: SQLTrip = SQLTrip(timestamp=timestamp, passes=passes)
        self.trips.append(trip)
        return trip


class SQLJam(SQLOneShot):
    __tablename__ = 'jams'
    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'), init=False)
    _home_team_jam_id: Mapped[int | None] = mapped_column(
        ForeignKey('team_jams.id', ondelete='SET NULL'), default=None
    )
    _away_team_jam_id: Mapped[int | None] = mapped_column(
        ForeignKey('team_jams.id', ondelete='SET NULL'), default=None
    )

    bout: Mapped[SQLBout] = relationship(init=False)

    period: Mapped[int] = mapped_column(index=True, kw_only=True)
    jam: Mapped[int] = mapped_column(index=True, kw_only=True)
    stop_reason: Mapped[str | None] = mapped_column(default=None, init=False)

    home: Mapped[SQLTeamJam | None] = relationship(
        foreign_keys=[_home_team_jam_id], init=False
    )
    away: Mapped[SQLTeamJam | None] = relationship(
        foreign_keys=[_away_team_jam_id], init=False
    )

    @declared_attr
    def __table_args__(cls):
        return super().__table_args__ + (
            UniqueConstraint(cls._bout_id, cls.period, cls.jam),
            UniqueConstraint(cls._home_team_jam_id),
            UniqueConstraint(cls._away_team_jam_id),
            CheckConstraint('_home_team_jam_id != _away_team_jam_id'),
        )
