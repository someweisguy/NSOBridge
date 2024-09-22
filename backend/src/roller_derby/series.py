from dataclasses import dataclass, field
from roller_derby.bout import Bout
from typing import Self
from uuid import UUID, uuid4


@dataclass(slots=True, eq=False, frozen=True)
class Series():
    _bouts: dict[UUID, Bout] = field(default_factory=dict)

    def __getitem__(self, boutId: UUID) -> Bout:
        return self._bouts[boutId]

    def __iter__(self) -> Self:
        return self

    def __next__(self) -> UUID:
        return next(self._bouts.__iter__())

    def add(self) -> UUID:
        id: UUID = uuid4()
        self._bouts[id] = Bout()
        return id

    def delete(self, bout_id: UUID) -> None:
        del self._bouts[bout_id]
