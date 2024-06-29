from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from .encodable import Encodable
from .score import Score
from .timer import Timer
from typing import Any, get_args, Literal
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


class Series(Encodable):
    def __init__(self):
        self._bouts: list[Bout] = [Bout()]
        self._currentBout: Bout = self._bouts[0]
        # self.teams: dict[str, Team] = dict()

    def __getitem__(self, boutIndex: int) -> Bout:
        return self._bouts[boutIndex]

    @property
    def bouts(self) -> list[Bout]:
        return self._bouts

    def addBout(self) -> None:
        self._bouts.append(Bout())

    def moveBout(self, fromIndex: int, toIndex: int) -> None:
        bout: Bout = self._bouts[fromIndex]
        self._bouts.insert(toIndex, bout)
        self._bouts.pop(fromIndex)

    def deleteBout(self, deleteIndex: int) -> None:
        self._bouts.pop(deleteIndex)

    @property
    def currentBout(self) -> Bout:
        return self._currentBout

    @currentBout.setter
    def currentBout(self, boutIndex: int) -> None:
        self._currentBout = self._bouts[boutIndex]

    def encode(self) -> dict:
        return {
            "currentBout": self._bouts.index(self._currentBout),
            "bouts": [bout.encode() for bout in self._bouts],
        }


class Bout(Encodable):
    class Team(Encodable):
        def __init__(self) -> None:
            # TODO: add team references, colors, timeouts, official reviews, etc
            pass

    def __init__(self) -> None:
        self._periods: list[Period] = [Period(self)]

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
        self._countdown: Timer = Timer(minutes=15)
        self._clock: Timer = Timer(minutes=30)
        self._jams: list[Jam] = [Jam(self)]

    def __len__(self) -> int:
        return len(self._jams)

    def __getitem__(self, jamIndex: int) -> Jam:
        return self._jams[jamIndex]

    def start(self, timestamp: datetime) -> None:
        self._clock.start(timestamp)

        server.update(self)

    def running(self) -> bool:
        return self._clock.running()

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
        return {
            "jamCount": len(self._jams),
            "countdown": self._countdown.encode(),
            "clock": self._clock.encode(),
        }


class Jam(Encodable):
    STOP_REASONS = Literal["called", "injury", "time", "unknown"]
    TEAMS = Literal["home", "away"]

    def __init__(self, parent: Period) -> None:
        self._parent: Period = parent
        self._countdown: Timer = Timer(seconds=30)
        self._clock: Timer = Timer(minutes=2)
        self._stopReason: None | Jam.STOP_REASONS = None
        self._home: JamTeam = JamTeam(self)
        self._away: JamTeam = JamTeam(self)

    def __getitem__(self, team: Jam.TEAMS) -> JamTeam:
        if team not in get_args(Jam.TEAMS):
            raise ValueError(
                f"Team must be one of {get_args(Jam.TEAMS)}, not '{team}'."
            )
        return self._home if team == "home" else self._away

    @property
    def home(self) -> JamTeam:
        return self._home

    @property
    def away(self) -> JamTeam:
        return self._away

    def index(self) -> JamIndex:
        periodIndex: int = self._parent._parent._periods.index(self._parent)
        jamIndex: int = self._parent._jams.index(self)
        return JamIndex(period=periodIndex, jam=jamIndex)

    def start(self, timestamp: datetime) -> None:
        if self.running():
            raise server.ClientException("This jam has already started.")

        # Stop the Lineup timer
        if self._countdown.running():
            self._countdown.stop(timestamp)

        # Start the Jam timer
        self._clock.start(timestamp)

        # Start the period clock if it isn't running # FIXME
        period: Period = self._parent
        if not period.running():
            period.start(timestamp)

        server.update(self)

    def unStart(self) -> None:
        if not self.running():
            raise server.ClientException("This jam has not yet started.")
        # TODO: Implement this
        server.update(self)

    def stop(
        self, timestamp: datetime, stopReason: Jam.STOP_REASONS = "unknown"
    ) -> None:
        if not self.running():
            raise server.ClientException("This jam has not yet started.")
        if self.finished():
            raise server.ClientException("This jam is already finished.")
        if stopReason not in get_args(Jam.STOP_REASONS):
            raise ValueError(
                f"Stop reason must be one of {get_args(Jam.STOP_REASONS)}, not '{stopReason}'."
            )

        # Stop the current Jam
        self._stopReason = stopReason
        self._clock.stop(timestamp)

        # Add the next Jam and start its Lineup timer
        nextJam: Jam = self._parent.addJam()
        nextJam._countdown.start(timestamp)
        server.update(nextJam)

        server.update(self)

    def unStop(self) -> None:
        if not self.finished():
            raise server.ClientException("This jam has not yet stopped.")
        # TODO: update timers
        server.update(self)

    def getStopReason(self) -> None | Jam.STOP_REASONS:
        return self._stopReason

    def setStopReason(self, stopReason: None | Jam.STOP_REASONS) -> None:
        if stopReason is not None and stopReason not in get_args(Jam.STOP_REASONS):
            raise ValueError(
                f"Stop Reason must be one of {get_args(Jam.STOP_REASONS)} not '{stopReason}'."
            )
        if stopReason is not None and not self.finished():
            raise server.ClientException(
                "Cannot set Stop Reason when the Jam is not finished."
            )

        self._stopReason = stopReason

        server.update(self)

    def running(self) -> bool:
        return self._clock.running()

    def finished(self) -> bool:
        return not self.running() and self._clock.getElapsed().total_seconds() > 0

    def encode(self) -> dict:
        return {
            "jamIndex": self.index().encode(),
            "countdown": self._countdown.encode(),
            "clock": self._clock.encode(),
            "stopReason": self._stopReason,
        }


class JamTeam:
    def __init__(self, parent: Jam) -> None:
        super().__init__()
        self._parent: Jam = parent
        self._score: Score = Score(self)

    def getOtherTeam(self) -> JamTeam:
        return self._parent.home if self is self._parent.away else self._parent.home

    def setTrip(self, tripIndex: int, points: int, timestamp: datetime) -> None:
        if not isinstance(tripIndex, int):
            raise TypeError(f"Trip Index must be int not {type(tripIndex).__name__}.")
        if not isinstance(points, int):
            raise TypeError(f"Points must be int not {type(points).__name__}.")

        # Check if the tripIndex is a valid value
        if tripIndex > len(self._score.trips):
            raise IndexError("list index out of range")

        # Append or edit the desired Trip
        if tripIndex == len(self._score.trips):
            self._score.trips.append(Score.Trip(points, timestamp))
        else:
            self._score.trips[tripIndex].points = points

    def deleteTrip(self, tripIndex: int) -> None:
        del self._score.trips[tripIndex]

    def isLeadEligible(self) -> bool:
        otherTeam: JamTeam = self.getOtherTeam()
        return not otherTeam.getLead() and not self._score.lost

    def getLead(self) -> bool:
        return self._score.lead

    def setLead(self, lead: bool) -> None:
        if not isinstance(lead, bool):
            raise TypeError(f"Lead must be bool not {type(lead).__name__}.")
        if lead and not self.isLeadEligible():
            raise server.ClientException("This team is not eligible for lead jammer.")
        self._score.lead = lead

    def getLost(self) -> bool:
        return self._score.lost

    def setLost(self, lost: bool) -> None:
        if not isinstance(lost, bool):
            raise TypeError(f"Lost must be bool not {type(lost).__name__}.")
        self._score.lost = lost

    def getStarPass(self) -> None | int:
        return self._score.starPass

    def setStarPass(self, starPass: None | int) -> None:
        if starPass is not None and not isinstance(starPass, int):
            raise TypeError(
                f"Star Pass must be None or int not {type(starPass).__name__}."
            )
        self._score.starPass = starPass
