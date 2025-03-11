from .attribute import TeamAttribute
from dataclasses import dataclass, field


@dataclass(slots=True)
class Stops:
    _timeouts_remaining: TeamAttribute[int] = TeamAttribute(3, 3)
    _official_reviews_remaining: TeamAttribute[int] = TeamAttribute(1, 1)
    _history: list = field(default_factory=list)
