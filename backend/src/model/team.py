from abc import ABC
from dataclasses import dataclass, field
from typing import Final, Literal, Protocol

type TeamString = Literal['home', 'away']


@dataclass
class TeamAttribute[T](Protocol):
    home: Final[T]
    away: Final[T]

    def __getitem__(self, key: TeamString) -> T:
        return getattr(self, key)


@dataclass(slots=True)
class Team:
    @dataclass
    class ClockStops:
        timeout: int = 3
        review: int = 1

    name: str = ''
    mnemonic: str = ''
    clock_stops: Final[ClockStops] = field(init=False, default_factory=ClockStops)


@dataclass(slots=True)
class RefereeContext(TeamAttribute[Team]):
    home: Final[Team] = field(init=False, default_factory=Team)
    away: Final[Team] = field(init=False, default_factory=Team)
    # TODO: add Officials


@dataclass
class AbstractReferee(ABC):
    context: Final[RefereeContext]
