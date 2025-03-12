from __future__ import annotations
from typing import Any, Literal, Protocol


class TeamAttribute[T: Any](Protocol):
    @property
    def home(self) -> T:
        raise NotImplementedError

    @property
    def away(self) -> T:
        raise NotImplementedError

    def __getitem__(self, key: Literal['home', 'away']) -> T:
        return getattr(self, key)
