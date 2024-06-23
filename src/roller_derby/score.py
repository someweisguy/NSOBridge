from __future__ import annotations
from dataclasses import dataclass, field
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

    def setTimeToDerby(
        self,
        hours: None | int = None,
        minutes: None | int = None,
        seconds: None | int = None,
    ) -> None:
        pass  # TODO

    def encode(self) -> dict[str, Any]:
        return {"jamCount": 0, "timer": self._timer.encode()}


class Jam(Encodable):
    STOP_REASONS = Literal["called", "injury", "time", "unknown"]
    TEAMS = Literal["home", "away"]

    @dataclass
    class Trip(Encodable):
        points: int
        timestamp: datetime

        def encode(self) -> dict[str, Any]:
            return {
                "points": self.points,
                "timestamp": str(self.timestamp),
            }

    @dataclass
    class Team(Encodable):
        lead: bool = False
        lost: bool = False
        starPass: None | int = None
        trips: list[Jam.Trip] = field(default_factory=list)

        def encode(self) -> dict[str, Any]:
            return {
                "lead": self.lead,
                "lost": self.lost,
                "starPass": self.starPass,
                "trips": [trip.encode() for trip in self.trips],
            }

    def __init__(self, parent: Period) -> None:
        self._parent: Period = parent
        self._lineup: Timer = Timer("lineup", seconds=30)
        self._timer: Timer = Timer("jam", minutes=2)
        self._stopReason: None | Jam.STOP_REASONS = None
        self._home: Jam.Team = Jam.Team()
        self._away: Jam.Team = Jam.Team()

    @property
    def timer(self) -> Timer:
        return self._timer

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

    def setTrip(self, team: Jam.TEAMS, tripIndex: int, points: int, timestamp: datetime) -> None:
        if team not in get_args(Jam.TEAMS):
            raise ValueError(
                f"Team must be one of {get_args(Jam.TEAMS)}, not '{team}'."
            )
        if not isinstance(tripIndex, int):
            raise TypeError(f"Trip Index must be int not {type(tripIndex).__name__}.")
        if not isinstance(points, int):
            raise TypeError(f"Points must be int not {type(points).__name__}.")
        
        # Check if the tripIndex is a valid value
        jamTeam: Jam.Team = self._home if team == "home" else self._away
        if tripIndex > len(jamTeam.trips):
            raise IndexError("list index out of range")
        
        # Append or edit the desired Trip
        if tripIndex == len(jamTeam.trips):
            jamTeam.trips.append(Jam.Trip(points, timestamp))
        else:
            jamTeam.trips[tripIndex].points = points
            
        server.update(self)

    def deleteTrip(self, team: Jam.TEAMS, tripIndex: int) -> None:
        if team not in get_args(Jam.TEAMS):
            raise ValueError(
                f"Team must be one of {get_args(Jam.TEAMS)}, not '{team}'."
            )
        
        # Delete the desired trip
        jamTeam: Jam.Team = self._home if team == "home" else self._away
        del jamTeam.trips[tripIndex]
        
        server.update(self)

    def getLead(self, team: Jam.TEAMS) -> bool:
        if team not in get_args(Jam.TEAMS):
            raise ValueError(
                f"Team must be one of {get_args(Jam.TEAMS)}, not '{team}'."
            )
        jamTeam: Jam.Team = self._home if team == "home" else self._away
        return jamTeam.lead

    def setLead(self, team: Jam.TEAMS, lead: bool) -> None:
        if team not in get_args(Jam.TEAMS):
            raise ValueError(
                f"Team must be one of {get_args(Jam.TEAMS)}, not '{team}'."
            )
        if not isinstance(lead, bool):
            raise TypeError(f"Lead must be bool not {type(lead).__name__}.")
        jamTeam: Jam.Team = self._home if team == "home" else self._away
        jamTeam.lead = lead
        
        server.update(self)

    def getLost(self, team: Jam.TEAMS) -> bool:
        if team not in get_args(Jam.TEAMS):
            raise ValueError(
                f"Team must be one of {get_args(Jam.TEAMS)}, not '{team}'."
            )
        jamTeam: Jam.Team = self._home if team == "home" else self._away
        return jamTeam.lost

    def setLost(self, team: Jam.TEAMS, lost: bool) -> None:
        if team not in get_args(Jam.TEAMS):
            raise ValueError(
                f"Team must be one of {get_args(Jam.TEAMS)}, not '{team}'."
            )
        if not isinstance(lost, bool):
            raise TypeError(f"Lost must be bool not {type(lost).__name__}.")
        jamTeam: Jam.Team = self._home if team == "home" else self._away
        jamTeam.lost = lost
        
        server.update(self)

    def getStarPass(self, team: Jam.TEAMS) -> None | int:
        if team not in get_args(Jam.TEAMS):
            raise ValueError(
                f"Team must be one of {get_args(Jam.TEAMS)}, not '{team}'."
            )
        jamTeam: Jam.Team = self._home if team == "home" else self._away
        return jamTeam.starPass

    def setStarPass(self, team: Jam.TEAMS, starPass: None | int) -> None:
        if team not in get_args(Jam.TEAMS):
            raise ValueError(
                f"Team must be one of {get_args(Jam.TEAMS)}, not '{team}'."
            )
        if starPass is not None and not isinstance(starPass, int):
            raise TypeError(
                f"Star Pass must be None or int not {type(starPass).__name__}."
            )
        jamTeam: Jam.Team = self._home if team == "home" else self._away
        jamTeam.starPass = starPass
        
        server.update(self)
    
    def getTripCount(self, team: Jam.TEAMS) -> int:
        if team not in get_args(Jam.TEAMS):
            raise ValueError(
                f"Team must be one of {get_args(Jam.TEAMS)}, not '{team}'."
            )
        jamTeam: Jam.Team = self._home if team == "home" else self._away
        return len(jamTeam.trips)
    
    def isLeadEligible(self, team: Jam.TEAMS) -> bool:
        if team not in get_args(Jam.TEAMS):
            raise ValueError(
                f"Team must be one of {get_args(Jam.TEAMS)}, not '{team}'."
            )
        jamTeam: Jam.Team = self._home if team == "home" else self._away
        otherTeam: Jam.Team = self._away if team == "home" else self._home
        return not jamTeam.lost and not otherTeam.lead

    def encode(self) -> dict:
        return {
            "jamIndex": self.index().encode(),
            "timer": self._timer.encode(),
            "stopReason": self._stopReason,
            "home": self._home.encode(),
            "away": self._away.encode(),
        }
