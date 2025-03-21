from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal

from .attribute import TeamAttribute

type JamStopReasons = Literal['called', 'time', 'injury', 'other']


@dataclass(slots=True)
class TripState:
    points: int
    timestamp: datetime


@dataclass(slots=True)
class ScoreState:
    lead: bool = False
    lost: bool = False
    star_pass: int | None = None
    _trips: list[TripState] = field(default_factory=list)

    @property
    def trips(self) -> list[TripState]:
        return self._trips


@dataclass(slots=True)
class JamState(TeamAttribute[ScoreState]):
    start_timestamp: datetime | None = None
    stop_timestamp: datetime | None = None
    stop_reason: JamStopReasons | None = None
    _home: ScoreState = field(default_factory=ScoreState)
    _away: ScoreState = field(default_factory=ScoreState)

    def __getitem__(self, key: Literal['home', 'away']) -> ScoreState:
        if key == 'home':
            return self._home
        if key == 'away':
            return self._away
        raise KeyError(f"Invalid team: {key}")

    @property
    def home(self) -> ScoreState:
        return self._home

    @property
    def away(self) -> ScoreState:
        return self._away

    def lead_is_declared(self) -> bool:
        return self.home.lead or self.away.lead
