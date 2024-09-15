from dataclasses import dataclass, field
from bout import Bout
from interface import Servable
from typing import Any
from uuid import UUID, uuid4


@dataclass(slots=True, eq=False, frozen=True)
class Series(Servable):
    _bouts: dict[UUID, Bout] = field(default_factory=dict)

    def __post_init__(self) -> None:
        id: UUID = uuid4()
        self._bouts[id] = Bout(id)

    def __getitem__(self, boutId: UUID) -> Bout:
        return self._bouts[boutId]

    def new_bout(self) -> Bout:
        id: UUID = uuid4()
        bout: Bout = Bout(id)
        self._bouts[id] = bout
        return bout

    def serve(self) -> dict[str, Any]:
        return {str(k): v.serve() for k, v in self._bouts.items()}
