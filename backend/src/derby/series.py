from typing import Any
from uuid import UUID
from server.model import Queryable
from .bout import Bout


class Series(Queryable):
    def __init__(self) -> None:
        super().__init__(None)
        self._bouts: dict[UUID, Bout] = {}

    def get_data(self) -> dict[str | float | int, Any]:
        return {str(k): {

        } for k, v in self._bouts.items()}
