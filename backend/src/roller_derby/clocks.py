from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timedelta
from roller_derby.interface import Copyable, Resource
from typing import Any, Callable, Generator, Self
import asyncio


class Timer(Resource, Copyable):
    __slots__ = '_start', '_stop', '_elapsed', '_alarm', '_callback', '_task'

    def __init__(self, *, hours: float = 0, minutes: float = 0,
                 seconds: float = 0, milliseconds: float = 0) -> None:
        self._start: datetime | None = None
        self._stop: datetime | None = None
        self._elapsed: timedelta = timedelta(milliseconds=0)
        self._alarm: timedelta | None = None
        self._callback: Callable[[datetime], None] | None = None
        self._task: asyncio.Task | None = None
        self.set_alarm(hours=hours, minutes=minutes, seconds=seconds,
                       milliseconds=milliseconds)

    def __copy__(self) -> Timer:
        snapshot: Timer = Timer()
        self._copy_to(snapshot)
        return snapshot

    async def _alarm_task(self) -> None:
        seconds_remaining: timedelta | None = self.get_remaining()
        while (seconds_remaining is not None
               and seconds_remaining.total_seconds() > 0):
            await asyncio.sleep(seconds_remaining.total_seconds())
            seconds_remaining = self.get_remaining()

        if self._callback is not None:
            self._callback(datetime.now())
        self._task = None

    def _reset_alarm_task(self) -> None:
        if self._task is not None:
            self._task.cancel()
            self._task = (asyncio.create_task(self._alarm_task())
                          if self._alarm is not None else None)

    def start(self, timestamp: datetime) -> None:
        if self._start is not None:
            raise RuntimeError('This Timer is already running')
        self._start = timestamp

    def stop(self, timestamp: datetime) -> None:
        if self._stop is not None:
            raise RuntimeError('This Timer is already stopped')
        self._stop = timestamp

    def is_running(self) -> bool:
        return self._start is not None and self._stop is None

    def is_stopped(self) -> bool:
        return self._start is not None and self._stop is not None

    def get_alarm(self) -> timedelta | None:
        return self._alarm

    def set_alarm(self, *, hours: float = 0, minutes: float = 0,
                  seconds: float = 0, milliseconds: float = 0) -> None:
        new_alarm: timedelta = timedelta(hours=hours, minutes=minutes,
                                         seconds=seconds,
                                         milliseconds=milliseconds)
        if new_alarm.total_seconds() > 0:
            self._alarm = new_alarm
        self._reset_alarm_task()

    def get_elapsed(self, timestamp: datetime | None = None) -> timedelta:
        if self._start is not None and self._stop is not None:
            return self._stop - self._stop + self._elapsed
        elif self._start is not None:
            if timestamp is None:
                timestamp = datetime.now()
            return timestamp - self._start + self._elapsed
        else:
            return self._elapsed

    def set_elapsed(self, *, hours: float = 0, minutes: float = 0,
                    seconds: float = 0, milliseconds: float = 0) -> None:
        new_elapsed: timedelta = timedelta(hours=hours, minutes=minutes,
                                           seconds=seconds,
                                           milliseconds=milliseconds)
        self._elapsed = new_elapsed
        self._reset_alarm_task()

    def get_remaining(self) -> timedelta | None:
        return (self._alarm - self.get_elapsed()
                if self._alarm is not None else None)

    def set_callback(self, callback: Callable[[datetime]] | None) -> None:
        self._callback = callback

    def restore(self, snapshot: Self) -> None:
        if self._task is not None:
            self._task.cancel()
        super().restore(snapshot)
        self._reset_alarm_task()

    def serve(self, timestamp: datetime | None = None) -> dict[str, Any]:
        return {
            'elapsed': round(self.get_elapsed(timestamp).total_seconds()
                             * 1000),
            'alarm': (round(self._alarm.total_seconds() * 1000)
                      if self._alarm is not None else None),
            'isRunning': self.is_running()
        }


@dataclass(slots=True, eq=False, frozen=True)
class Clocks(Resource, Copyable):
    intermission: Timer = Timer(minutes=15)
    period: Timer = Timer(minutes=30)
    lineup: Timer = Timer(seconds=30)
    jam: Timer = Timer(minutes=2)
    timeout: Timer = Timer()

    def __iter__(self) -> Generator[Timer]:
        return next(self)

    def __next__(self) -> Generator[Timer]:
        for slot in self.__slots__:
            yield getattr(self, slot)

    def __copy__(self) -> Clocks:
        snapshot: Clocks = Clocks()
        self._copy_to(snapshot)
        return snapshot

    def set_callback(self, callback: Callable[[datetime]] | None) -> None:
        for clock in self:
            clock.set_callback(callback)

    def serve(self, timestamp: datetime | None = None) -> dict[str, Any]:
        return {
            'intermission': self.intermission.serve(timestamp),
            'period': self.period.serve(timestamp),
            'lineup': self.lineup.serve(timestamp),
            'jam': self.jam.serve(timestamp),
            'timeout': self.timeout.serve(timestamp)
        }
