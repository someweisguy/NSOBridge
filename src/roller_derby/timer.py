from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

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

    def start(self, timestamp: datetime) -> None:
        if self.running():
            raise ClientException("Timer is already running.")
        if self._lap.start is not None and self._lap.stop is not None:
            self._elapsed += self._lap.stop - self._lap.start
            self._lap.stop = None
        self._lap.start = timestamp
        server.update(self)

    def stop(self, timestamp: datetime) -> None:
        if not self.running():
            raise ClientException("Timer is already stopped.")
        self._lap.stop = timestamp
        server.update(self)

    def getElapsedMilliseconds(self, timestamp: datetime) -> int:
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
        NOW: datetime = datetime.now()
        if self._alarm is None:
            return None
        return round(self._alarm.total_seconds() * 1000) - self.getElapsedMilliseconds(
            NOW
        )

    def encode(self) -> dict[str, Any]:
        NOW: datetime = datetime.now()
        return {
            "type": self._timerType,  # TODO: remove
            "alarm": self.getAlarm(),
            "elapsed": self.getElapsedMilliseconds(NOW),
            "running": self.running(),
        }
