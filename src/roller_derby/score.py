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
    class Team(Encodable):
        def __init__(self) -> None:
            # TODO: add team references, colors, timeouts, official reviews, etc
            pass

    def __init__(self) -> None:
        self._periods: list[Period] = [Period(self)]
        self._timer: TimeKeeper = TimeKeeper()

    def __len__(self) -> int:
        return len(self._periods)

    def __getitem__(self, periodIndex: int) -> Period:
        return self._periods[periodIndex]

    def getPeriod(self, periodIndex: int) -> Period:
        return self._periods[periodIndex]

    def getCurrentPeriod(self) -> Period:
        return self._periods[-1]

    def addPeriod(self) -> None:
        if len(self._periods) >= 2:
            raise RuntimeError("A Bout cannot have more than 2 Periods.")
        self._periods.append(Period(self))

    def encode(self) -> dict:
        return {
            "periodCount": len(self._periods),
        }


class Period(Encodable):
    def __init__(self, parent: Bout) -> None:
        self._parent: Bout = parent
        self._ttd: Timer = Timer("ttd", minutes=15)
        self._timer: Timer = Timer("period", minutes=30)
        self._jams: list[Jam] = [Jam(self)]

    def __len__(self) -> int:
        return len(self._jams)

    def __getitem__(self, jamIndex: int) -> Jam:
        return self._jams[jamIndex]

    @property
    def timer(self) -> Timer:
        return self._timer

    def getJam(self, jamIndex: int) -> Jam:
        return self._jams[jamIndex]

    def getCurrentJam(self) -> Jam:
        return self._jams[-1]

    def addJam(self) -> Jam:
        jam: Jam = Jam(self)
        self._jams.append(jam)
        return jam

    def deleteJam(self, index: int) -> None:
        del self._jams[index]
        if len(self._jams) == 0:
            self._jams.append(Jam(self))
    
    def setTimeToDerby(self, hours: None | int = None, minutes: None | int = None, seconds: None | int = None) -> None:
        pass  # TODO

    def encode(self) -> dict[str, Any]:
        return {"jamCount": 0, "timer": self._timer.encode()}


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

    def __init__(self, parent: Period) -> None:
        self._parent: Period = parent
        self._lineup: Timer = Timer("lineup", seconds=30)
        self._timer: Timer = Timer("jam", minutes=2)
        self._stopReason: None | Jam.STOP_REASONS = None
        self._home: Jam.Team = Jam.Team(self, "home")
        self._away: Jam.Team = Jam.Team(self, "away")

    def __getitem__(self, teamName: str) -> Jam.Team:
        teamName = teamName.lower()
        if teamName not in ("home", "away"):
            raise KeyError(f"Unknown team name '{teamName}'.")
        return self._home if teamName == "home" else self._away

    @property
    def timer(self) -> Timer:
        return self._timer

    @property
    def home(self) -> Jam.Team:
        return self._home

    @property
    def away(self) -> Jam.Team:
        return self._away

    def isStarted(self) -> bool:
        return self._timer.isRunning()

    def index(self) -> JamIndex:
        periodIndex: int = self._parent._parent._periods.index(self._parent)
        jamIndex: int = self._parent._jams.index(self)
        return JamIndex(period=periodIndex, jam=jamIndex)

    def start(self, timestamp: datetime) -> None:
        if self.isStarted():
            raise ClientException("This jam has already started.")

        # Stop the Lineup timer
        if self._lineup.isRunning():
            self._lineup.stop(timestamp)

        # Start the Jam timer
        self._timer.start(timestamp)

        # Start the period clock if it isn't running
        periodClock: Timer = self._parent._timer
        if not periodClock.isRunning():
            periodClock.start(timestamp)

        server.update(self)

    def unStart(self) -> None:
        if not self.isStarted():
            raise ClientException("This jam has not yet started.")
        # TODO: Implement this
        server.update(self)

    def isStopped(self) -> bool:
        return not self.isStarted() and self._timer.getElapsed() > 0

    def stop(
        self, timestamp: datetime, stopReason: Jam.STOP_REASONS = "unknown"
    ) -> None:
        if not self.isStarted():
            raise ClientException("This jam has not yet started.")
        if self.isStopped():
            raise ClientException("This jam has already stopped.")
        if stopReason not in get_args(Jam.STOP_REASONS):
            raise ValueError(
                f"Stop reason must be one of {get_args(Jam.STOP_REASONS)}, not '{stopReason}'."
            )

        # Stop the current Jam
        self._stopReason = stopReason
        self._timer.stop(timestamp)

        # Add the next Jam and start its Lineup timer
        nextJam: Jam = self._parent.addJam()
        nextJam._lineup.start(timestamp)

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
        if not self.isStopped():
            raise ClientException("This jam has not yet stopped.")
        self._stopReason = stopReason
        server.update(self)

    def unStop(self) -> None:
        if not self.isStopped():
            raise ClientException("This jam has not yet stopped.")
        # TODO: update timers
        server.update(self)

    def millisRemaining(self) -> int:
        millis: None | int = self._timer.getRemaining()
        assert millis is not None
        if millis < 0:
            millis = 0
        return millis

    def encode(self) -> dict:
        return {
            "jamIndex": self.index().encode(),
            "timer": self._timer.encode(),
            "stopReason": self._stopReason,
            "home": self._home.encode(),
            "away": self._away.encode(),
        }
