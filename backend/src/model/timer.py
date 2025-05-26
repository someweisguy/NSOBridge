from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Final, Literal

from model.team import AbstractReferee, TeamString

type TeamOfficialString = TeamString | Literal['official']
type TimeoutType = Literal['timeout', 'review']


@dataclass(slots=True)
class Timer:
    start_timestamp: datetime | None = None
    elapsed: timedelta = field(init=False, default=timedelta(seconds=0))

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

    def reset(self) -> None:
        self.start_timestamp = None
        self.elapsed = timedelta(seconds=0)

    def get_elapsed_at_timestamp(self, timestamp: datetime) -> timedelta:
        elapsed = self.elapsed
        if self.start_timestamp is not None:
            elapsed += timestamp - self.start_timestamp
        return elapsed


@dataclass(slots=True)
class Clock(Timer):
    alarm: timedelta = field(init=False, default=timedelta(seconds=0))

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

    def reset(self, alarm: timedelta | None = None) -> None:
        self.start_timestamp = None
        self.elapsed = timedelta(seconds=0)
        self.alarm = alarm


@dataclass(slots=True, init=False)
class Timeout(Timer):
    period_num: Final[int]
    jam_num: Final[int]
    period_clock_elapsed: Final[timedelta]
    type: TimeoutType | None = field(init=False, default=None)
    team: TeamOfficialString | None = field(init=False, default=None)
    details: str = field(init=False, default='')
    result: str = field(init=False, default='')
    retained: bool = field(init=False, default=False)

    def __init__(
        self,
        period_num: int,
        jam_num: int,
        period_clock_elapsed: timedelta,
        start_timestamp: datetime,
    ) -> None:
        self.period_num = period_num
        self.jam_num = jam_num
        self.period_clock_elapsed = period_clock_elapsed
        self.start_timestamp = start_timestamp
        self.elapsed = timedelta(seconds=0)
        self.type = None
        self.team = None
        self.details = ''
        self.result = ''
        self.retained = False

    @property
    def duration(self) -> timedelta:
        return self.elapsed

    @duration.setter
    def duration(self, elapsed: timedelta) -> None:
        self.elapsed = elapsed


@dataclass(slots=True)
class TimeReferee(AbstractReferee):
    @dataclass(slots=True)
    class Clocks:
        intermission: Final[Clock] = field(default_factory=Clock)
        game: Final[Clock] = field(default_factory=Clock)
        lineup: Final[Clock] = field(default_factory=Clock)
        jam: Final[Clock] = field(default_factory=Clock)

    clocks: Final[Clocks] = field(init=False, default_factory=Clocks)
    timeouts: Final[list[Timeout]] = field(init=False, default_factory=list)

    def __post_init__(self) -> None:
        self.clocks.game.set_alarm(minutes=30)
        self.clocks.jam.set_alarm(minutes=2)
        self.clocks.lineup.set_alarm(seconds=30)

    def start_jam(self, timestamp: datetime) -> None:
        if self.timeout_is_running():
            raise RuntimeError('Cannot start a Jam when a Timeout is running')
        for clock in [self.clocks.intermission, self.clocks.lineup]:
            if clock.is_running():
                clock.stop(timestamp)
        self.clocks.jam.reset()
        self.clocks.jam.start(timestamp)

    def stop_jam(self, timestamp: datetime) -> None:
        if not self.clocks.jam.is_running():
            raise RuntimeError('Cannot stop a Jam when there is none running') from None
        self.clocks.jam.stop(timestamp)

        self.clocks.lineup.reset()
        self.clocks.lineup.start(timestamp)

    def timeout_is_running(self) -> bool:
        return len(self.timeouts) > 0 and self.timeouts[-1].is_running()

    def call_timeout(self, timestamp: datetime, period_num: int, jam_num: int) -> None:
        if not self.clocks.lineup.is_running():
            raise RuntimeError('A Timeout can only be called during Lineup')
        if self.timeout_is_running():
            raise RuntimeError('Cannot call a Timeout when one is already running')

        # Stop the period clock if it is running
        if self.clocks.game.is_running():
            self.clocks.game.stop(timestamp)

        # Instantiate the Timeout
        period_clock_elapsed = self.clocks.game.get_elapsed_at_timestamp(timestamp)
        timeout: Timeout = Timeout(timestamp, period_num, jam_num, period_clock_elapsed)
        self.timeouts.append(timeout)

    def end_timeout(self, timestamp: datetime) -> None:
        if not self.timeout_is_running():
            raise RuntimeError('Cannot end a Timeout when one is not running')
        self.timeouts[-1].stop(timestamp)

        # Subtract the timeout or official review, if not retained
        timeout: Timeout = self.timeouts[-1]
        if timeout.type == 'timeout' or not timeout.retained:
            self.context[timeout.team].clock_stops[timeout.type] -= 1
