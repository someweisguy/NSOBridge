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
class Jam(TeamAttribute[Score]):
    start_timestamp: datetime | None = None
    stop_timestamp: datetime | None = None
    stop_reason: JAM_STOP_REASONS | None = None
    _home: Score = Score()
    _away: Score = Score()

    @property
    def home(self) -> Score:
        return self._home

    @property
    def away(self) -> Score:
        return self._away
