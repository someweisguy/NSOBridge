from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timedelta
from roller_derby.timer import Expectable
from typing import get_args, Literal
from roller_derby.score import Score
from roller_derby.teamAttribute import TeamAttribute
from roller_derby.timeouts import ClockStoppage
import server


class Series(server.Encodable):
    def __init__(self):
        self._bouts: list[Bout] = [Bout()]
        self._currentBout: Bout = self._bouts[0]
        # TODO: add teams

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

    def encode(self) -> dict[str, server.Encodable.PRIMITIVE]:
        return {
            "currentBout": self._bouts.index(self._currentBout),
            "bouts": [bout.encode() for bout in self._bouts],
        }


class Bout(server.Encodable):
    def __init__(self) -> None:
        self._periods: list[Period] = [Period(self)]
        self._timeout: ClockStoppage = ClockStoppage()
        # TODO: add team attribute for teams

    def __len__(self) -> int:
        return len(self._periods)

    def __getitem__(self, periodIndex: int) -> Period:
        return self._periods[periodIndex]

    @property
    def timeout(self) -> ClockStoppage:
        return self._timeout

    def getPeriod(self, periodIndex: int) -> Period:
        return self._periods[periodIndex]

    def getCurrentPeriod(self) -> Period:
        return self._periods[-1]

    def addPeriod(self) -> None:
        if len(self._periods) >= 2:
            raise RuntimeError("A Bout cannot have more than 2 Periods.")
        self._periods.append(Period(self))

    def encode(self) -> dict[str, server.Encodable.PRIMITIVE]:
        activeJam: Jam = self.getCurrentPeriod().getCurrentJam()
        return {
            "id": 0,  # TODO
            "periodCount": len(self._periods),
            "activeJamId": activeJam.getId().encode(),
        }


class Period(Expectable):
    API_NAME: str = "period"

    def __init__(self, parent: Bout) -> None:
        super().__init__(timedelta(minutes=15), timedelta(minutes=30))
        self._parent: Bout = parent
        self._jams: list[Jam] = [Jam(self)]

    def __len__(self) -> int:
        return len(self._jams)

    def __getitem__(self, jamIndex: int) -> Jam:
        return self._jams[jamIndex]

    def isComplete(self) -> bool:
        return self._eventTimer.getRemaining().total_seconds() <= 0

    @property
    def parentBout(self) -> Bout:
        return self._parent

    def getJam(self, jamIndex: int) -> Jam:
        return self._jams[jamIndex]

    def getCurrentJam(self) -> Jam:
        for jam in reversed(self._jams):
            if jam.getElapsed().total_seconds() > 0:
                return jam
        else:
            return self._jams[-1]

    def addJam(self) -> Jam:
        jam: Jam = Jam(self)
        self._jams.append(jam)
        return jam

    def deleteJam(self, index: int) -> None:
        del self._jams[index]
        if len(self._jams) == 0:
            self._jams.append(Jam(self))

    def encode(self) -> dict[str, server.Encodable.PRIMITIVE]:
        return super().encode() | {
            "id": self.parentBout._periods.index(self),
            "jamCount": len(self._jams),
        }


class Jam(Expectable):
    API_NAME: str = "jam"
    TEAMS = Literal["home", "away"]
    STOP_REASONS = Literal["called", "injury", "time", "unknown"]

    @dataclass
    class Id(server.Encodable):
        period: int
        jam: int

        @staticmethod
        def decode(value: dict[str, int]) -> Jam.Id:
            return Jam.Id(**value)

        def encode(self) -> dict[str, server.Encodable.PRIMITIVE]:
            return {"period": self.period, "jam": self.jam}

    def __init__(self, parent: Period) -> None:
        super().__init__(timedelta(seconds=30), timedelta(minutes=2))
        self._parent: Period = parent
        self._stopReason: None | Jam.STOP_REASONS = None
        self._score: TeamAttribute[Score] = TeamAttribute(Score)

    def start(self, timestamp: datetime) -> None:
        super().start(timestamp)

        # Start the Period clock if it is not already running
        if not self.parentPeriod.isRunning():
            self.parentPeriod.start(timestamp)

    def stop(self, timestamp: datetime) -> None:
        super().stop(timestamp)

        # Add the next Jam and start its Lineup timer
        nextJam: Jam = self.parentPeriod.addJam()
        nextJam.expect(timestamp)

    def isComplete(self) -> bool:
        return self._stopReason is not None

    @property
    def parentPeriod(self) -> Period:
        return self._parent

    @property
    def score(self) -> TeamAttribute[score.Score]:
        return self._score

    def getId(self) -> Jam.Id:
        periodIndex: int = self._parent._parent._periods.index(self._parent)
        jamIndex: int = self._parent._jams.index(self)
        return Jam.Id(period=periodIndex, jam=jamIndex)

    def getStopReason(self) -> None | Jam.STOP_REASONS:
        return self._stopReason

    def setStopReason(self, stopReason: None | Jam.STOP_REASONS) -> None:
        if stopReason is not None and stopReason not in get_args(Jam.STOP_REASONS):
            raise ValueError(f"stopReason must be one of {get_args(Jam.STOP_REASONS)}")
        if stopReason is not None and self.isRunning():
            raise RuntimeError("cannot set stopReason for an incomplete Jam")

        self._stopReason = stopReason
        server.update(self)

    def encode(self) -> dict[str, server.Encodable.PRIMITIVE]:
        return super().encode() | {
            "id": self.getId().encode(),
            "stopReason": self._stopReason,
        }


series: Series = Series()
