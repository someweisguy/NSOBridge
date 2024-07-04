from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from .encodable import Encodable
from .teamAttribute import TeamAttribute
from .score import Score
from .timer import Timer
from typing import Any, get_args, Literal
import server


class Series(Encodable):
    def __init__(self):
        self._bouts: list[Bout] = [Bout()]
        self._currentBout: Bout = self._bouts[0]
        # self.teams: dict[str, Team] = dict()

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
        self._periods: list[Period] = [Period(self)]
        # TODO: add team attribute for teams

    def __len__(self) -> int:
        return len(self._periods)

    def __getitem__(self, periodIndex: int) -> Period:
        return self._periods[periodIndex]

    def getPeriod(self, periodIndex: int) -> Period:
        return self._periods[periodIndex]

    def getCurrentPeriod(self) -> Period:
        return self._periods[-1]

    def addPeriod(self) -> None:
        if len(self._periods) >= 2:
            raise RuntimeError("A Bout cannot have more than 2 Periods.")
        self._periods.append(Period(self))

    def encode(self) -> dict:
        activeJam: Jam = self.getCurrentPeriod().getCurrentJam()
        return {
            "id": 0,  # TODO
            "periodCount": len(self._periods),
            "activeJamId": activeJam.getId().encode()
        }


class Period(Encodable):
    API_NAME: str = "period"
    
    def __init__(self, parent: Bout) -> None:
        self._parent: Bout = parent
        self._countdown: Timer = Timer(minutes=15)
        self._clock: Timer = Timer(minutes=30)
        self._jams: list[Jam] = [Jam(self)]

    def __len__(self) -> int:
        return len(self._jams)

    def __getitem__(self, jamIndex: int) -> Jam:
        return self._jams[jamIndex]

    @property
    def parentBout(self) -> Bout:
        return self._parent

    def start(self, timestamp: datetime) -> None:
        self._clock.start(timestamp, lambda _: server.update(self))

        server.update(self)

    def running(self) -> bool:
        return self._clock.isRunning()

    def getJam(self, jamIndex: int) -> Jam:
        return self._jams[jamIndex]

    def getCurrentJam(self) -> Jam:
        return self._jams[-1]

    def addJam(self) -> Jam:
        jam: Jam = Jam(self)
        self._jams.append(jam)
        return jam

    def deleteJam(self, index: int) -> None:
        del self._jams[index]
        if len(self._jams) == 0:
            self._jams.append(Jam(self))

    def setTimeToDerby(
        self,
        hours: None | int = None,
        minutes: None | int = None,
        seconds: None | int = None,
    ) -> None:
        pass  # TODO

    def encode(self) -> dict[str, Any]:
        return {
            "id": self.parentBout._periods.index(self),
            "countdown": self._countdown.encode(),
            "clock": self._clock.encode(),
            "jamCount": len(self._jams),
        }


class Jam(Encodable):
    API_NAME: str = "jam"
    TEAMS = Literal["home", "away"]
    STOP_REASONS = Literal["called", "injury", "time", "unknown"]

    @dataclass
    class Id(Encodable):
        period: int
        jam: int

        @staticmethod
        def decode(value: dict[str, int]) -> Jam.Id:
            return Jam.Id(**value)

        def encode(self) -> dict:
            return {"period": self.period, "jam": self.jam}

    def __init__(self, parent: Period) -> None:
        self._parent: Period = parent
        self._countdown: Timer = Timer(seconds=30)
        self._clock: Timer = Timer(minutes=2)
        self._stopReason: None | Jam.STOP_REASONS = None
        self._score: TeamAttribute[Score] = TeamAttribute(self, Score)

    @property
    def parentPeriod(self) -> Period:
        return self._parent

    @property
    def parentBout(self) -> Bout:
        return self._parent._parent

    @property
    def score(self) -> TeamAttribute[Score]:
        return self._score

    def getId(self) -> Jam.Id:
        periodIndex: int = self._parent._parent._periods.index(self._parent)
        jamIndex: int = self._parent._jams.index(self)
        return Jam.Id(period=periodIndex, jam=jamIndex)

    def start(self, timestamp: datetime) -> None:
        if self.running():
            raise server.ClientException("This jam has already started.")

        # Stop the Lineup timer
        if self._countdown.isRunning():
            self._countdown.stop(timestamp)
        
        # Start the Jam timer and update clients when it completes
        self._clock.start(timestamp, lambda _: server.update(self))

        # Start the period clock if it isn't running
        period: Period = self.parentPeriod
        if not period.running():
            period.start(timestamp)

        server.update(self)

    def unStart(self) -> None:
        if not self.running():
            raise server.ClientException("This jam has not yet started.")
        # TODO: Implement this
        server.update(self)

    def stop(
        self, timestamp: datetime, stopReason: Jam.STOP_REASONS = "unknown"
    ) -> None:
        if not self.running():
            raise server.ClientException("This jam has not yet started.")
        if self.finished():
            raise server.ClientException("This jam is already finished.")
        if stopReason not in get_args(Jam.STOP_REASONS):
            raise ValueError(
                f"Stop reason must be one of {get_args(Jam.STOP_REASONS)}, not '{stopReason}'."
            )

        # Stop the current Jam
        self._stopReason = stopReason
        self._clock.stop(timestamp)

        # Add the next Jam and start its Lineup timer
        nextJam: Jam = self._parent.addJam()
        nextJam._countdown.start(timestamp)
        server.update(nextJam)

        server.update(self)

    def unStop(self) -> None:
        if not self.finished():
            raise server.ClientException("This jam has not yet stopped.")
        # TODO: update timers
        server.update(self)

    def getStopReason(self) -> None | Jam.STOP_REASONS:
        return self._stopReason

    def setStopReason(self, stopReason: None | Jam.STOP_REASONS) -> None:
        if stopReason is not None and stopReason not in get_args(Jam.STOP_REASONS):
            raise ValueError(
                f"Stop Reason must be one of {get_args(Jam.STOP_REASONS)} not '{stopReason}'."
            )
        if stopReason is not None and not self.finished():
            raise server.ClientException(
                "Cannot set Stop Reason when the Jam is not finished."
            )

        self._stopReason = stopReason

        server.update(self)

    def running(self) -> bool:
        return self._clock.isRunning()

    def finished(self) -> bool:
        return not self.running() and self._clock.getElapsed().total_seconds() > 0

    def encode(self) -> dict:
        return {
            "id": self.getId().encode(),
            "countdown": self._countdown.encode(),
            "clock": self._clock.encode(),
            "stopReason": self._stopReason,
        }
