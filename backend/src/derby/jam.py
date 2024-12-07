from dataclasses import dataclass
from datetime import datetime
from derby.attributes import TeamAttribute
from derby.score import Score
from server import Queryable
from typing import Any
from uuid import UUID


class Jam(Queryable[tuple[UUID, tuple[int, int]]]):
    def __init__(self, bout_id: UUID, id: tuple[int, int]) -> None:
        super().__init__((bout_id, id))
        self._bout_id: UUID = bout_id
        self._start_timestamp: datetime | None = None
        self._stop_timestamp: datetime | None = None
        self._stop_reason: str | None = None

        # Initialize the Scores
        starting_scores = (Score(bout_id, id, 'home', self), Score(bout_id, id, 'away', self))
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
            'start': str(self._start_timestamp) if self._start_timestamp is not None else None,
            'stop': str(self._stop_timestamp) if self._stop_timestamp is not None else None,
            'stop_reason': self._stop_reason
        }

    def set_start(self, timestamp: datetime) -> None:
        if self._start_timestamp is not None:
            raise RuntimeError('This Jam has already started')
        self._start_timestamp = timestamp
        self.notify()

    def set_stop(self, timestamp: datetime, reason: str) -> None:
        if self._stop_timestamp is not None:
            raise RuntimeError('This Jam has already ended')
        self._stop_timestamp = timestamp
        self._stop_reason = reason
        self.notify()
