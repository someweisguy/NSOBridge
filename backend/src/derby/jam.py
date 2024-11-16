from dataclasses import dataclass
from datetime import datetime
from derby.attributes import TeamAttribute
from server import Queryable
from typing import Any
from uuid import UUID


class Score(Queryable):
    @dataclass(slots=True)
    class Trip():
        timestamp: datetime
        points: int

    def __init__(self, bout_id: UUID, id: tuple) -> None:
        super().__init__((bout_id, id))
        self._lead: bool = False
        self._lost: bool = False
        self._star_pass: int | None = None
        self._trips: list[Score.Trip] = []
    
    def total_points(self) -> int:
        return sum(trip.points for trip in self._trips)
    
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



class Jam(Queryable):
    def __init__(self, bout_id: UUID, id: tuple[int, int]) -> None:
        super().__init__((bout_id, id))
        self._bout_id: UUID = bout_id
        self._start_timestamp: datetime | None = None
        self._stop_timestamp: datetime | None = None
        self._stop_reason: int | None = None
        
        # Initialize the Scores
        starting_scores = (Score(bout_id, id), Score(bout_id, id))
        self._score: TeamAttribute = TeamAttribute(*starting_scores)

    @property
    def bout_id(self) -> UUID:
        return self._bout_id
    
    @property
    def score(self) -> TeamAttribute[Score]:
        return self._score

    def get(self) -> dict[str | float | int, Any]:
        return {
            'start': (str(self._start_timestamp) if self._start_timestamp
                      else None),
            'stop': (str(self._stop_timestamp) if self._stop_timestamp
                     else None),
            'stop_reason': self._stop_reason,
        }
