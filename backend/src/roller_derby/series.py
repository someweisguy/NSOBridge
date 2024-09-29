from dataclasses import dataclass, field
from roller_derby.bout import Bout
from typing import Iterable, Iterator
from uuid import UUID, uuid4


@dataclass(slots=True, eq=False, frozen=True)
class Series():
    _bouts: dict[UUID, Bout] = field(default_factory=dict)

    def __getitem__(self, boutId: str | UUID) -> Bout:
        if isinstance(boutId, str):
            boutId = UUID(boutId)
        return self._bouts[boutId]

    def __iter__(self):
        return next(self)

    def __next__(self) -> Iterator[UUID]:
        uuids: Iterable[UUID] = self._bouts.keys()
        for uuid in uuids:
            yield uuid

    def add(self) -> UUID:
        id: UUID = uuid4()
        self._bouts[id] = Bout()
        return id

    def delete(self, bout_id: UUID) -> None:
        del self._bouts[bout_id]
