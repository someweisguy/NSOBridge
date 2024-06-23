from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Literal, get_args

from .encodable import ClientException, Encodable
from .timer import TimeKeeper, Timer
import server


@dataclass
class JamIndex(Encodable):
    period: int
    jam: int

    @staticmethod
    def decode(index: dict[str, int]) -> JamIndex:
        return JamIndex(**index)

    def encode(self) -> dict:
        return {"period": self.period, "jam": self.jam}


class Bout(Encodable):
    def __init__(self) -> None:
        self._periods: tuple[list[Jam], ...] = ([Jam(self)], [], [])
        self._currentPeriod: list[Jam] = self._periods[0]
        self._timer: TimeKeeper = TimeKeeper()

    def __getitem__(self, periodIndex: int) -> list[Jam]:
        return self._periods[periodIndex]

    @property
    def timer(self) -> TimeKeeper:
        return self._timer

    @property
    def currentPeriod(self) -> list[Jam]:
        return self._currentPeriod

    @property
    def currentJam(self) -> Jam:
        for period in reversed(self._periods):
            for jam in reversed(period):
                if jam.isStarted():
                    return jam
        else:
            return self._periods[0][0]

    @property
    def periods(self) -> tuple[list[Jam], ...]:
        return tuple(self._periods)

    @property
    def inOvertime(self) -> bool:
        return self.currentJam in self._periods[2]

    def addJam(self, period: int) -> None:
        self._periods[period].append(Jam(self))
        server.update(self)

    def deleteJam(self, period: int) -> None:
        self._periods[period].pop()
        if len(self.currentPeriod) == 0:
            self.currentPeriod.append(Jam(self))
        server.update(self)

    def encode(self) -> dict:
        return {
            "currentPeriod": self._periods.index(self.currentPeriod),
            "jams": [[jam.encode() for jam in period] for period in self._periods],
        }


class Jam(Encodable):
    STOP_REASONS = Literal["called", "injury", "time", "unknown"]

    @dataclass
    class Trip(Encodable):
        points: int
        timestamp: datetime

        def encode(self) -> dict[str, Any]:
            return {
                "points": self.points,
                "timestamp": str(self.timestamp),
            }

    class Team(Encodable):
        def __init__(self, parent: Jam, team: Literal["home", "away"]) -> None:
            self._parent: Jam = parent
            self._team: Literal["home", "away"] = team
            self._lead: bool = False
            self._lost: bool = False
            self._star_pass: Literal[False] | int = False
            self._trips: list[Jam.Trip] = []

        @property
        def jamScore(self) -> int:
            return sum(trip.points for trip in self._trips)

        @property
        def trips(self) -> list[Jam.Trip]:
            return self._trips.copy()

        def setTrip(self, tripIndex: int, points: int, timestamp: datetime) -> None:
            if not self._parent.isStarted():
                raise ClientException("This Jam has not yet started.")
            numTrips: int = len(self._trips)
            if tripIndex in range(numTrips):
                self._trips[tripIndex].points = points
            elif tripIndex == numTrips:
                self._trips.append(Jam.Trip(points, timestamp))
            else:
                raise ClientException("Trip number is invalid.")
            server.update(self._parent)

        def deleteTrip(self, tripIndex: int) -> None:
            del self._trips[tripIndex]

        @property
        def lead(self) -> bool:
            return self._lead

        @lead.setter
        def lead(self, value: bool) -> None:
            if not isinstance(value, bool):
                raise TypeError(f"Lead should be bool, not {type(value).__name__}.")

            # Ensure the jam has started
            if not self._parent.isStarted():
                raise ClientException("This Jam has not yet started.")

            # Validate that this team is eligible for lead
            if value:
                if self._lost:
                    raise ClientException("This team ineligible for Lead.")
                otherTeam: Jam.Team = self.getOtherTeam()
                if otherTeam.lead and not otherTeam.lost:
                    raise ClientException("Other team is currently lead.")

            self._lead = value
            server.update(self._parent)

        @property
        def lost(self) -> bool:
            return self._lost

        @lost.setter
        def lost(self, value: bool) -> None:
            if not isinstance(value, bool):
                raise TypeError(f"Lost should be bool, not {type(value).__name__}.")

            # Ensure the jam has started
            if not self._parent.isStarted():
                raise ClientException("This Jam has not yet started.")

            self._lost = value
            server.update(self._parent)

        @property
        def starPass(self) -> None | int:
            return self._star_pass

        @starPass.setter
        def starPass(self, value: None | int) -> None:
            if value is True or not isinstance(value, (bool, int)):
                raise TypeError(
                    f"Star Pass should be False or int, not {type(value).__name__}."
                )

            # Ensure the jam has started
            if not self._parent.isStarted():
                raise ClientException("This Jam has not yet started.")

            if not self._lost and value is not False:
                self._lost = True
            self._star_pass = value
            server.update(self._parent)

        def getOtherTeam(self) -> Jam.Team:
            return self._parent._away if self._team == "home" else self._parent._home

        def encode(self) -> dict:
            return {
                "team": self._team,
                "lead": self._lead,
                "lost": self._lost,
                "starPass": self._star_pass,
                "trips": [trip.encode() for trip in self._trips],
            }

    def __init__(self, parent: Bout) -> None:
        self._parent: Bout = parent
        self._started: Literal[False] | datetime = False
        self._stopped: Literal[False] | datetime = False
        self._stopReason: None | Jam.STOP_REASONS = None
        self._home: Jam.Team = Jam.Team(self, "home")
        self._away: Jam.Team = Jam.Team(self, "away")

    def __getitem__(self, teamName: str) -> Jam.Team:
        teamName = teamName.lower()
        if teamName not in ("home", "away"):
            raise KeyError(f"Unknown team name '{teamName}'.")
        return self._home if teamName == "home" else self._away

    @property
    def home(self) -> Jam.Team:
        return self._home

    @property
    def away(self) -> Jam.Team:
        return self._away

    def isStarted(self) -> bool:
        return self._started is not False

    def index(self) -> JamIndex:
        for periodIndex, period in enumerate(self._parent._periods):
            if self in period:
                return JamIndex(period=periodIndex, jam=period.index(self))
        else:
            # This exception should never be raised
            raise ValueError("This Jam is not in a Bout")

    def start(self, timestamp: datetime) -> None:
        if self.isStarted():
            raise ClientException("This jam has already started.")
        self._started = timestamp

        # Stop the Lineup timer and start the Jam timer
        jamTimer: Timer = self._parent._timer.jam
        lineupTimer: Timer = self._parent._timer.lineup
        if lineupTimer.isRunning():
            lineupTimer.stop(timestamp)
        jamTimer.restart(timestamp)

        # Start the period clock if it isn't running
        periodClock: Timer = self._parent._timer.period
        if not periodClock.isRunning():
            periodClock.start(timestamp)
        server.update(self)

    def unStart(self) -> None:
        if not self.isStarted():
            raise ClientException("This jam has not yet started.")
        self._started = False
        # TODO: handle timers
        server.update(self)

    @property
    def isStopped(self) -> bool:
        return self._stopped is not False

    def stop(
        self, timestamp: datetime, stopReason: Jam.STOP_REASONS = "unknown"
    ) -> None:
        if not self.isStarted():
            raise ClientException("This jam has not yet started.")
        if self.isStopped:
            raise ClientException("This jam has already stopped.")
        if stopReason not in get_args(Jam.STOP_REASONS):
            raise ValueError(
                f"Stop reason must be one of {get_args(Jam.STOP_REASONS)}, not '{stopReason}'."
            )
        self._stopReason = stopReason
        self._stopped = timestamp

        # Stop the Jam timer and start the Lineup timer
        jamTimer: Timer = self._parent._timer.jam
        lineupTimer: Timer = self._parent._timer.lineup
        jamTimer.stop(timestamp)
        lineupTimer.restart(timestamp)

        server.update(self)

    @property
    def stopReason(self) -> None | Jam.STOP_REASONS:
        return self._stopReason

    @stopReason.setter
    def stopReason(self, stopReason: Jam.STOP_REASONS) -> None:
        if stopReason not in get_args(Jam.STOP_REASONS):
            raise ValueError(
                f"Stop reason must be one of {get_args(Jam.STOP_REASONS)}, not '{stopReason}'."
            )
        if not self.isStopped:
            raise ClientException("This jam has not yet stopped.")
        self._stopReason = stopReason
        server.update(self)

    def unStop(self) -> None:
        if not self.isStopped:
            raise ClientException("This jam has not yet stopped.")
        self._stopped = False
        self._stopReason = None
        # TODO: update timers
        server.update(self)

    def encode(self) -> dict:
        startTime: Literal[False] | str = (
            self._started if self._started is False else str(self._started)
        )
        stopTime: Literal[False] | str = (
            self._stopped if self._stopped is False else str(self._stopped)
        )
        return {
            "jamIndex": self.index().encode(),
            "startTime": startTime,
            "stopTime": stopTime,
            "stopReason": self._stopReason,
            "home": self._home.encode(),
            "away": self._away.encode(),
        }
