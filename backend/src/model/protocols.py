from dataclasses import dataclass
from typing import Literal, Protocol

type TeamType = Literal['home', 'away']


@dataclass(slots=True)
class TeamAttribute[T](Protocol):
    home: T
    away: T

    def __getitem__(self, key: TeamType) -> T:
        return getattr(self, key)
