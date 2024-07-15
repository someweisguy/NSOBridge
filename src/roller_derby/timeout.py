from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from server import Encodable
from roller_derby.attribute import AbstractAttribute, BoutTeamAttribute
from roller_derby.timer import Timer
from typing import get_args, Literal, Self, TypeAlias, TYPE_CHECKING
import server

if TYPE_CHECKING:
    from roller_derby.bout import TEAMS, Bout


OFFICIAL: TypeAlias = Literal["official"]


class TeamClockStoppage(AbstractAttribute[BoutTeamAttribute]):
    API_NAME: str = "stoppages"

    @dataclass
    class Stoppage(Timer):
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
        self._stoppages: list[TeamClockStoppage.Stoppage] = []

    def _add(self, stoppage: TeamClockStoppage.Stoppage) -> None:
        if stoppage in self._stoppages:
            return  # Do nothing
        if not stoppage.isOfficialReview:
            if self._timeoutsRemaining <= 0:
                # TODO: allow this action, but serve the user a Warning
                raise RuntimeError("this Team does not have any remaining Timeouts")
            self._timeoutsRemaining -= 1
            stoppage.setAlarm(minutes=1)
            stoppage.setCallback(lambda _: server.update(self._parent))
        else:
            if self._officialReviewsRemaining <= 0:
                # TODO: allow this action, but serve the user a Warning
                raise RuntimeError(
                    "this Team does not have any remaining Official Reviews"
                )
            self._officialReviewsRemaining -= 1
        self._stoppages.append(stoppage)

    def _delete(self, stoppage: TeamClockStoppage.Stoppage) -> None:
        self._stoppages.remove(stoppage)
        stoppage.setAlarm(None)
        stoppage.caller = None
        if stoppage.isOfficialReview:
            self._officialReviewsRemaining += 1
        else:
            self._timeoutsRemaining += 1

    def encode(self) -> dict[str, server.Encodable.PRIMITIVE]:
        return {
            "team": self.getTeam(),
            "timeoutsRemaining": self._timeoutsRemaining,
            "officialReviewsRemaining": self._officialReviewsRemaining,
            "stoppages": [stoppage.encode() for stoppage in self._stoppages],
        }


class BoutClockStoppage(BoutTeamAttribute[TeamClockStoppage]):
    API_NAME: str = "clockStoppage"

    def __init__(self, parent: Bout) -> None:
        super().__init__(parent, TeamClockStoppage)
        self._activeStoppage: None | TeamClockStoppage.Stoppage = None
        self._officialTimeouts: list[TeamClockStoppage.Stoppage] = []

    def call(self, timestamp: datetime) -> None:
        if self._activeStoppage is not None:
            raise RuntimeError("the Period clock is already stopped")
        self._activeStoppage = TeamClockStoppage.Stoppage(timestamp)

        server.update(self)

    def convertToTimeout(self) -> None:
        if self._activeStoppage is None:
            raise RuntimeError("a clock stoppage has not been called")
        if not self._activeStoppage.isOfficialReview:
            return

        if self._activeStoppage.caller is not None:
            team: TeamClockStoppage = (
                self.home if self._activeStoppage in self.home._stoppages else self.away
            )
            assert (
                self._activeStoppage in team._stoppages
            ), "clock stoppage is misconfigured"
            team._officialReviewsRemaining += 1
            team._timeoutsRemaining -= 1
        self._activeStoppage.isOfficialReview = False
        self._activeStoppage.setAlarm(minutes=1)

        server.update(self)

    def convertToOfficialReview(self) -> None:
        if self._activeStoppage is None:
            raise RuntimeError("a clock stoppage has not been called")
        if self._activeStoppage.isOfficialReview:
            return  # Nothing to do

        if self._activeStoppage.caller is not None:
            if self._activeStoppage.caller == "official":
                raise RuntimeError(
                    "cannot convert an Official Timeout into an Official Review"
                )
            team: TeamClockStoppage = (
                self.home if self._activeStoppage in self.home._stoppages else self.away
            )
            assert (
                self._activeStoppage in team._stoppages
            ), "clock stoppage is misconfigured"
            team._officialReviewsRemaining -= 1
            team._timeoutsRemaining += 1
        self._activeStoppage.setAlarm(None)
        self._activeStoppage.isOfficialReview = True

        server.update(self)

    def end(self, timestamp: datetime) -> None:
        if self._activeStoppage is None:
            raise RuntimeError("a clock stoppage has not been called")
        if self._activeStoppage is None:
            raise RuntimeError("the active clock stoppage has not been assigned")

        self._activeStoppage.stop(timestamp)
        self._activeStoppage = None

        server.update(self)

    def assign(self, source: TEAMS | OFFICIAL) -> None:
        if self._activeStoppage is None:
            raise RuntimeError("a clock stoppage has not been called")
        if self._activeStoppage.isOfficialReview and source in get_args(OFFICIAL):
            raise RuntimeError("Official Reviews must be assigned to a Team")

        # Remove the active Stoppage from its currently assigned location
        if self._activeStoppage.caller is not None:
            if self._activeStoppage in self._officialTimeouts:
                self._officialTimeouts.remove(self._activeStoppage)
            else:
                team: TeamClockStoppage = (
                    self.home
                    if self._activeStoppage in self.home._stoppages
                    else self.away
                )
                assert (
                    self._activeStoppage in team._stoppages
                ), "clock stoppage is misconfigured"
                team._delete(self._activeStoppage)

        # Assign the Stoppage to the appropriate team/official location
        if source in get_args(TEAMS):
            self[source]._add(self._activeStoppage)  # type: ignore
            if not self._activeStoppage.isOfficialReview:
                self._activeStoppage.setCallback(lambda _: server.update(self))
        else:
            self._officialTimeouts.append(self._activeStoppage)
        self._activeStoppage.caller = source

        server.update(self)

    def resolve(self, retained: bool, notes: str) -> None:
        if self._activeStoppage is None:
            raise RuntimeError("an Official Review has not been called")

        # Don't check if the Stoppage instance is a Official Review - we will
        # keep the isRetained flag and Stoppage notes in RAM so that the user
        # can make changes for as long as they would like. That is, until the
        # file is saved and the server is shutdown; only Official reviews will
        # save the isRetained flag and notes field to disk. Timeouts will not
        # store these values to disk.

        self._activeStoppage.isRetained = retained
        self._activeStoppage.notes = notes

        server.update(self)

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            "activeStoppage": self._activeStoppage.encode()
            if self._activeStoppage is not None
            else None,
            "home": self.home.encode(),
            "away": self.away.encode(),
        }
