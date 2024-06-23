from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Literal

from .encodable import ClientException, Encodable
import server


class Timer(Encodable):
    @dataclass
    class Lap:
        start: None | datetime = None
        stop: None | datetime = None

    def __init__(
        self,
        timerType: str,
        alarm: None | datetime = None,
        *,
        hours: None | int = None,
        minutes: None | int = None,
        seconds: None | int = None,
    ) -> None:
        if not isinstance(timerType, str):
            raise TypeError(f"Type must be str, not {type(timerType).__name__}")
        if alarm is not None and not isinstance(alarm, datetime):
            raise TypeError(f"Alarm must be datetime, not {type(alarm).__name__}")
        units: tuple[None | int, ...] = (hours, minutes, seconds)
        if any(unit is not None and not isinstance(unit, int) for unit in units):
            raise TypeError("Units must be int")
        if alarm is not None and any(unit is not None for unit in units):
            raise TypeError(
                f"{type(self).__name__} must be initialized with a datetime or timedelta, not both."
            )

        self._timerType: str = timerType
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

    def running(self) -> bool:
        return self._lap.start is not None and self._lap.stop is None

    def start(self, timestamp: None | datetime = None) -> None:
        if timestamp is None:
            timestamp = datetime.now()
        if self.running():
            raise ClientException("Timer is already running.")
        if self._lap.start is not None and self._lap.stop is not None:
            self._elapsed += self._lap.stop - self._lap.start
            self._lap.stop = None
        self._lap.start = timestamp
        server.update(self)

    def stop(self, timestamp: None | datetime = None) -> None:
        if timestamp is None:
            timestamp = datetime.now()
        if not self.running():
            raise ClientException("Timer is already stopped.")
        self._lap.stop = timestamp
        server.update(self)

    def getElapsed(self, timestamp: None | datetime = None) -> int:
        if timestamp is None:
            timestamp = datetime.now()
        elapsed: int = round(self._elapsed.total_seconds() * 1000)
        lapTime: timedelta = timedelta()
        if self._lap.start is not None and self._lap.stop is not None:
            lapTime = self._lap.stop - self._lap.start
        elif self._lap.start is not None:
            lapTime = timestamp - self._lap.start
        elapsed += round(lapTime.total_seconds() * 1000)
        return elapsed

    def setElapsed(
        self,
        hours: int = 0,
        minutes: int = 0,
        seconds: int = 0,
        milliseconds: int = 0,
    ) -> None:
        units: tuple[int, ...] = (hours, minutes, seconds, milliseconds)
        if any(not isinstance(unit, int) for unit in units):
            raise TypeError("Units must be int")
        self._elapsed = timedelta(
            hours=hours, minutes=minutes, seconds=seconds, milliseconds=milliseconds
        )

    def getAlarm(self) -> None | int:
        if self._alarm is None:
            return None
        return round(self._alarm.total_seconds() * 1000)

    def getRemaining(self) -> None | int:
        if self._alarm is None:
            return None
        return round(self._alarm.total_seconds() * 1000) - self.getElapsed()

    def reset(self) -> None:
        self._lap = Timer.Lap()
        self._elapsed = timedelta()
        if self.running():
            server.update(self)

    def restart(self, timestamp: None | datetime = None) -> None:
        if timestamp is None:
            timestamp = datetime.now()
        if self.running():
            raise ClientException("Timer is already running.")
        self._lap = Timer.Lap(start=timestamp)
        self._elapsed = timedelta()
        server.update(self)

    def encode(self) -> dict[str, Any]:
        return {
            "type": self._timerType,
            "alarm": self.getAlarm(),
            "elapsed": self.getElapsed(),
            "running": self.running(),
        }


class TimeKeeper:
    def __init__(self) -> None:
        self._period: Timer = Timer("period", minutes=30)
        self._lineup: Timer = Timer("lineup", seconds=30)
        self._timeout: Timer = Timer("timeout")

        self._periodTimer = self._period

    def __getitem__(self, item: str) -> Timer:
        match item:
            case "period":
                return self._period
            case "lineup":
                return self._lineup
            case "timeout":
                return self._timeout
            case "period":
                return self._periodTimer
            case "action":
                return self._actionTimer
            case _:
                raise LookupError(f"Unknown timer '{item}'.")

    @property
    def period(self) -> Timer:
        return self._period

    @period.setter
    def period(self, timer: Timer) -> None:
        if not isinstance(timer, Timer):
            raise TypeError(f"Timer must be Timer, not {type(timer).__name__}")
        if self._periodTimer is self._period:
            self._periodTimer = timer
        self._period = timer

    @property
    def lineup(self) -> Timer:
        return self._lineup

    @lineup.setter
    def lineup(self, timer: Timer) -> None:
        if not isinstance(timer, Timer):
            raise TypeError(f"Timer must be Timer, not {type(timer).__name__}")
        if self._actionTimer is self._lineup:
            self._actionTimer = timer
        self._lineup = timer

    @property
    def timeout(self) -> Timer:
        return self._timeout

    @timeout.setter
    def timeout(self, timer: Timer) -> None:
        if not isinstance(timer, Timer):
            raise TypeError(f"Timer must be Timer, not {type(timer).__name__}")
        if self._actionTimer is self._timeout:
            self._actionTimer = timer
        self._timeout = timer

    @property
    def periodTimer(self) -> Timer:
        return self._periodTimer  # TODO: Allow getting intermission Timer

    @periodTimer.setter
    def periodTimer(self, value: Literal["game", "intermission"]) -> None:
        if value == "game":
            self._periodTimer = self._period
        elif value == "intermission":
            raise NotImplementedError()
        else:
            raise ValueError(
                f"Period timer must be one of 'game' or 'intermission', not '{value}'."
            )

    @property
    def actionTimer(self) -> Timer:
        return self._actionTimer

    @actionTimer.setter
    def actionTimer(self, value: Literal["lineup", "timeout"]) -> None:
        if value == "lineup":
            self._actionTimer = self._lineup
        elif value == "timeout":
            self._actionTimer = self._timeout
        else:
            raise ValueError(
                f"Action Timer must be one of 'lineup', or 'timeout', not '{value}'."
            )
