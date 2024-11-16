from typing import Any, Hashable
from uuid import UUID
from server import Queryable


class Jam(Queryable):
    def __init__(self, bout_id: UUID, key: Hashable) -> None:
        self._bout_id: UUID = bout_id
        super().__init__((bout_id, key))

    @property
    def bout_id(self) -> UUID:
        return self._bout_id

    def get(self) -> dict[str | float | int, Any]:
        return {
            # TODO
        }
