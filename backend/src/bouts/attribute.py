from __future__ import annotations

from typing import Any, Final, Literal, Protocol

type TeamType = Literal['home', 'away']

class TeamAttribute[T: Any](Protocol):
    home: Final[T]
    away: Final[T]

    def __getitem__(self, key: Literal['home', 'away']) -> T:
        return getattr(self, key)
