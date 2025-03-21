from dataclasses import dataclass, field
from .attribute import TeamAttribute



@dataclass(slots=True)
class TeamTimeoutState:
    timeouts_remaining: int = 3
    official_reviews_remaining: int = 1


@dataclass(slots=True)
class StopState(TeamAttribute[TeamTimeoutState]):
    _history: list = field(default_factory=list)
    _home: TeamTimeoutState = field(default_factory=TeamTimeoutState)
    _away: TeamTimeoutState = field(default_factory=TeamTimeoutState)

    @property
    def home(self) -> TeamTimeoutState:
        return self._home

    @property
    def away(self) -> TeamTimeoutState:
        return self._away

    @property
    def history(self) -> list:
        return self._history
