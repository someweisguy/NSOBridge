from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Literal, get_args

from .encodable import ClientException, Encodable


class Bout(Encodable):
    def __init__(self) -> None:
        self._periods: tuple[list[Jam], ...] = ([Jam(self)], [], [])
        self._currentPeriod: list[Jam] = self._periods[0]
        self._currentJam: Jam = self._currentPeriod[0]

    @property
    def currentPeriod(self) -> list[Jam]:
        return self._currentPeriod

    @property
    def currentJam(self) -> Jam:
        return self._currentJam

    @property
    def jam(self) -> tuple[list[Jam], ...]:
        return tuple(self._periods)

    @property
    def inOvertime(self) -> bool:
        return self.currentJam in self._periods[2]

    def addJam(self, period: int) -> None:
        self._periods[period].append(Jam(self))

    def deleteJam(self, period: int) -> None:
        self._periods[period].pop()
        if len(self.currentPeriod) == 0:
            self.currentPeriod.append(Jam(self))

    def encode(self) -> dict:
        return {
            "currentPeriod": self._periods.index(self.currentPeriod),
            "jams": [[jam.encode() for jam in period] for period in self._periods],
        }


class Jam(Encodable):
    type STOP_REASONS = Literal["called", "injury", "time", "unknown"]

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
            if not self._parent.isStarted:
                raise ClientException("This Jam has not yet started.")
            numTrips: int = len(self._trips)
            if tripIndex in range(numTrips):
                self._trips[tripIndex].points = points
            elif tripIndex == numTrips:
                self._trips.append(Jam.Trip(points, timestamp))
            else:
                raise ClientException("Trip number is invalid.")

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
            if not self._parent.isStarted:
                raise ClientException("This Jam has not yet started.")

            # Validate that this team is eligible for lead
            if value:
                if self._lost:
                    raise ClientException("This team ineligible for Lead.")
                otherTeam: Jam.Team = self.getOtherTeam()
                if otherTeam.lead and not otherTeam.lost:
                    raise ClientException("Other team is currently lead.")

            self._lead = value

        @property
        def lost(self) -> bool:
            return self._lost

        @lost.setter
        def lost(self, value: bool) -> None:
            if not isinstance(value, bool):
                raise TypeError(f"Lost should be bool, not {type(value).__name__}.")

            # Ensure the jam has started
            if not self._parent.isStarted:
                raise ClientException("This Jam has not yet started.")

            self._lost = value

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
            if not self._parent.isStarted:
                raise ClientException("This Jam has not yet started.")

            if not self._lost and value is not False:
                self._lost = True
            self._star_pass = value

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

    @property
    def index(self) -> int:
        for period in reversed(self._parent._periods):
            try:
                return period.index(self)
            except ValueError:
                pass
        raise ValueError("This Jam is not in a Bout")

    @property
    def isStarted(self) -> bool:
        return self._started is not False

    def start(self, timestamp: datetime) -> None:
        if self.isStarted:
            raise ClientException("This jam has already started.")
        self._started = timestamp

    def unStart(self) -> None:
        if not self.isStarted:
            raise ClientException("This jam has not yet started.")
        self._started = False

    @property
    def isStopped(self) -> bool:
        return self._stopped is not False

    def stop(self, timestamp: datetime) -> None:
        if not self.isStarted:
            raise ClientException("This jam has not yet started.")
        if self.isStopped:
            raise ClientException("This jam has already stopped.")
        self._stopped = timestamp
        self._stopReason = "unknown"

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

    def unStop(self) -> None:
        if not self.isStopped:
            raise ClientException("This jam has not yet stopped.")
        self._stopped = False
        self._stopReason = None

    def encode(self) -> dict:
        return {
            "startTick": str(self._started),
            "stopTick": str(self._stopped),
            "stopReason": self._stopReason,
            "home": self._home.encode(),
            "away": self._away.encode(),
        }
