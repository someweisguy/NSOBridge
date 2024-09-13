from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timedelta
from interface import Requestable
from jam import Jam
from typing import Any, Callable
from uuid import UUID
import asyncio


class Timer(Requestable):
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

    async def _alarm_task(self) -> None:
        seconds_remaining: timedelta | None = self.get_remaining()
        while (seconds_remaining is not None
               and seconds_remaining.total_seconds() > 0):
            await asyncio.sleep(seconds_remaining.total_seconds())
            seconds_remaining = self.get_remaining()

        if self._callback is not None:
            self._callback(datetime.now())
            # TODO: server flush here
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

    def get_elapsed(self) -> timedelta:
        if self._start is not None and self._stop is not None:
            return self._stop - self._stop + self._elapsed
        elif self._start is not None:
            return datetime.now() - self._start + self._elapsed
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

    def serve(self) -> dict[str, Any]:
        return {
            'alarm': (None if self._alarm is None
                      else self._alarm.total_seconds() * 1000),
            'elapsed': self.get_elapsed().total_seconds() * 1000,
            'isRunning': self.is_running(),
        }


@dataclass(slots=True, eq=False, frozen=True)
class Clocks(Requestable):
    intermission: Timer = Timer(minutes=15)
    period: Timer = Timer(minutes=30)
    lineup: Timer = Timer(seconds=30)
    jam: Timer = Timer(minutes=2)
    timeout: Timer = Timer()

    def serve(self) -> dict[str, Any]:
        return {
            'intermission': self.intermission.serve(),
            'period': self.period.serve(),
            'lineup': self.lineup.serve(),
            'jam': self.jam.serve(),
            'timeout': self.timeout.serve()
        }


class Bout(Requestable):
    __slots__ = '_id', '_clocks', '_jams'

    def __init__(self, id: UUID) -> None:
        self._id: UUID = id
        self._clocks: Clocks = Clocks()
        self._jams: tuple[list[Jam], list[Jam]] = ([Jam()], [])

    @property
    def clocks(self) -> Clocks:
        return self._clocks

    @property
    def jams(self) -> tuple[list[Jam], list[Jam]]:
        return self._jams

    def copy(self) -> Bout:
        copy: Bout = Bout(self._id)
        copy._clocks = self._clocks
        copy._jams = self._jams
        return copy

    def restore(self, copy: Bout) -> None:
        self._id = copy._id
        self._clocks = copy._clocks

    def add_jam(self) -> None:
        self._jams[0].append(Jam())

    def delete_jam(self) -> None:
        self._jams[0].pop()

    def serve(self) -> dict[str, Any]:
        return {
            'clocks': self._clocks.serve(),
            'jams': [[jam.serve() for jam in jams] for jams in self._jams]
        }
