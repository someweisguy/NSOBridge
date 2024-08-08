from __future__ import annotations
from datetime import datetime, timedelta
from server import Encodable
from typing import Callable
import asyncio


class Timer(Encodable):
    def __init__(self, alarm: None | timedelta = None, *, hours: float = 0,
                 minutes: float = 0, seconds: float = 0) -> None:
        super().__init__()

        self._task: None | asyncio.Task = None
        self._startTime: None | datetime = None
        self._stopTime: None | datetime = None
        self._alarm: None | timedelta = None
        self._elapsed: timedelta = timedelta(seconds=0)
        self._callback: None | Callable[[datetime], None] = None
        self.setAlarm(alarm, hours=hours, minutes=minutes, seconds=seconds)

    @staticmethod
    def getMilliseconds(time: None | timedelta) -> None | int:
        return round(time.total_seconds() * 1000) if time is not None else None

    async def _alarmTask(self) -> None:
        if self.getRemaining() == timedelta.max:
            self._task = None
            return
        secondsRemaining: float = self.getRemaining().total_seconds()
        while secondsRemaining > 0:
            await asyncio.sleep(secondsRemaining)
            secondsRemaining = self.getRemaining().total_seconds()
        if self._callback is not None:
            self._callback(datetime.now())
        self._task = None

    def _restartTask(self) -> None:
        if self._task is not None:
            self._task.cancel()
            if self._alarm is not None:
                self._task = asyncio.create_task(self._alarmTask())
            else:
                self._task = None

    def start(self, timestamp: datetime) -> None:
        if self.isStarted():
            raise RuntimeError("timer has already been started")

        # Increment the elapsed time if the Timer has already been running
        if self._startTime is not None and self._stopTime is not None:
            self._elapsed += self._stopTime - self._startTime
            self._stopTime = None

        self._startTime = timestamp

        # Create an alarm callback task
        if self._alarm is not None:
            self._task = asyncio.create_task(Timer._alarmTask(self))

    def stop(self, timestamp: datetime) -> None:
        if not self.isStarted():
            raise RuntimeError("timer has already been stopped")

        self._stopTime = timestamp

        # Stop the currently running task
        if self._task is not None:
            self._task.cancel()
            self._task = None

    def isStarted(self) -> bool:
        return self._startTime is not None and self._stopTime is None

    def setCallback(self, callback: None | Callable[[datetime], None]) -> None:
        self._callback = callback

    def getElapsed(self) -> timedelta:
        if self._startTime is not None and self._stopTime is not None:
            return self._elapsed + (self._stopTime - self._startTime)
        elif self._startTime is not None:
            return self._elapsed + (datetime.now() - self._startTime)
        else:
            return self._elapsed

    def setElapsed(self, elapsed: None | timedelta = None, *, hours: float = 0,
                   minutes: float = 0, seconds: float = 0) -> None:
        if elapsed is None:
            elapsed = timedelta(hours=hours, minutes=minutes, seconds=seconds)
        self._elapsed = elapsed

        # Reset the current lap
        if not self.isStarted():
            self._startTime = None
            self._stopTime = None

        # Restart the currently active task
        self._restartTask()

    def getAlarm(self) -> None | timedelta:
        return self._alarm

    def setAlarm(self, alarm: None | timedelta = None, *, hours: float = 0,
                 minutes: float = 0, seconds: float = 0) -> None:
        if alarm is not None:
            self._alarm = alarm
        else:
            alarm = timedelta(hours=hours, minutes=minutes, seconds=seconds)
            self._alarm = alarm if alarm.total_seconds() > 0 else None

        # Restart the currently active task
        self._restartTask()

    def getRemaining(self) -> timedelta:
        if self._alarm is None:
            return timedelta.max
        return self._alarm - self.getElapsed()

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            "uuid": self.uuid,
            "alarm": Timer.getMilliseconds(self._alarm),
            "elapsed": Timer.getMilliseconds(self.getElapsed()),
            "running": self.isStarted(),  # FIXME: rename to isRunning
        }
