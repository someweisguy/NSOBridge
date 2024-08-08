from __future__ import annotations
from datetime import datetime
from roller_derby.attribute import JamTeamAttribute
from roller_derby.score import Score
from roller_derby.timeout import BoutTimeout
from roller_derby.timer import Timeable, Timer
from server import Encodable
from typing import get_args, Literal, TypeAlias


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

        self._timeout: BoutTimeout = BoutTimeout(self)

    @property
    def currentPeriod(self) -> int:
        return self._currentPeriod

    @property
    def jams(self) -> tuple[list[Jam], list[Jam]]:
        return self._jams

    @property
    def timeout(self) -> BoutTimeout:
        return self._timeout

    def stopPeriod(self, timestamp: datetime) -> None:
        if not self._periodClock.isRunning():
            raise RuntimeError('this Period is not running')
        elif self._jamClock.isRunning():
            raise RuntimeError('cannot stop a Period while a Jam is running')

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
            'jamCounts': [len(period) for period in self._jams]
            # TODO: timeouts
        }


class Jam(Encodable, Timeable):
    def __init__(self, parentBout: Bout) -> None:
        super().__init__()
        self._parentBout: Bout = parentBout

        self._startTime: None | datetime = None
        self._stopTime: None | datetime = None
        self._stopReason: None | STOP_REASONS = None

        self._score: JamTeamAttribute[Score] = JamTeamAttribute[Score](
            self, Score)

    @property
    def parentBout(self) -> Bout:
        return self._parentBout

    @property
    def stopReason(self) -> None | STOP_REASONS:
        return self._stopReason

    @stopReason.setter
    def stopReason(self, stopReason: None | STOP_REASONS) -> None:
        if stopReason is not None and stopReason not in get_args(STOP_REASONS):
            raise ValueError((f'stopReason must be None or one of '
                              f'{get_args(STOP_REASONS)}'))
        self._stopReason = stopReason

    @property
    def score(self) -> JamTeamAttribute[Score]:
        return self._score

    def start(self, timestamp: datetime) -> None:
        if self.isRunning():
            raise RuntimeError('this Jam is already running')

        # Start the Period clock if it is not running
        periodClock: Timer = self._parentBout._periodClock
        if not periodClock.isRunning():
            periodClock.start(timestamp)

        # Reset the Lineup clock and start the Jam clock
        lineupClock: Timer = self._parentBout._lineupClock
        lineupClock.stop(timestamp)
        lineupClock.setElapsed(seconds=0)
        self._parentBout._jamClock.start(timestamp)

        self._startTime = timestamp

    def stop(self, timestamp: datetime) -> None:
        if not self.isRunning():
            raise RuntimeError('this Jam is not running')

        # Reset the Jam clock and start the Lineup clock
        jamClock: Timer = self._parentBout._jamClock
        jamClock.stop(timestamp)
        jamClock.setElapsed(seconds=0)
        self._parentBout._lineupClock.start(timestamp)

        # Attempt to determine the probable stop reason
        if self._parentBout._jamClock.getRemaining().total_seconds() <= 0:
            self._stopReason = 'time'
        elif self._score.home.getLead() or self._score.away.getLead():
            self._stopReason = 'called'

        # Instantiate a new Jam
        periodIndex: int = self._parentBout._currentPeriod
        self._parentBout._jams[periodIndex].append(Jam(self._parentBout))

        self._stopTime = timestamp

    def isRunning(self) -> bool:
        return self._startTime is not None

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            'uuid': self.uuid,
            'startTime': str(self._startTime),
            'stopTime': str(self._stopTime),
            'stopReason': self._stopReason,
            # TODO: score
        }


series: Series = Series()
