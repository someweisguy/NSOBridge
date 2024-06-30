from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from .encodable import Encodable
from typing import Any
import roller_derby.bout as bout
import server


class Score(Encodable):
    @dataclass
    class Trip(Encodable):
        points: int
        timestamp: datetime

        def encode(self) -> dict[str, Any]:
            return {"points": self.points, "timestamp": str(self.timestamp)}

    def __init__(self, parent: bout.JamTeam) -> None:
        super().__init__()
        self._parent: bout.JamTeam = parent
        self._trips: list[Score.Trip] = []
        self._lead: bool = False
        self._lost: bool = False
        self._starPass: None | int = None

    def setTrip(self, tripIndex: int, points: int, timestamp: datetime) -> None:
        if not isinstance(tripIndex, int):
            raise TypeError(f"Trip Index must be int not {type(tripIndex).__name__}.")
        if not isinstance(points, int):
            raise TypeError(f"Points must be int not {type(points).__name__}.")

        # Check if the tripIndex is a valid value
        if tripIndex > len(self._trips):
            raise IndexError("list index out of range")

        # Append or edit the desired Trip
        if tripIndex == len(self._trips):
            self._trips.append(Score.Trip(points, timestamp))
        else:
            self._trips[tripIndex].points = points

        server.update(self)

    def deleteTrip(self, tripIndex: int) -> None:
        del self._trips[tripIndex]

        server.update(self)

    def isLeadEligible(self) -> bool:
        otherTeam: bout.JamTeam = self._parent.getOtherTeam()
        return not otherTeam.score.getLead() and not self._lost

    def getLead(self) -> bool:
        return self._lead

    def setLead(self, lead: bool) -> None:
        if not isinstance(lead, bool):
            raise TypeError(f"Lead must be bool not {type(lead).__name__}.")
        if lead and not self.isLeadEligible():
            raise server.ClientException("This team is not eligible for lead jammer.")
        self._lead = lead

        server.update(self)

    def getLost(self) -> bool:
        return self._lost

    def setLost(self, lost: bool) -> None:
        if not isinstance(lost, bool):
            raise TypeError(f"Lost must be bool not {type(lost).__name__}.")
        self._lost = lost

        server.update(self)

    def getStarPass(self) -> None | int:
        return self._starPass

    def setStarPass(self, starPass: None | int) -> None:
        if starPass is not None and not isinstance(starPass, int):
            raise TypeError(
                f"Star Pass must be None or int not {type(starPass).__name__}."
            )
        self._starPass = starPass

        server.update(self)

    def encode(self) -> dict[str, Any]:
        assert self._parent in (self._parent._parent._home, self._parent._parent._away)
        team: str = "home" if self._parent is self._parent._parent._home else "away"
        return {
            team: {
                "trips": [trip.encode() for trip in self._trips],
                "lead": self._lead,
                "lost": self._lost,
                "starPass": self._starPass,
            }
        }
