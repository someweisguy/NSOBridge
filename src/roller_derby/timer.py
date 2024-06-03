from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

from roller_derby.bout import ClientException
from .encodable import Encodable


class Timer(Encodable):
    @dataclass
    class Lap:
        start: None | datetime = None
        stop: None | datetime = None

    def __init__(
        self,
        alarm: None | datetime = None,
        *,
        hours: None | int = None,
        minutes: None | int = None,
        seconds: None | int = None,
    ) -> None:
        if alarm is not None and not isinstance(alarm, datetime):
            raise TypeError(f"Alarm must be datetime, not {type(alarm).__name__}")
        units: tuple[None | int, ...] = (hours, minutes, seconds)
        if any(unit is not None and not isinstance(unit, int) for unit in units):
            raise TypeError("Units must be int")
        if alarm is not None and any(unit is not None for unit in units):
            raise TypeError(
                f"{type(self).__name__} must be initialized with a datetime or timedelta, not both."
            )

        self._alarm: None | timedelta = None
        self._elapsed: timedelta = timedelta()
        self._lap: Timer.Lap = Timer.Lap()

        # Check if the Timer should have an alarm value
        if alarm is not None:
            now: datetime = datetime.now()
            if alarm < now:
                raise ValueError("Alarm cannot be set for a time in the past.")
            self._alarm = now - alarm
            self._lap.start = now
        elif any(unit is not None for unit in units):
            hours, minutes, seconds = [0 if unit is None else unit for unit in units]
            self._alarm = timedelta(hours=hours, minutes=minutes, seconds=seconds)

    def isRunning(self) -> bool:
        return self._lap.start is not None and self._lap.stop is None

    def start(self, timestamp: datetime = datetime.now()) -> None:
        if self.isRunning():
            raise ClientException("Timer is already running.")
        if self._lap.start is not None and self._lap.stop is not None:
            self._elapsed += self._lap.stop - self._lap.start
            self._lap.stop = None
        self._lap.start = timestamp

    def stop(self, timestamp: datetime = datetime.now()) -> None:
        if not self.isRunning():
            raise ClientException("Timer is already stopped.")
        self._lap.stop = timestamp

    def getElapsed(self, timestamp: datetime = datetime.now()) -> int:
        elapsed: int = round(self._elapsed.total_seconds() * 1000)
        lapTime: timedelta = timedelta()
        if self._lap.start is not None and self._lap.stop is not None:
            lapTime = self._lap.stop - self._lap.start
        elif self._lap.start is not None:
            lapTime = timestamp - self._lap.start
        elapsed += round(lapTime.total_seconds() * 1000)
        return elapsed

    def getAlarm(self) -> None | int:
        if self._alarm is None:
            return None
        return round(self._alarm.total_seconds() * 1000)

    def encode(self) -> dict[str, Any]:
        return {
            "alarm": self.getAlarm(),
            "elapsed": self.getElapsed(),
            "running": self.isRunning(),
        }


class TimerManager:
    def __init__(self) -> None:
        self._game: Timer = Timer(minutes=30)
        self._jam: Timer = Timer(minutes=2)
        self._lineup: Timer = Timer(seconds=30)
        self._timeout: Timer = Timer()

    @property
    def game(self) -> Timer:
        return self._game

    @property
    def jam(self) -> Timer:
        return self._jam

    @property
    def lineup(self) -> Timer:
        return self._lineup
