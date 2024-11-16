from dataclasses import dataclass
from datetime import datetime
from server import Queryable, controller
from typing import Any
from uuid import UUID


class Score(Queryable):
    @dataclass(slots=True)
    class Trip():
        points: int
        timestamp: datetime

    def __init__(self, bout_id: UUID, id: tuple) -> None:
        super().__init__((bout_id, id))
        self._lead: bool = False
        self._lost: bool = False
        self._star_pass: int | None = None
        self._trips: list[Score.Trip] = []

    def total_points(self) -> int:
        return sum(trip.points for trip in self._trips)
    
    def add_trip(self, points: int, timestamp: datetime | None = None) -> None:
        if timestamp is None:
            timestamp = datetime.now()
        self._trips.append(Score.Trip(points, timestamp))
        controller.notify(self)

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
