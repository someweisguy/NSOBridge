from dataclasses import dataclass
from typing import Literal, Protocol

type TeamString = Literal['home', 'away']


@dataclass(slots=True)
class TeamAttribute[T](Protocol):
    home: T
    away: T

    def __getitem__(self, key: TeamString) -> T:
        return getattr(self, key)


@dataclass(slots=True)
class Team:
    name: str = ''
    mnemonic: str = ''
    timeouts_remaining: int = 3
    official_reviews_remaining: int = 1