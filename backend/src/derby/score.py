from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from server import Queryable
from typing import TYPE_CHECKING, Any, Literal
from uuid import UUID

if TYPE_CHECKING:
    from derby.jam import Jam


class Score(Queryable[Literal['home', 'away']]):
    @dataclass(slots=True)
    class Trip():
        points: int
        timestamp: datetime

    def __init__(self, bout_id: UUID, jam_id: tuple,
                 team: Literal['home', 'away'], parent: Jam) -> None:
        super().__init__((bout_id, jam_id, team))
        self._lead: bool = False
        self._lost: bool = False
        self._star_pass: int | None = None
        self._trips: list[Score.Trip] = []
        self._parent: Jam = parent

    @property
    def lead(self) -> bool:
        return self._lead

    @lead.setter
    def lead(self, value: bool) -> None:
        if value == True and not self.is_lead_eligible():
            raise RuntimeError('This Jammer is not eligible for lead')
        notify: bool = self._lead != value
        self._lead = value
        if notify:
            self.notify()

    @property
    def lost(self) -> bool:
        return self._lost

    @lost.setter
    def lost(self, value: bool) -> None:
        notify: bool = self._lost != value
        self._lost = value
        if notify:
            self.notify()

    @property
    def star_pass(self) -> int | None:
        return self._star_pass

    @star_pass.setter
    def star_pass(self, value: int | None) -> None:
        notify: bool = self._star_pass != value
        self._star_pass = value
        if value is not None and not self._lost:
            # Automatically set Lost when setting Star Pass
            self._lost = True
            notify = True
        if notify:
            self.notify()

    def is_lead_eligible(self) -> bool:
        other: Score = (self._parent.score.home
                        if self is self._parent.score.away
                        else self._parent.score.home)
        return not self.lost and not other.lead

    def total_points(self) -> int:
        return sum(trip.points for trip in self._trips)

    def set_trip(self, trip_index: int, points: int, valid_pass: bool,
                 timestamp: datetime | None = None) -> None:
        notify_controller: bool = True
        if trip_index == len(self._trips):
            if timestamp is None:
                timestamp = datetime.now()
            self._trips.append(Score.Trip(points, timestamp))
            if valid_pass and not self.lead and self.is_lead_eligible():
                self._lead = True
        elif self._trips[trip_index].points != points:
            self._trips[trip_index].points = points
        else:
            notify_controller = False

        if notify_controller:
            self.notify()

    def del_trip(self, trip_index: int) -> None:
        del self._trips[trip_index]
        self.notify()

    def get(self) -> dict[str | float | int, Any]:
        return {
            'lead': self._lead,
            'lost': self._lost,
            'starPass': self._star_pass,
            'trips': [{
                'timestamp': str(trip.timestamp),
                'points': trip.points
            } for trip in self._trips],
        }
