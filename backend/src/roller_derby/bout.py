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
STOP_REASONS: TypeAlias = Literal['time', 'called', 'injury', 'other']


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
        self._periodClock: Timer = Timer(seconds=15)  # TODO: 30min
        self._lineupClock: Timer = Timer(seconds=30)
        self._jamClock: Timer = Timer(minutes=2)
        self._timeoutClock: Timer = Timer(minutes=1)

        # Set update alarms for each clock
        def intermissionCallback(now: datetime) -> None:
            self._intermissionClock.stop(now)
            server.update(self)
        self._intermissionClock.setCallback(intermissionCallback)
        clocks: tuple[Timer, ...] = (self._periodClock, self._lineupClock,
                                     self._jamClock, self._timeoutClock)
        for clock in clocks:
            clock.setCallback(lambda _: server.update(self))

        self._periods: tuple[Period, Period] = (Period(self), Period(self))
        self._periods[0].addJam()
        self._overtimeJamNum: None | int = None

        self._timeout: TimeoutAttribute = TimeoutAttribute(self)

    def __getitem__(self, item: int) -> Period:
        return self._periods[item]

    @property
    def intermissionClock(self) -> Timer:
        return self._intermissionClock

    @property
    def periodClock(self) -> Timer:
        return self._periodClock

    @property
    def lineupClock(self) -> Timer:
        return self._lineupClock

    @property
    def jamClock(self) -> Timer:
        return self._jamClock

    @property
    def timeoutClock(self) -> Timer:
        return self._timeoutClock

    @property
    def currentPeriod(self) -> int:
        return int(self._periods[0].isFinalized())

    @property
    def timeout(self) -> TimeoutAttribute:
        return self._timeout

    def update(self) -> None:
        server.update(self)

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
            'currentPeriodNum': self.currentPeriod,
            'periods': [period.encode() for period in self._periods],
            'overtimeJamNum': self._overtimeJamNum,
            'timeout': self._timeout.encode()
        }


class Period(Encodable):
    def __init__(self, parent: Bout) -> None:
        # Don't call super().__init__()
        self._parent: Bout = parent
        self._startTime: None | datetime = None
        self._stopTime: None | datetime = None
        self._finalizedTime: None | datetime = None
        self._jams: list[Jam] = []

    def __getitem__(self, item: int) -> Jam:
        return self._jams[item]

    def __len__(self) -> int:
        return len(self._jams)

    @property
    def parentBout(self) -> Bout:
        return self._parent

    def startIntermission(self, timestamp: datetime) -> None:
        if self.isStarted():
            raise RuntimeError('this Period has already started')
        if self.parentBout.intermissionClock.isRunning():
            raise RuntimeError('this Intermission is already running')

        self.parentBout.intermissionClock.setElapsed(seconds=0)
        self.parentBout.intermissionClock.start(timestamp)

        self.update()

    def stopIntermission(self, timestamp: datetime) -> None:
        if not self.parentBout.intermissionClock.isRunning():
            raise RuntimeError('this Intermission is not running')

        self.parentBout.intermissionClock.stop(timestamp)

        self.update()

    def start(self, timestamp: datetime) -> None:
        if self.isStarted():
            raise RuntimeError('this Period has already started')

        # Stop the intermission clock and start the Period
        if self.parentBout.intermissionClock.isRunning():
            self.parentBout.intermissionClock.stop(timestamp)
        self._startTime = timestamp

        # Start the Lineup clock
        if (not self._jams[-1].isRunning()
                and not self.parentBout.lineupClock.isRunning()):
            self.parentBout.lineupClock.setElapsed(seconds=0)
            self.parentBout.lineupClock.start(timestamp)

        self.update()

    def stop(self, timestamp: datetime) -> None:
        if not self.isRunning():
            raise RuntimeError('this Period is not running')
        if self._jams[-1].isStarted():
            raise RuntimeError('cannot end the Period while a Jam is running')

        # Stop the clocks and the Period
        clocks: tuple[Timer, ...] = (self.parentBout.lineupClock,
                                     self.parentBout.periodClock,
                                     self.parentBout.timeoutClock,
                                     self.parentBout.intermissionClock)
        for clock in clocks:
            if clock.isRunning():
                clock.stop(timestamp)
        self._stopTime = timestamp

        # Delete all unstarted Jams, if they exist
        if len(self._jams) > 0 and self._jams[0].isStarted():
            self._jams = [jam for jam in self._jams if jam.isStarted()]

        # Instantiate a Jam for the second Period
        if self is self.parentBout._periods[0]:
            self.parentBout._periods[1].addJam()

        self.update()

    def finalize(self, timestamp: datetime) -> None:
        if self.isFinalized():
            raise RuntimeError('this Period has already been finalized')
        self._finalizedTime = timestamp

    def isStarted(self) -> bool:
        return self._startTime is not None

    def isStopped(self) -> bool:
        return self._stopTime is not None

    def isRunning(self) -> bool:
        return self.isStarted() and not self.isStopped()

    def isFinalized(self) -> bool:
        return self._finalizedTime is not None

    def addJam(self) -> None:
        if len(self._jams) > 0 and not self._jams[-1].isStopped():
            raise RuntimeError('the latest Jam is not finished')
        if self.isFinalized():
            raise RuntimeError('cannot add a Jam to a finalized Period')
        self._jams.append(Jam(self))
        self.update()

    def update(self) -> None:
        self.parentBout.update()

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            'startTime': (str(self._startTime) if self._startTime is not None
                          else None),
            'stopTime': (str(self._stopTime) if self._stopTime is not None
                         else None),
            'finalizedTime': (str(self._finalizedTime) if self._finalizedTime
                              is not None else None),
            'jamCount': len(self._jams)
        }


class Jam(Encodable):
    API_NAME: str = 'jam'

    def __init__(self, parent: Period) -> None:
        super().__init__()
        self._parent: Period = parent

        self._startTime: None | datetime = None
        self._stopTime: None | datetime = None
        self._stopReason: None | STOP_REASONS = None

        self._score: TeamAttribute[Score] = TeamAttribute(Score(self),
                                                          Score(self))
        # TODO: self._lineup

    @property
    def parentPeriod(self) -> Period:
        return self._parent

    @property
    def parentBout(self) -> Bout:
        return self._parent.parentBout

    @property
    def stopReason(self) -> None | STOP_REASONS:
        return self._stopReason

    @stopReason.setter
    def stopReason(self, stopReason: None | STOP_REASONS) -> None:
        if stopReason is not None and stopReason not in get_args(STOP_REASONS):
            raise ValueError((f'stopReason must be None or one of '
                              f'{get_args(STOP_REASONS)}'))
        self._stopReason = stopReason
        self.update()

    @property
    def score(self) -> TeamAttribute[Score]:
        return self._score

    def start(self, timestamp: datetime) -> None:
        if self.isStarted():
            raise RuntimeError('this Jam is already running')

        # Start the Period clock if it is not running
        periodClock: Timer = self.parentBout.periodClock
        if not periodClock.isRunning():
            periodClock.start(timestamp)

        # Stop the intermission clock if it is running
        intermissionClock: Timer = self.parentBout.intermissionClock
        if intermissionClock.isRunning():
            intermissionClock.stop(timestamp)

        # Reset the Lineup clock and start the Jam clock
        if self.parentBout.lineupClock.isRunning():
            self.parentBout.lineupClock.stop(timestamp)
            self.parentBout.lineupClock.setElapsed(seconds=0)
        self.parentBout.jamClock.start(timestamp)

        self._startTime = timestamp

        # Start the Period if it isn't started already
        if not self.parentPeriod.isStarted():
            self.parentPeriod.start(timestamp)

        self.update()

    def stop(self, timestamp: datetime) -> None:
        if not self.isStarted():
            raise RuntimeError('this Jam is not running')

        # Reset the Jam clock and start the Lineup clock
        if self.parentBout.jamClock.isRunning():
            self.parentBout.jamClock.stop(timestamp)
            self.parentBout.jamClock.setElapsed(seconds=0)
        self.parentBout.lineupClock.start(timestamp)

        # Attempt to determine the probable stop reason
        if self.parentBout.jamClock.getRemaining().total_seconds() <= 0:
            self._stopReason = 'time'
        elif self._score.home.lead or self._score.away.lead:
            self._stopReason = 'called'
        else:
            self._stopReason = 'other'

        # Stop this Jam and instantiate a new one
        self._stopTime = timestamp
        self.parentPeriod.addJam()

        self.update()

    def isStarted(self) -> bool:
        return self._startTime is not None

    def isStopped(self) -> bool:
        return self._stopTime is not None

    def isRunning(self) -> bool:
        return self.isStarted() and not self.isStopped()

    def update(self) -> None:
        server.update(self)
        self.parentPeriod.update()

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
