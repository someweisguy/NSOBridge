from .attribute import TeamAttribute
from dataclasses import dataclass, field


@dataclass(slots=True)
class TeamTimeouts:
    timeouts_remaining: int = 3
    official_reviews_remaining: int = 1


@dataclass(slots=True)
class Stops(TeamAttribute[TeamTimeouts]):
    _history: list = field(default_factory=list)
    _home: TeamTimeouts = TeamTimeouts()
    _away: TeamTimeouts = TeamTimeouts()

    @property
    def home(self) -> TeamTimeouts:
        return self._home

    @property
    def away(self) -> TeamTimeouts:
        return self._away

    @property
    def history(self) -> list:
        return self._history
