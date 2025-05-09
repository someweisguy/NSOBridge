from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Final, Literal

from model.protocols import TeamAttribute


@dataclass(slots=True)
class Clock:
    start_timestamp: datetime | None = None
    elapsed: timedelta = timedelta(seconds=0)
    alarm: timedelta | None = None

    def set_alarm(
        self,
        hours: float = 0,
        minutes: float = 0,
        seconds: float = 0,
        milliseconds: float = 0,
    ) -> None:
        new_alarm: timedelta | None = timedelta(
            hours=hours, minutes=minutes, seconds=seconds, milliseconds=milliseconds
        )
        if new_alarm.total_seconds() <= 0:
            new_alarm = None
        self.alarm = new_alarm

    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError('This clock is already running')
        self.start_timestamp = timestamp

    def stop(self, timestamp: datetime) -> None:
        if self.start_timestamp is None:
            raise RuntimeError('This clock has already stopped')
        if self.start_timestamp > timestamp:
            raise ValueError('Timestamp is invalid')
        self.elapsed += timestamp - self.start_timestamp
        self.start_timestamp = None

    def is_running(self) -> bool:
        return self.start_timestamp is not None

    def reset(self, alarm: timedelta | None = None) -> None:
        self.start_timestamp = None
        self.elapsed = timedelta(seconds=0)
        self.alarm = alarm


@dataclass(slots=True)
class Timeout:
    timeouts_remaining: int = field(default=3)
    official_reviews_remaining: int = field(default=1)


@dataclass(slots=True)
class Timer(TeamAttribute[Timeout]):
    intermission_clock: Final[Clock] = field(init=False, default_factory=Clock)
    game_clock: Final[Clock] = field(init=False, default_factory=Clock)
    lineup_clock: Final[Clock] = field(init=False, default_factory=Clock)
    jam_clock: Final[Clock] = field(init=False, default_factory=Clock)
    timeout_clock: Final[Clock] = field(init=False, default_factory=Clock)
    home: Final[Timeout] = field(init=False, default_factory=Timeout)  # type: ignore[assignment]
    away: Final[Timeout] = field(init=False, default_factory=Timeout)  # type: ignore[assignment]

    def get_game_state(
        self,
    ) -> Literal['intermission', 'lineup', 'jam', 'timeout', 'unofficial', 'final']:
        if self.lineup_clock.is_running():
            return 'lineup'
        elif self.jam_clock.is_running():
            return 'jam'
        elif self.timeout_clock.is_running():
            return 'timeout'
        else: 
            return 'intermission'

    def stop_all_clocks(self, timestamp: datetime) -> None:
        for clock in [self.game_clock, self.jam_clock, self.timeout_clock]:
            clock.stop(timestamp)
