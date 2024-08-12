from __future__ import annotations
from datetime import datetime
from roller_derby.attribute import TeamAttribute
from roller_derby.score import Score
from roller_derby.timeout import TimeoutAttribute
from roller_derby.timer import Timer
from server import Encodable
from typing import get_args, Literal, TypeAlias
import server


TEAMS: TypeAlias = Literal['home', 'away']
STOP_REASONS: TypeAlias = Literal['time', 'called', 'injury']


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
            'bouts': [bout.encode() for bout in self._bouts],
        }


class Bout(Encodable):
    API_NAME: str = 'bout'

    def __init__(self) -> None:
        super().__init__()
        self._intermissionClock: Timer = Timer(minutes=10)
        self._periodClock: Timer = Timer(minutes=30)
        self._lineupClock: Timer = Timer(seconds=30)
        self._jamClock: Timer = Timer(minutes=2)
        self._timeoutClock: Timer = Timer(minutes=1)

        self._currentPeriod: int = 0

        self._jams: tuple[list[Jam], list[Jam]] = ([Jam(self)], [])
        self._overtimeJamNum: None | int = None

        self._timeout: TimeoutAttribute = TimeoutAttribute(self)

    @property
    def currentPeriod(self) -> int:
        return self._currentPeriod

    @property
    def jams(self) -> tuple[list[Jam], list[Jam]]:
        return self._jams

    @property
    def timeout(self) -> TimeoutAttribute:
        return self._timeout

    def endPeriod(self, timestamp: datetime) -> None:
        if not self._periodClock.isStarted():
            raise RuntimeError('this Period is not running')
        elif self._jamClock.isStarted():
            raise RuntimeError('cannot end the Period while a Jam is running')

        self._periodClock.stop(timestamp)
        self._currentPeriod += 1

        # Add a Jam to the next Period
        if self._currentPeriod < len(self._jams):
            self._jams[self._currentPeriod].append(Jam(self))

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            'uuid': self.uuid,
            'clocks': {
                'intermission': self._intermissionClock.encode(),
                'period': self._periodClock.encode(),
                'lineup': self._lineupClock.encode(),
                'jam': self._jamClock.encode(),
                'timeout': self._timeoutClock.encode()
            },
            'currentPeriodNum': self._currentPeriod,
            'jamCounts': [len(period) for period in self._jams],
            'overtimeJamNum': self._overtimeJamNum,
            'timeout': self._timeout.encode()
        }


class Jam(Encodable):
    API_NAME: str = 'jam'

    def __init__(self, parent: Bout) -> None:
        super().__init__()
        self._parent: Bout = parent

        self._startTime: None | datetime = None
        self._stopTime: None | datetime = None
        self._stopReason: None | STOP_REASONS = None

        self._score: TeamAttribute[Score] = TeamAttribute(Score(self),
                                                          Score(self))
        # TODO: self._lineup

    @property
    def parent(self) -> Bout:
        return self._parent

    @property
    def stopReason(self) -> None | STOP_REASONS:
        return self._stopReason

    @stopReason.setter
    def stopReason(self, stopReason: None | STOP_REASONS) -> None:
        if stopReason is not None and stopReason not in get_args(STOP_REASONS):
            raise ValueError((f'stopReason must be None or one of '
                              f'{get_args(STOP_REASONS)}'))
        self._stopReason = stopReason
        server.update(self)

    @property
    def score(self) -> TeamAttribute[Score]:
        return self._score

    def start(self, timestamp: datetime) -> None:
        if self.isStarted():
            raise RuntimeError('this Jam is already running')

        # Start the Period clock if it is not running
        periodClock: Timer = self._parent._periodClock
        if not periodClock.isRunning():
            periodClock.start(timestamp)

        # Stop the intermission clock if it is running
        intermissionClock: Timer = self._parent._intermissionClock
        if intermissionClock.isRunning():
            intermissionClock.stop(timestamp)

        # Reset the Lineup clock and start the Jam clock
        lineupClock: Timer = self._parent._lineupClock
        if lineupClock.isRunning():
            lineupClock.stop(timestamp)
        lineupClock.setElapsed(seconds=0)
        self._parent._jamClock.start(timestamp)
        server.update(self._parent)

        self._startTime = timestamp
        server.update(self)

    def stop(self, timestamp: datetime) -> None:
        if not self.isStarted():
            raise RuntimeError('this Jam is not running')

        # Reset the Jam clock and start the Lineup clock
        jamClock: Timer = self._parent._jamClock
        jamClock.stop(timestamp)
        jamClock.setElapsed(seconds=0)
        self._parent._lineupClock.start(timestamp)

        # Attempt to determine the probable stop reason
        if self._parent._jamClock.getRemaining().total_seconds() <= 0:
            self._stopReason = 'time'
        elif self._score.home.lead or self._score.away.lead:
            self._stopReason = 'called'

        # Instantiate a new Jam
        periodIndex: int = self._parent._currentPeriod
        self._parent._jams[periodIndex].append(Jam(self._parent))
        server.update(self.parent)

        self._stopTime = timestamp
        server.update(self)

    def isStarted(self) -> bool:
        return self._startTime is not None

    def isStopped(self) -> bool:
        return self._stopTime is not None

    def isRunning(self) -> bool:
        return self.isStarted() and not self.isStopped()

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            'uuid': self.uuid,
            'startTime': (str(self._startTime) if self._startTime is not None
                          else None),
            'stopTime': (str(self._stopTime) if self._stopTime is not None
                         else None),
            'stopReason': self._stopReason,
            'score': self._score.encode()
        }


series: Series = Series()
