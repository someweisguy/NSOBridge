from dataclasses import dataclass, field
from bout import Bout
from interface import Requestable
from typing import Any
from uuid import UUID, uuid4


@dataclass(slots=True, eq=False, frozen=True)
class Series(Requestable):
    _bouts: dict[UUID, Bout] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self._bouts[uuid4()] = Bout()

    def __getitem__(self, boutId: UUID) -> Bout:
        return self._bouts[boutId]

    def new_bout(self) -> Bout:
        bout: Bout = Bout()
        self._bouts[uuid4()] = bout
        return bout

    def serve(self) -> dict[str, Any]:
        return {str(k): v.serve() for k, v in self._bouts.items()}


bouts = Series()
print(bouts.serve())
