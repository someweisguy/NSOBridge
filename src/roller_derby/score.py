from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from .encodable import Encodable
from .teamAttribute import AbstractAttribute, TeamAttribute
from typing import Any, Self
import bout
import server


class Score(AbstractAttribute):
    API_NAME: str = "jamScore"
    
    @dataclass
    class Trip(Encodable):
        points: int
        timestamp: datetime

        def encode(self) -> dict[str, Any]:
            return {"points": self.points, "timestamp": str(self.timestamp)}

    def __init__(self, parent: TeamAttribute[bout.Jam, Self]) -> None:
        super().__init__(parent)
        self._trips: list[Score.Trip] = []
        self._lead: bool = False
        self._lost: bool = False
        self._starPass: None | int = None
        
    @property
    def parentJam(self) -> bout.Jam:
        return self._parent._parent

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
    
    def getTrips(self) -> list[Score.Trip]:
        return self._trips

    def deleteTrip(self, tripIndex: int) -> None:
        del self._trips[tripIndex]

        server.update(self)

    def isLeadEligible(self) -> bool:
        other: Score = self.getOther()
        return not other.getLead() and not self.getLost()

    def getLead(self) -> bool:
        return self._lead

    def setLead(self, lead: bool) -> None:
        if not isinstance(lead, bool):
            raise TypeError(f"Lead must be bool not {type(lead).__name__}.")
        if lead and not self.isLeadEligible():
            raise server.ClientException("This team is not eligible for lead jammer.")
        self._lead = lead

        server.update(self)
        server.update(self.getOther())  # Update lead eligibility

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
        return {
            "id": self.parentJam.getId().encode(),
            "team": self.getTeam(),
            "trips": [trip.encode() for trip in self.getTrips()],
            "lead": self.getLead(),
            "lost": self.getLost(),
            "starPass": self.getStarPass(),
            "isLeadEligible": self.isLeadEligible()
        }
