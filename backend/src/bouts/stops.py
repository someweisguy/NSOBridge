from dataclasses import dataclass, field
from typing import Final

from .attribute import TeamAttribute


@dataclass(slots=True)
class TeamTimeoutState:
    timeouts_remaining: int = 3
    official_reviews_remaining: int = 1


@dataclass(slots=True)
class StopState(TeamAttribute[TeamTimeoutState]):
    history: Final[list] = field(default_factory=list)
    home: Final[TeamTimeoutState] = field(default_factory=TeamTimeoutState)
    away: Final[TeamTimeoutState] = field(default_factory=TeamTimeoutState)
