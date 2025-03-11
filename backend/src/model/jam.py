from .attribute import TeamAttribute
from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal

type JAM_STOP_REASONS = Literal['called', 'time', 'injury', 'other']


@dataclass(slots=True)
class Trip:
    points: int
    timestamp: datetime


@dataclass(slots=True)
class Score:
    lead: bool = False
    lost: bool = False
    star_pass: int | None = None
    _trips: list[Trip] = field(default_factory=list)

    @property
    def trips(self) -> list[Trip]:
        return self._trips


@dataclass(slots=True)
class Jam:
    start_timestamp: datetime | None = None
    stop_timestamp: datetime | None = None
    stop_reason: JAM_STOP_REASONS | None = None
    _score: TeamAttribute[Score] = field(default_factory=lambda: TeamAttribute(Score(), Score()))

    @property
    def score(self) -> TeamAttribute[Score]:
        return self._score
