from datetime import datetime, timedelta
from typing import Any

from .encodable import Encodable
import server


class Timer(Encodable):
    def __init__(
        self,
        alarm: None | datetime = None,
        *,
        hours: int = 0,
        minutes: int = 0,
        seconds: int = 0,
    ) -> None:
        NOW: datetime = datetime.now()
        if alarm is not None and not isinstance(alarm, datetime):
            raise TypeError(f"Alarm must be datetime, not {type(alarm).__name__}")
        if any(not isinstance(unit, int) for unit in (hours, minutes, seconds)):
            raise TypeError("Units must be int")
        if alarm is not None and any(unit != 0 for unit in (hours, minutes, seconds)):
            raise TypeError(
                f"{type(self).__name__} must be initialized with a datetime or timedelta, not both."
            )

        # Set the Timer alarm value
        if alarm is not None:
            if alarm < NOW:
                raise ValueError("Alarm cannot be set for a time in the past.")
            self._alarm: timedelta = alarm - NOW
        else:
            newAlarm = timedelta(hours=hours, minutes=minutes, seconds=seconds)
            self._alarm: timedelta = newAlarm

        self._elapsed: timedelta = timedelta()
        self._startTime: None | datetime = None
        self._stopTime: None | datetime = None

    def running(self) -> bool:
        return self._startTime is not None and self._stopTime is None

    def start(self, timestamp: datetime) -> None:
        if self.running():
            raise RuntimeError("Timer is already running.")
        if self._startTime is not None and self._stopTime is not None:
            self._elapsed += self._stopTime - self._startTime
            self._stopTime = None
        self._startTime = timestamp

        server.update(self)

    def stop(self, timestamp: datetime) -> None:
        if not self.running():
            raise RuntimeError("Timer is not currently running.")
        self._stopTime = timestamp

        server.update(self)

    def getElapsed(self) -> timedelta:
        NOW: datetime = datetime.now()
        lapTime: timedelta = timedelta()
        if self._startTime is not None and self._stopTime is not None:
            lapTime = self._stopTime - self._startTime
        elif self._startTime is not None:
            lapTime = NOW - self._startTime
        return self._elapsed + lapTime

    def setElapsed(self, hours: int = 0, minutes: int = 0, seconds: int = 0) -> None:
        self._elapsed = timedelta(hours=hours, minutes=minutes, seconds=seconds)

    def getAlarm(self) -> timedelta:
        return self._alarm

    def getRemaining(self) -> timedelta:
        return self._alarm - self.getElapsed()

    def encode(self) -> dict[str, Any]:
        return {
            "alarm": round(self.getAlarm().total_seconds() * 1000),
            "elapsed": round(self.getElapsed().total_seconds() * 1000),
            "running": self.running(),
        }
