from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from server import Encodable
from roller_derby.attribute import AbstractAttribute, BoutTeamAttribute
from roller_derby.timer import Timer
from typing import get_args, Literal, Self, TypeAlias, TYPE_CHECKING
import roller_derby.bout as bout
import server

if TYPE_CHECKING:
    from roller_derby.bout import TEAMS, Bout


OFFICIAL: TypeAlias = Literal["official"]


class TimeoutAttribute(AbstractAttribute[BoutTeamAttribute]):
    API_NAME: str = "teamTimeout"

    @dataclass
    class Timeout(Timer):
        caller: None | TEAMS | OFFICIAL = None
        isOfficialReview: bool = False
        isRetained: bool = False
        notes: str = ""

        def __init__(self, timestamp: datetime) -> None:
            super().__init__()
            self.start(timestamp)

        def encode(self) -> dict[str, Encodable.PRIMITIVE]:
            return super().encode() | {
                "caller": self.caller,
                "isOfficialReview": self.isOfficialReview,
                "isRetained": self.isRetained,
                "notes": self.notes,
            }

    def __init__(self, parent: BoutTeamAttribute[Self]) -> None:
        super().__init__(parent)
        self._timeoutsRemaining: int = 3
        self._officialReviewsRemaining: int = 1
        self._timeouts: list[TimeoutAttribute.Timeout] = []

    def _add(self, timeout: TimeoutAttribute.Timeout) -> None:
        if timeout in self._timeouts:
            return  # Do nothing
        if not timeout.isOfficialReview:
            if self._timeoutsRemaining <= 0:
                # TODO: allow this action, but serve the user a Warning
                raise RuntimeError(
                    "this Team does not have any remaining Timeouts")
            self._timeoutsRemaining -= 1
            timeout.setAlarm(minutes=1)
            timeout.setCallback(lambda _: server.update(self._parent))
        else:
            if self._officialReviewsRemaining <= 0:
                # TODO: allow this action, but serve the user a Warning
                raise RuntimeError(
                    "this Team does not have any remaining Official Reviews"
                )
            self._officialReviewsRemaining -= 1
        self._timeouts.append(timeout)

    def _delete(self, timeout: TimeoutAttribute.Timeout) -> None:
        self._timeouts.remove(timeout)
        timeout.setAlarm(None)
        timeout.caller = None
        if timeout.isOfficialReview:
            self._officialReviewsRemaining += 1
        else:
            self._timeoutsRemaining += 1

    def encode(self) -> dict[str, server.Encodable.PRIMITIVE]:
        return {
            "team": self.getTeam(),
            "timeoutsRemaining": self._timeoutsRemaining,
            "officialReviewsRemaining": self._officialReviewsRemaining,
            "timeouts": [timeout.encode() for timeout in self._timeouts],
        }


class BoutTimeout(BoutTeamAttribute[TimeoutAttribute]):
    API_NAME: str = "boutTimeout"

    def __init__(self, parent: Bout) -> None:
        super().__init__(parent, TimeoutAttribute)
        self._current: None | TimeoutAttribute.Timeout = None
        self._officialTimeouts: list[TimeoutAttribute.Timeout] = []

    def call(self, timestamp: datetime) -> None:
        if self._current is not None:
            raise RuntimeError("the Period clock is already stopped")
        self._current = TimeoutAttribute.Timeout(timestamp)

        server.update(self)

    def convertToTimeout(self) -> None:
        if self._current is None:
            raise RuntimeError("a Timeout has not been called")
        if not self._current.isOfficialReview:
            return

        if self._current.caller is not None:
            team: TimeoutAttribute = (self.home if self._current in
                                      self.home._timeouts else self.away)
            assert self._current in team._timeouts, "timeout is misconfigured"
            team._officialReviewsRemaining += 1
            team._timeoutsRemaining -= 1
        self._current.isOfficialReview = False
        self._current.setAlarm(minutes=1)

        server.update(self)

    def convertToOfficialReview(self) -> None:
        if self._current is None:
            raise RuntimeError("a Timeout has not been called")
        if self._current.isOfficialReview:
            return  # Nothing to do

        if self._current.caller is not None:
            if self._current.caller == "official":
                raise RuntimeError("""cannot convert an Official Timeout into
                                   an Official Review""")
            team: TimeoutAttribute = (self.home if self._current in
                                      self.home._timeouts else self.away)
            assert self._current in team._timeouts, "timeout is misconfigured"
            team._officialReviewsRemaining -= 1
            team._timeoutsRemaining += 1
        self._current.setAlarm(None)
        self._current.isOfficialReview = True

        server.update(self)

    def end(self, timestamp: datetime) -> None:
        if self._current is None:
            raise RuntimeError("a Timeout has not been called")
        if self._current.caller is None:
            raise RuntimeError("the active Timeout has not been assigned")

        self._current.stop(timestamp)
        self._current = None

        server.update(self)

    def assign(self, source: TEAMS | OFFICIAL) -> None:
        if self._current is None:
            raise RuntimeError("a Timeout has not been called")
        if self._current.isOfficialReview and source in get_args(OFFICIAL):
            raise RuntimeError("Official Reviews must be assigned to a Team")

        # Remove the active Stoppage from its currently assigned location
        if self._current.caller is not None:
            if self._current in self._officialTimeouts:
                self._officialTimeouts.remove(self._current)
            else:
                team: TimeoutAttribute = (self.home if self._current in
                                          self.home._timeouts else self.away)
                assert self._current in team._timeouts
                team._delete(self._current)

        # Assign the Stoppage to the appropriate team/official location
        if source in get_args(bout.TEAMS):
            self[source]._add(self._current)  # type: ignore
            if not self._current.isOfficialReview:
                self._current.setCallback(lambda _: server.update(self))
        else:
            self._officialTimeouts.append(self._current)
        self._current.caller = source

        server.update(self)

    def resolve(self, retained: bool, notes: str) -> None:
        if self._current is None:
            raise RuntimeError("an Official Review has not been called")

        # Don't check if the Stoppage instance is a Official Review - we will
        # keep the isRetained flag and Stoppage notes in RAM so that the user
        # can make changes for as long as they would like. That is, until the
        # file is saved and the server is shutdown; only Official reviews will
        # save the isRetained flag and notes field to disk. Timeouts will not
        # store these values to disk.

        self._current.isRetained = retained
        self._current.notes = notes

        server.update(self)

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            "current": (self._current.encode() if self._current is not None
                        else None),
            "home": self.home.encode(),
            "away": self.away.encode(),
        }
