from dataclasses import dataclass, field
from datetime import datetime
from typing import TYPE_CHECKING, Final, Literal
from uuid import UUID

from .attribute import TeamAttribute, QueryKey, Queryable

type JamId = tuple[int, int]
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
    trips: Final[list[TripState]] = field(default_factory=list)


@dataclass(slots=True)
class JamState(TeamAttribute[ScoreState],):
    start_timestamp: datetime | None = None
    stop_timestamp: datetime | None = None
    stop_reason: JamStopReasons | None = None
    home: Final[ScoreState] = field(default_factory=ScoreState)
    away: Final[ScoreState] = field(default_factory=ScoreState)

    def __getitem__(self, key: Literal['home', 'away']) -> ScoreState:
        if key == 'home':
            return self.home
        if key == 'away':
            return self.away
        raise KeyError(f"Invalid team: {key}")

    def lead_is_declared(self) -> bool:
        return self.home.lead or self.away.lead

    def get_query_key(self, bout_id: UUID, jam_id: JamId) -> QueryKey:
        return (bout_id, 'jam', jam_id)
