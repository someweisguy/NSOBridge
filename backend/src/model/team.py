from dataclasses import dataclass, field
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
    clock_stops: dict[Literal['timeout', 'review'], int] = field(
        default_factory=lambda: {'timeout': 3, 'review': 1}
    )
