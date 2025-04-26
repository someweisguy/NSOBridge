from dataclasses import dataclass, field
from datetime import datetime
from typing import Final, Literal

from .protocols import TeamAttribute

type JamId = tuple[int, int]
type JamStopReasons = Literal['called', 'time', 'injury', 'other']


@dataclass(slots=True)
class Score:
    @dataclass(slots=True)
    class Trip:
        points: int
        timestamp: datetime

    lead: bool = False
    lost: bool = False
    star_pass: int | None = None
    trips: Final[list[Trip]] = field(default_factory=list)


@dataclass(slots=True)
class Team:
    score: Final[Score] = field(default_factory=Score)


@dataclass(slots=True)
class Jam(TeamAttribute[Team]):
    start_timestamp: datetime | None = None
    stop_timestamp: datetime | None = None
    stop_reason: JamStopReasons | None = None
    home: Final[Team] = field(default_factory=Team)  # type: ignore[assignment]
    away: Final[Team] = field(default_factory=Team)  # type: ignore[assignment]

    def lead_is_declared(self) -> bool:
        return self.home.score.lead or self.away.score.lead
