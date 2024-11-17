from dataclasses import dataclass
from datetime import datetime
from derby.attributes import TeamAttribute
from derby.score import Score
from server import Queryable
from typing import Any
from uuid import UUID


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
        self.watch(starting_scores)

    @property
    def bout_id(self) -> UUID:
        return self._bout_id

    @property
    def score(self) -> TeamAttribute[Score]:
        return self._score

    def get(self) -> dict[str | float | int, Any]:
        return {
            'start': self._start_timestamp,
            'stop': self._stop_timestamp,
            'stop_reason': self._stop_reason
        }
