from __future__ import annotations
from dataclasses import dataclass
from enum import IntEnum, auto
from typing import Literal
from .encodable import Encodable


class SeriesManager(Encodable):
    def __init__(self):
        self._bouts: list[Bout] = [Bout()]
        self._currentBout: Bout = self._bouts[0]
        # self.teams: dict[str, Team] = dict()
        # self.timers: TimerManager = TimerManager()

    def __getitem__(self, boutIndex: int) -> Bout:
        return self._bouts[boutIndex]

    @property
    def bouts(self) -> list[Bout]:
        return self._bouts

    def addBout(self) -> None:
        self._bouts.append(Bout())

    def moveBout(self, fromIndex: int, toIndex: int) -> None:
        bout: Bout = self._bouts[fromIndex]
        self._bouts.insert(toIndex, bout)
        self._bouts.pop(fromIndex)

    def deleteBout(self, deleteIndex: int) -> None:
        self._bouts.pop(deleteIndex)

    @property
    def currentBout(self) -> Bout:
        return self._currentBout

    @currentBout.setter
    def currentBout(self, boutIndex: int) -> None:
        self._currentBout = self._bouts[boutIndex]

    def encode(self) -> dict:
        return {
            "currentBout": self._bouts.index(self._currentBout),
            "bouts": [bout.encode() for bout in self._bouts],
        }


class Bout(Encodable):
    def __init__(self) -> None:
        self._periods: tuple[list[Jam], ...] = ([Jam(self)], [], [])
        self._currentPeriod: list[Jam] = self._periods[0]
        self._currentJam: Jam = self._currentPeriod[0]

    @property
    def currentPeriod(self) -> list[Jam]:
        return self._currentPeriod

    @property
    def currentJam(self) -> Jam:
        return self._currentJam

    @property
    def jam(self) -> tuple[list[Jam], ...]:
        return self._periods

    @property
    def inOvertime(self) -> bool:
        return self.currentJam in self._periods[2]

    def addJam(self, period: int) -> None:
        self._periods[period].append(Jam(self))

    def deleteJam(self, period: int) -> None:
        self._periods[period].pop()
        if len(self.currentPeriod) == 0:
            self.currentPeriod.append(Jam(self))

    def encode(self) -> dict:
        return {
            "currentPeriod": self._periods.index(self.currentPeriod),
            "jams": [[jam.encode() for jam in period] for period in self._periods],
        }


class Jam(Encodable):
    class StopReason(IntEnum):
        CALLED = auto()
        INJURY = auto()
        TIME = auto()
        OTHER = auto()

    @dataclass
    class Trip(Encodable):
        points: int
        tick: int

        def encode(self) -> dict:
            return self.__dict__

    class Team(Encodable):
        def __init__(self, parent: Jam) -> None:
            self._parent: Jam = parent
            self._lead: bool = False
            self._lost: bool = False
            self._no_pivot: bool = False
            self._star_pass: Literal[False] | int = False
            self._trips: list[Jam.Trip] = []

        @property
        def jamScore(self) -> int:
            return sum(trip.points for trip in self._trips)

        def addTrip(self, points: int, tick: int) -> None:
            if not self._parent.isStarted:
                raise ClientException("This Jam has not yet started.")
            self._trips.append(Jam.Trip(points, tick))

        def editTrip(self, points: int, tripIndex: int) -> None:
            self._trips[tripIndex].points = points

        def deleteTrip(self, tripIndex: int) -> None:
            del self._trips[tripIndex]

        def encode(self) -> dict:
            return {
                "lead": self._lead,
                "lost": self._lost,
                "noPivot": self._no_pivot,
                "starPass": self._star_pass,
                "trips": [trip.encode() for trip in self._trips],
            }

    def __init__(self, parent: Bout) -> None:
        self._parent: Bout = parent
        self._started: Literal[False] | int = False
        self._stopped: Literal[False] | int = False
        self._stopReason: None | int = None
        self._home: Jam.Team = Jam.Team(self)
        self._away: Jam.Team = Jam.Team(self)

    @property
    def home(self) -> Jam.Team:
        return self._home

    @property
    def away(self) -> Jam.Team:
        return self._away

    @property
    def index(self) -> int:
        for period in reversed(self._parent._periods):
            try:
                return period.index(self)
            except ValueError:
                pass
        raise ValueError("This Jam is not in a Bout")

    @property
    def isStarted(self) -> bool:
        return self._started is not False

    def start(self, tick: int) -> None:
        if self.isStarted:
            raise ClientException("This jam has already started.")
        self._started = tick

    def unStart(self) -> None:
        if not self.isStarted:
            raise ClientException("This jam has not yet started.")
        self._started = False

    @property
    def isStopped(self) -> bool:
        return self._stopped is not False

    def stop(self, reason: Jam.StopReason, tick: int) -> None:
        if not self.isStarted:
            raise ClientException("This jam has not yet started.")
        if self.isStopped:
            raise ClientException("This jam has already stopped.")
        if reason not in Jam.StopReason:
            raise ClientException("Stop reason is invalid")
        self._stopped = tick
        self._stopReason = int(reason)

    def unStop(self) -> None:
        if not self.isStopped:
            raise ClientException("This jam has not yet stopped.")
        self._stopped = False
        self._stopReason = None

    def encode(self) -> dict:
        return {
            "startTick": self._started,
            "stopTick": self._stopped,
            "callReason": self._stopReason,
            "home": self._home.encode(),
            "away": self._away.encode(),
        }


class ClientException(Exception):
    pass
