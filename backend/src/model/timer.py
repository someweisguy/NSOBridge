from dataclasses import dataclass, field
from datetime import datetime, timedelta
from . import AbstractState


@dataclass(slots=True)
class ClockState(AbstractState):
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
class TimerState(AbstractState):
    _game: ClockState = field(default_factory=ClockState)
    _jam: ClockState = field(default_factory=ClockState)
    is_in_intermission: bool = True
    is_in_lineup: bool = False

    @property
    def game(self) -> ClockState:
        return self._game

    @property
    def jam(self) -> ClockState:
        return self._jam
