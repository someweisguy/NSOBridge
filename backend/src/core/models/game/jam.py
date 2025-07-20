from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.game.base import SQLBase

if TYPE_CHECKING:
    from core.models.game.bout import SQLBout


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
        default=None,
        foreign_keys=[_star_pass_trip_id],
        init=False,
        post_update=True,
        primaryjoin='SQLTeamJam._star_pass_trip_id==SQLTrip.id',
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
