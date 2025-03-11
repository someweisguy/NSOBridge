from .attribute import TeamAttribute
from dataclasses import dataclass, field


@dataclass(slots=True)
class Stops:
    _timeouts_remaining: TeamAttribute[int] = TeamAttribute(3, 3)
    _official_reviews_remaining: TeamAttribute[int] = TeamAttribute(1, 1)
    _history: list = field(default_factory=list)

    @property
    def timeouts(self) -> TeamAttribute[int]:
        return self._timeouts_remaining

    @property
    def official_reviews(self) -> TeamAttribute[int]:
        return self._official_reviews_remaining

    @property
    def history(self) -> list:
        return self._history
