from __future__ import annotations
from typing import Any
from uuid import UUID
import server


class Id(server.Identifier):
    __slots__ = 'type', 'bout', 'period', 'jam'

    @staticmethod
    def from_dict(dictionary: dict[str, Any]) -> Id:
        return Id(**dictionary)

    def __init__(self, type: type | str, bout_id: UUID | str | None = None,
                 period_id: int | None = None,
                 jam_id: int | None = None) -> None:
        super().__init__(type)
        self.bout: UUID | None = (UUID(bout_id) if isinstance(bout_id, str)
                                  else bout_id)
        self.period: int | None = period_id
        self.jam: int | None = jam_id

    def __dict__(self) -> dict[str, str | int | float | bool | None]:
        dictionary: dict = {
            'type': self.type,
            'bout': str(self.bout),
        }
        if self.period is not None:
            dictionary['period'] = self.period
        if self.jam is not None:
            dictionary['jam'] = self.jam
        return dictionary


if __name__ != '__main__':
    from . import bout, jam, series  # noqa
