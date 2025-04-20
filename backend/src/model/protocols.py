from typing import Final, Literal, Protocol

type TeamType = Literal['home', 'away']


class TeamAttribute[T](Protocol):
    home: Final[T]
    away: Final[T]

    def __getitem__(self, key: TeamType) -> T:
        return getattr(self, key)
