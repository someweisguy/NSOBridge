from __future__ import annotations

from typing import Any, Final, Literal, Protocol
from uuid import UUID


type QueryKey = (tuple[UUID] | tuple[UUID, Literal['time', 'jam']] |
                 tuple[UUID, Literal['jam'], tuple[int, int]])
type TeamType = Literal['home', 'away']


# TODO: move this to the view
class Queryable(Protocol):
    def get_query_key(self, *args, **kwargs) -> QueryKey:
        raise NotImplementedError


class TeamAttribute[T: Any](Protocol):
    home: Final[T]
    away: Final[T]

    def __getitem__(self, key: TeamType) -> T:
        return getattr(self, key)
