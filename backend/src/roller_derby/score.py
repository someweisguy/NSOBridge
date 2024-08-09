from __future__ import annotations
from datetime import datetime
from roller_derby.attribute import AbstractAttribute
from server import Encodable
from typing import TYPE_CHECKING
import server

if TYPE_CHECKING:
    from roller_derby.bout import Jam


class Trip(Encodable):
    def __init__(self, points: int, timestamp: datetime) -> None:
        super().__init__()
        self.points: int = points
        self.timestamp: datetime = timestamp

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            'uuid': self.uuid,
            'points': self.points,
            'timestamp': str(self.timestamp)
        }


class Score(AbstractAttribute):
    def __init__(self, parent: Jam) -> None:
        super().__init__(parent)
        self._trips: list[Trip] = []
        self._lead: bool = False
        self._lost: bool = False
        self._starPass: None | int = None

    @property
    def lead(self) -> bool:
        return self._lead

    @lead.setter
    def lead(self, lead: bool) -> None:
        if lead and not self.isLeadEligible():
            raise RuntimeError('this team is not eligible for lead')
        self._lead = lead

        server.update(self.parent)

    @property
    def lost(self) -> bool:
        return self._lost

    @lost.setter
    def lost(self, lost: bool) -> None:
        self._lost = lost

        server.update(self.parent)

    @property
    def starPass(self) -> None | int:
        return self._starPass

    @starPass.setter
    def starPass(self, starPass: None | int) -> None:
        if starPass is not None:
            self._lost = True
        self._starPass = starPass

        server.update(self.parent)

    def setTrip(self, tripNum: int, points: int, timestamp: datetime) -> None:
        # Check if the tripIndex is a valid value
        if tripNum > len(self._trips):
            raise IndexError('Trip index out of range')

        # Append or edit the desired Trip
        if tripNum == len(self._trips):
            self._trips.append(Trip(points, timestamp))
        else:
            self._trips[tripNum].points = points

        server.update(self.parent)

    def deleteTrip(self, tripNum: int) -> None:
        # Check if the tripIndex is a valid value
        if tripNum > len(self._trips):
            raise IndexError('Trip index out of range')
        del self._trips[tripNum]

        server.update(self.parent)

    def isLeadEligible(self) -> bool:
        other: Score = self.getOther()
        return not other._lead and not self._lost

    def encode(self) -> dict[str, Encodable.PRIMITIVE]:
        return {
            'uuid': self.uuid,
            'trips': [trip.encode() for trip in self._trips],
            'lead': self._lead,
            'lost': self._lost,
            'starPass': self._starPass,
            'isLeadEligible': self.isLeadEligible()
        }
