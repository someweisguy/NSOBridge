from __future__ import annotations
from datetime import datetime, timedelta
from roller_derby.attribute import JamTeamAttribute
from roller_derby.score import Score
from roller_derby.timeout import BoutTimeout
from roller_derby.timer import Timeable, Timer
from server import Encodable
from typing import get_args, Literal, TypeAlias
import server


TEAMS: TypeAlias = Literal["home", "away"]
STOP_REASONS: TypeAlias = Literal["time", "called", "injury"]


class _GameNode[T: None | _GameNode](Encodable):
    def __init__(self, parent: T) -> None:
        super().__init__()
        self._parent: T = parent

    def update(self) -> None:
        server.update(self)
        node: None | _GameNode = self._parent
        while node is not None:
            server.update(node)
            node = node._parent


class Series(Encodable):
    def __init__(self) -> None:
        super().__init__()
        self._bouts: list[Bout] = [Bout()]

    @property
    def bouts(self) -> list[Bout]:
        return self._bouts

    @property
    def currentBout(self) -> Bout:
        return self._bouts[-1]  # TODO: remove this property

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            "bouts": [bout.encode() for bout in self._bouts],
        }


class Bout(_GameNode[None]):
    API_NAME: str = "bout"

    def __init__(self) -> None:
        super().__init__(None)
        self._periods: list[Period] = [Period(self)]
        self._timeout: BoutTimeout = BoutTimeout(self)

    def __getitem__(self, item: int) -> Period:
        return self._periods[item]

    @property
    def timeout(self) -> BoutTimeout:
        return self._timeout

    def getPeriodCount(self) -> int:
        return len(self._periods)

    def addPeriod(self) -> None:
        if len(self._periods) >= 2:
            raise RuntimeError("a Bout cannot have more than 2 Periods")

        # Remove any un-started Jams
        self._periods[-1].purge()

        self._periods.append(Period(self))

        self.update()

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            "uuid": self.uuid,
            "periodCount": len(self._periods),
            "currentJamNum": self._periods[-1].getCurrentJamNum(),
            "jamCounts": [
                self[0].getJamCount(),
                self[1].getJamCount() if len(self._periods) > 1 else 0,
            ],
        }


class Period(_GameNode[Bout], Timeable):
    API_NAME: str = "period"

    def __init__(self, parent: Bout) -> None:
        super().__init__(parent)
        self._timeToDerby: Timer = Timer(minutes=10)
        self._clock: Timer = Timer(minutes=30)
        self._hasStarted: bool = False
        self._jams: list[Jam] = [Jam(self)]

        self._timeToDerby.setCallback(lambda _: self.update())
        self._clock.setCallback(lambda _: self.update())

    def __getitem__(self, item: int) -> Jam:
        return self._jams[item]

    @property
    def parentBout(self) -> Bout:
        return self._parent

    def addJam(self) -> Jam:
        jam: Jam = Jam(self)
        self._jams.append(jam)

        self.update()
        return jam

    def deleteJam(self, index: int) -> None:
        del self._jams[index]
        if len(self._jams) == 0:
            self._jams.append(Jam(self))

        self.update()

    def purge(self) -> None:
        for i in reversed(range(len(self._jams))):
            if not self._jams[i].hasStarted:
                del self._jams[i]

        self.update()

    def setTimeToDerby(self, timestamp: datetime, *, hours: float = 0,
                       minutes: float = 0, seconds: float = 0) -> None:
        if self._timeToDerby.isRunning():
            self._timeToDerby.stop(timestamp)
        self._timeToDerby.setElapsed(None)
        self._timeToDerby.setAlarm(
            hours=hours, minutes=minutes, seconds=seconds)
        self._timeToDerby.start(timestamp)

        self.update()

    def startTimeToDerby(self, timestamp: datetime) -> None:
        if self._timeToDerby.isRunning():
            raise RuntimeError("Halftime is already running")
        self._timeToDerby.start(timestamp)

    def start(self, timestamp: datetime) -> None:
        if self.isRunning():
            raise RuntimeError("this Period has already started")
        self._clock.start(timestamp)
        self._timeToDerby.stop(timestamp)
        self._hasStarted = True

        self.update()

    def stop(self, timestamp: datetime) -> None:
        if not self.isRunning():
            raise RuntimeError("this Period has already stopped")
        self._clock.stop(timestamp)

        self.update()

    def isRunning(self) -> bool:
        return self._clock.isRunning()

    def getJamCount(self) -> int:
        return len(self._jams)

    def getCurrentJamNum(self) -> int:
        for i, jam in enumerate(reversed(self._jams)):
            if jam.hasStarted:
                return len(self._jams) - (i + 1)
        else:
            return 0  # No Jam has started so return the zeroeth Jam

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            "uuid": self.uuid,
            "timeToDerby": self._timeToDerby.encode(),
            "hasStarted": self._hasStarted,
            "clock": self._clock.encode(),
            "jamCount": len(self._jams),
        }


class Jam(_GameNode[Period], Timeable):
    API_NAME: str = "jam"

    def __init__(self, parent: Period) -> None:
        super().__init__(parent)
        self._clock: Timer = Timer(minutes=2)
        self._hasStarted: bool = False
        self._stopReason: None | STOP_REASONS = None
        self._score: JamTeamAttribute[Score] = JamTeamAttribute[Score](
            self, Score)

        self._clock.setCallback(lambda _: self.update())

    @property
    def parentPeriod(self) -> Period:
        return self._parent

    @property
    def stopReason(self) -> None | STOP_REASONS:
        return self._stopReason

    @stopReason.setter
    def stopReason(self, stopReason: None | STOP_REASONS) -> None:
        if stopReason is not None and stopReason not in get_args(STOP_REASONS):
            raise ValueError(f"""stopReason must be one of
                             {get_args(STOP_REASONS)}""")
        self._stopReason = stopReason
        self.update()

    @property
    def hasStarted(self) -> bool:
        return self._hasStarted

    @property
    def score(self) -> JamTeamAttribute[Score]:
        return self._score

    def lineup(self, timestamp: datetime) -> None:
        if self.hasStarted:
            raise RuntimeError("this Jam has already started")
        self._clock.setAlarm(seconds=30)
        self._clock.start(timestamp)

        self.update()

    def start(self, timestamp: datetime) -> None:
        if self._clock.isRunning():
            self._clock.stop(timestamp)
            self._clock.setElapsed(None)
        self._clock.setAlarm(minutes=2)
        self._clock.start(timestamp)
        self._hasStarted = True

        # Start the Period clock if it is not running
        if not self.parentPeriod.isRunning():
            self.parentPeriod.start(timestamp)
            # TODO check if TTD is running

        self.update()

    def stop(self, timestamp: datetime) -> None:
        self._clock.stop(timestamp)

        # Add a new Jam and start its Lineup
        newJam: Jam = self.parentPeriod.addJam()
        newJam.lineup(timestamp)

        self.update()

    def isRunning(self) -> bool:
        return self._hasStarted and self._clock.isRunning()

    def isComplete(self) -> bool:
        return self._hasStarted and not self._clock.isRunning()

    def getRemaining(self) -> timedelta:
        return self._clock.getRemaining()

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            "uuid": self.uuid,
            "clock": self._clock.encode(),
            "hasStarted": self.hasStarted,
            "stopReason": self.stopReason,
        }


series: Series = Series()
