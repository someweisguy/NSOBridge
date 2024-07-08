from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from .teamAttribute import AbstractAttribute, TeamAttribute
from typing import Callable, get_args, Literal, Self
import roller_derby.bout as bout
import server


class Stoppages(AbstractAttribute):
    from roller_derby.timer import Timer

    API_NAME: str = "stoppages"

    @dataclass
    class Instance(Timer):
        isAssigned: bool = False
        isOfficialReview: bool = False
        isRetained: bool = False
        notes: str = ""

        def __init__(
            self, timestamp: datetime, callback: Callable[[datetime], None]
        ) -> None:
            self.start(timestamp, callback)

        def encode(self) -> dict[str, server.Encodable.PRIMITIVE]:
            return super().encode() | {
                "isAssigned": self.isAssigned,
                "isOfficialReview": self.isOfficialReview,
                "isRetained": self.isRetained,
                "notes": self.notes,
            }

    def __init__(self, parent: TeamAttribute[Self]) -> None:
        super().__init__(parent)
        self._timeoutsRemaining: int = 3
        self._officialReviewsRemaining: int = 1
        self._stoppages: list[Stoppages.Instance] = []

    def _add(self, stoppage: Stoppages.Instance) -> None:
        if stoppage in self._stoppages:
            return  # Do nothing
        if not stoppage.isOfficialReview:
            if self._timeoutsRemaining <= 0:
                # TODO: allow this action, but serve the user a Warning
                raise RuntimeError("this Team does not have any remaining Timeouts")
            self._timeoutsRemaining -= 1
        else:
            if self._officialReviewsRemaining <= 0:
                # TODO: allow this action, but serve the user a Warning
                raise RuntimeError(
                    "this Team does not have any remaining Official Reviews"
                )
            self._officialReviewsRemaining -= 1
        self._stoppages.append(stoppage)
        stoppage.isAssigned = True

    def _delete(self, stoppage: Stoppages.Instance) -> None:
        self._stoppages.remove(stoppage)
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


class ClockStoppage(TeamAttribute[Stoppages]):
    API_NAME: str = "clockStoppage"
    OFFICIALS = Literal["official"]

    def __init__(self) -> None:
        super().__init__(Stoppages)
        self._activeStoppage: None | Stoppages.Instance = None
        self._officialTimeouts: list[Stoppages.Instance] = []

    def call(self, timestamp: datetime) -> None:
        if self._activeStoppage is not None:
            raise RuntimeError("the Period clock is already stopped")
        self._activeStoppage = Stoppages.Instance(
            timestamp, lambda _: server.update(self)
        )
        server.update(self)

    def convertToTimeout(self) -> None:
        if self._activeStoppage is None:
            raise RuntimeError("a clock stoppage has not been called")
        if not self._activeStoppage.isOfficialReview:
            return

        if self._activeStoppage.isAssigned:
            team: Stoppages = (
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

        if self._activeStoppage.isAssigned:
            if self._activeStoppage in self._officialTimeouts:
                raise RuntimeError(
                    "cannot convert an Official Timeout into an Official Review"
                )
            team: Stoppages = (
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
        if not self._activeStoppage.isAssigned:
            raise RuntimeError("the active clock stoppage has not been assigned")

        self._activeStoppage.stop(timestamp)
        self._activeStoppage = None

        server.update(self)

    def assign(self, source: bout.Jam.TEAMS | ClockStoppage.OFFICIALS) -> None:
        if self._activeStoppage is None:
            raise RuntimeError("a clock stoppage has not been called")
        if self._activeStoppage.isOfficialReview and source in get_args(
            ClockStoppage.OFFICIALS
        ):
            raise RuntimeError("Official Reviews must be assigned to a Team")

        # Remove the active Stoppage from its currently assigned location
        if self._activeStoppage.isAssigned:
            if self._activeStoppage in self._officialTimeouts:
                self._officialTimeouts.remove(self._activeStoppage)
            else:
                team: Stoppages = (
                    self.home
                    if self._activeStoppage in self.home._stoppages
                    else self.away
                )
                assert (
                    self._activeStoppage in team._stoppages
                ), "clock stoppage is misconfigured"
                team._delete(self._activeStoppage)

        # Assign the Stoppage to the appropriate team/official location
        if source in get_args(bout.Jam.TEAMS):
            assert isinstance(source, bout.Jam.TEAMS), "Stoppage is misconfigured"
            self[source]._add(self._activeStoppage)
        else:
            self._officialTimeouts.append(self._activeStoppage)
        self._activeStoppage.isAssigned = True

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

    def encode(self) -> dict[str, server.Encodable.PRIMITIVE]:
        return super().encode() | {
            "activeStoppage": self._activeStoppage.encode()
            if self._activeStoppage is not None
            else None,
            "officialTimeoutCount": len(self._officialTimeouts),
        }
