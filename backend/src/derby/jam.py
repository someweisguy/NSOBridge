from __future__ import annotations
from datetime import datetime
from derby.attributes import TeamAttribute
from derby.score import Score
from server import Queryable
from typing import Any, get_args, Literal
from uuid import UUID


class Jam(Queryable[tuple[int, int]]):
    stop_reasons = Literal['called', 'time', 'injury', 'other']

    def __init__(self, bout_id: UUID, id: tuple[int, int]) -> None:
        super().__init__((bout_id, id))
        self._bout_id: UUID = bout_id
        self._start_timestamp: datetime | None = None
        self._stop_timestamp: datetime | None = None
        self._stop_reason: Jam.stop_reasons | None = None

        # Initialize the Scores
        starting_scores = (Score(bout_id, id, 'home', self),
                           Score(bout_id, id, 'away', self))
        self._score: TeamAttribute = TeamAttribute(*starting_scores)
        self.watch(starting_scores)

    @property
    def bout_id(self) -> UUID:
        return self._bout_id

    @property
    def score(self) -> TeamAttribute[Score]:
        return self._score

    @property
    def stop_reason(self) -> Jam.stop_reasons | None:
        return self._stop_reason

    @stop_reason.setter
    def stop_reason(self, value: Jam.stop_reasons | None) -> None:
        if value not in get_args(Jam.stop_reasons):
            raise ValueError(f'Stop Reason must be one of '
                             f'\'{get_args(Jam.stop_reasons)}\', not \'{value}\'')
        notify: bool = value != self._stop_reason
        self._stop_reason = value
        if notify:
            self.notify()

    def get(self) -> dict[str | float | int, Any]:
        return {
            'start': str(self._start_timestamp) if self._start_timestamp is not None else None,
            'stop': str(self._stop_timestamp) if self._stop_timestamp is not None else None,
            'stopReason': self._stop_reason
        }

    def has_started(self) -> bool:
        return self._start_timestamp is not None

    def set_start(self, timestamp: datetime) -> None:
        if self._start_timestamp is not None:
            raise RuntimeError('This Jam has already started')
        self._start_timestamp = timestamp
        self.notify()

    def set_stop(self, timestamp: datetime) -> None:
        if self._stop_timestamp is not None:
            raise RuntimeError('This Jam has already ended')
        self._stop_timestamp = timestamp
        self._stop_reason = "other"
        self.notify()
