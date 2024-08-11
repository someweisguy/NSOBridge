from __future__ import annotations
from datetime import datetime
from roller_derby.attribute import AbstractAttribute, TeamAttribute
from server import Encodable
from typing import get_args, Literal, TypeAlias, TYPE_CHECKING
import server

if TYPE_CHECKING:
    from roller_derby.bout import TEAMS, Bout


OFFICIAL: TypeAlias = Literal['official']


class Timeout(Encodable):
    def __init__(self, timestamp: datetime) -> None:
        super().__init__()
        self.team: TEAMS | OFFICIAL = 'official'
        self.startTime: datetime = timestamp
        self.stopTime: None | datetime = None
        self.isOfficialReview: bool = False
        self.isRetained: bool = False
        self.notes: str = ''

    def isStarted(self) -> bool:
        return self.startTime is not None

    def isFinished(self) -> bool:
        return self.stopTime is not None

    def isRunning(self) -> bool:
        return self.isStarted() and not self.isFinished()

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            'team': self.team,
            'startTime': str(self.startTime),
            'stopTime': (str(self.stopTime) if self.stopTime is not None
                         else None),
            'isOfficialReview': self.isOfficialReview,
            **({'isRetained': self.isRetained, 'notes': self.notes}
                if self.isOfficialReview else {})
        }


class _TimeoutCounter(AbstractAttribute):
    def __init__(self) -> None:
        # Don't call super().__init__()
        self._timeoutsRemaining: int = 3
        self._officialReviewsRemaining: int = 1

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            'timeoutsRemaining': self._timeoutsRemaining,
            'officialReviewsRemaining': self._officialReviewsRemaining
        }


class TimeoutAttribute(TeamAttribute[_TimeoutCounter]):
    def __init__(self, parent: Bout) -> None:
        super().__init__(_TimeoutCounter(), _TimeoutCounter())
        self._parent: Bout = parent
        self._timeouts: list[Timeout] = []

    @property
    def allTimeouts(self) -> list[Timeout]:
        return self._timeouts

    def call(self, timestamp: datetime) -> None:
        if len(self._timeouts) > 0 and self._timeouts[-1].isRunning():
            raise RuntimeError('there already is a Timeout running')
        self._timeouts.append(Timeout(timestamp))

        # Start the Timeout clock
        if self._parent._periodClock.isRunning():
            self._parent._periodClock.stop(timestamp)
        self._parent._timeoutClock.start(timestamp)

        server.update(self._parent)

    def assign(self, team: TEAMS | OFFICIAL) -> None:
        if len(self._timeouts) == 0 or not self._timeouts[-1].isRunning():
            raise RuntimeError('there is no Timeout currently running')
        if team not in get_args(TEAMS) + get_args(OFFICIAL):
            raise TypeError(f'team must be one of '
                            f'{get_args(TEAMS) + get_args(OFFICIAL)}')
        self._timeouts[-1].team = team

        server.update(self._parent)

    def convertToOfficialReview(self) -> None:
        if len(self._timeouts) == 0 or not self._timeouts[-1].isRunning():
            raise RuntimeError('there is no Timeout currently running')
        if self._timeouts[-1].isOfficialReview:
            return  # Do nothing
        self._timeouts[-1].isOfficialReview = True

        server.update(self._parent)

    def convertToTimeout(self) -> None:
        if len(self._timeouts) == 0 or not self._timeouts[-1].isRunning():
            raise RuntimeError('there is no Timeout currently running')
        if not self._timeouts[-1].isOfficialReview:
            return  # Do nothing
        self._timeouts[-1].isOfficialReview = False

        server.update(self._parent)

    def setIsRetained(self, isRetained: bool) -> None:
        if len(self._timeouts) == 0 or not self._timeouts[-1].isRunning():
            raise RuntimeError('there is no Timeout currently running')
        self._timeouts[-1].isRetained = isRetained

        server.update(self._parent)

    def setNotes(self, notes: str) -> None:
        if len(self._timeouts) == 0 or not self._timeouts[-1].isRunning():
            raise RuntimeError('there is no Timeout currently running')
        self._timeouts[-1].notes = notes

        server.update(self._parent)

    def end(self, timestamp: datetime) -> None:
        if len(self._timeouts) == 0 or not self._timeouts[-1].isRunning():
            raise RuntimeError('there is no Timeout currently running')
        timeout: Timeout = self._timeouts[-1]
        if timeout.team == 'official' and timeout.isOfficialReview:
            raise RuntimeError('Official Reviews must be assigned to a Team')
        timeout.stopTime = timestamp

        self._parent._timeoutClock.stop(timestamp)

        if timeout.team == 'official':
            server.update(self._parent)
            return  # Don't need to track Official Timeouts

        # Update the Timeout and Official Review counter
        if timeout.isOfficialReview:
            count: int = int(not timeout.isRetained)
            self[timeout.team]._officialReviewsRemaining -= count
        else:
            self[timeout.team]._timeoutsRemaining -= 1

        server.update(self._parent)

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            **super().encode(),
            'timeouts': [timeout.encode() for timeout in self._timeouts]
        }
