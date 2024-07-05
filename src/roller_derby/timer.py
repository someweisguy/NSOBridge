from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from .encodable import Encodable
from typing import Any, Callable
import server
import asyncio

class Expectable(Encodable, ABC):
    def __init__(self, expect: timedelta, event: timedelta) -> None:
        self._expectTimer: Timer = Timer(expect)
        self._eventTimer: Timer = Timer(event)

    def expect(self, timestamp: datetime) -> None:
        if self._expectTimer.isRunning():
            raise RuntimeError(f"this {type(self).__name__} is already expected")
        self._expectTimer.start(timestamp, lambda _: server.update(self))
        server.update(self)

    def start(self, timestamp: datetime) -> None:
        if self._eventTimer.isRunning():
            raise RuntimeError(f"this {type(self).__name__} is already running")
        if self._expectTimer.isRunning():
            self._expectTimer.stop(timestamp)
        self._eventTimer.start(timestamp, lambda _: server.update(self))
        server.update(self)

    def stop(self, timestamp: datetime) -> None:
        if not self._eventTimer.isRunning():
            raise RuntimeError(f"this {type(self).__name__} is not running")
        if self._expectTimer.isRunning():
            self._expectTimer.stop(timestamp)
        self._eventTimer.stop(timestamp)
        server.update(self)

    def isExpected(self) -> bool:
        return self._expectTimer.isRunning()

    def isRunning(self) -> bool:
        return self._eventTimer.isRunning()

    @abstractmethod
    def isComplete(self) -> bool:
        pass

    def getElapsed(self) -> timedelta:
        return self._eventTimer.getElapsed()

    def setElapsed(self, hours: int = 0, minutes: int = 0, seconds: int = 0) -> None:
        self._eventTimer.setElapsed(hours, minutes, seconds)
        server.update(self)

    def getRemaining(self) -> timedelta:
        return self._eventTimer.getRemaining()

    def getTimeToStart(self) -> timedelta:
        return self._expectTimer.getRemaining()

    def setTimeToStart(
        self, hours: int = 0, minutes: int = 0, seconds: int = 0
    ) -> None:
        pass  # TODO
        server.update(self)
        
    def encode(self) -> dict[str, Any]:
        return {
            "countdown": self._expectTimer.encode(),
            "clock": self._eventTimer.encode(),
        }


class Timer(Encodable):
    def __init__(
        self,
        time: None | timedelta = None,
        *,
        hours: int = 0,
        minutes: int = 0,
        seconds: int = 0,
    ) -> None:
        # Set the Timer alarm value if necessary
        self._alarm: None | timedelta = None
        if time is not None and time.total_seconds() > 0:
            self._alarm = time
        time = timedelta(hours=hours, minutes=minutes, seconds=seconds)
        if time.total_seconds() > 0:
            self._alarm = time

        self._task: None | asyncio.Task = None
        self._startTime: None | datetime = None
        self._stopTime: None | datetime = None
        self._elapsed: timedelta = timedelta()

    def isRunning(self) -> bool:
        return self._startTime is not None and self._stopTime is None

    def start(
        self, timestamp: datetime, callback: None | Callable[[datetime], None] = None
    ) -> None:
        if self.isRunning():
            raise RuntimeError("timer is already running")

        # Increment the elapsed time if the Timer has already been running
        if self._startTime is not None and self._stopTime is not None:
            self._elapsed += self._stopTime - self._startTime
            self._stopTime = None

        self._startTime = timestamp

        if callback is not None:
            if self._alarm is None:
                raise RuntimeError("cannot set a callback on a Timer without an alarm")

            # Create and run a Timer callback
            async def runTask() -> None:
                while self.getRemaining().total_seconds() > 0:
                    await asyncio.sleep(self.getRemaining().total_seconds())
                callback(datetime.now())
                self._task = None  # Garbage collect the Task information

            self._task = asyncio.create_task(runTask())

    def stop(self, timestamp: datetime) -> None:
        if not self.isRunning():
            raise RuntimeError("timer is not currently running")

        # Stop the timer by assigning a stop time - allows for undo
        self._stopTime = timestamp

        # Stop the timer callback task
        if self._task is not None:
            self._task.cancel()
            self._task = None

    def getElapsed(self) -> timedelta:
        lapTime: timedelta
        if self._startTime is not None and self._stopTime is not None:
            lapTime = self._stopTime - self._startTime
        elif self._startTime is not None:
            lapTime = datetime.now() - self._startTime
        else:
            lapTime = timedelta()
        return self._elapsed + lapTime

    def setElapsed(self, hours: int = 0, minutes: int = 0, seconds: int = 0) -> None:
        self._elapsed = timedelta(hours=hours, minutes=minutes, seconds=seconds)

    def getAlarm(self) -> timedelta:
        assert self._alarm is not None, "there is no alarm for this Timer"
        return self._alarm

    def getRemaining(self) -> timedelta:
        assert self._alarm is not None, "there is no alarm for this Timer"
        return self._alarm - self.getElapsed()

    def encode(self) -> dict[str, Any]:
        alarmValue: None | int = None
        if self._alarm is not None:
            alarmValue = round(self.getAlarm().total_seconds() * 1000)
        return {
            "alarm": alarmValue,
            "elapsed": round(self.getElapsed().total_seconds() * 1000),
            "running": self.isRunning(),
        }
