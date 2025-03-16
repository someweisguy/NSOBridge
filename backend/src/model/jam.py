from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal
from . import AbstractState
from .attribute import TeamAttribute

type JamStopReasons = Literal['called', 'time', 'injury', 'other']


@dataclass(slots=True)
class TripState(AbstractState):
    points: int
    timestamp: datetime


@dataclass(slots=True)
class ScoreState(AbstractState):
    lead: bool = False
    lost: bool = False
    star_pass: int | None = None
    _trips: list[TripState] = field(default_factory=list)

    @property
    def trips(self) -> list[TripState]:
        return self._trips


@dataclass(slots=True)
class JamState(TeamAttribute[ScoreState], AbstractState):
    start_timestamp: datetime | None = None
    stop_timestamp: datetime | None = None
    stop_reason: JamStopReasons | None = None
    _home: ScoreState = field(default_factory=ScoreState)
    _away: ScoreState = field(default_factory=ScoreState)

    @property
    def home(self) -> ScoreState:
        return self._home

    @property
    def away(self) -> ScoreState:
        return self._away
