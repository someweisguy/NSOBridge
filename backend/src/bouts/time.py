from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Final
from uuid import UUID

from . import Queryable, QueryKey
from .attribute import TeamAttribute


@dataclass(slots=True)
class Clock:
    start_timestamp: datetime | None = None
    elapsed: timedelta = timedelta(seconds=0)
    alarm: timedelta | None = None

    def set_alarm(self, hours: float = 0, minutes: float = 0,
                  seconds: float = 0, milliseconds: float = 0) -> None:
        new_alarm: timedelta | None = timedelta(hours=hours, minutes=minutes,
                                                seconds=seconds,
                                                milliseconds=milliseconds)
        if new_alarm.total_seconds() <= 0:
            new_alarm = None
        self.alarm = new_alarm

    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError('This Clock is already running')
        self.start_timestamp = timestamp

    def stop(self, timestamp: datetime) -> None:
        if self.start_timestamp is None:
            raise RuntimeError('This Clock is already stopped')
        if self.start_timestamp > timestamp:
            raise ValueError('Stop timestamp is invalid')
        self.elapsed += timestamp - self.start_timestamp

    def is_running(self) -> bool:
        return self.start_timestamp is not None


@dataclass(slots=True)
class TeamTimeoutState:
    timeouts_remaining: int = field(default=3)
    official_reviews_remaining: int = field(default=1)


@dataclass(slots=True)
class TimeState(TeamAttribute[TeamTimeoutState], Queryable):
    game_clock: Final[Clock] = field(
        init=False, default_factory=Clock)
    jam_clock: Final[Clock] = field(
        init=False, default_factory=Clock)
    is_in_intermission: bool = field(init=False, default=True)
    is_in_lineup: bool = field(init=False, default=False)
    home: Final[TeamTimeoutState] = field(
        init=False, default_factory=TeamTimeoutState)
    away: Final[TeamTimeoutState] = field(
        init=False, default_factory=TeamTimeoutState)

    def get_query_key(self, bout_id: UUID) -> QueryKey:
        return (bout_id, 'time')
