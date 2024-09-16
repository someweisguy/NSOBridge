from dataclasses import dataclass, field
from roller_derby.bout import Bout
from roller_derby.interface import MinorResource
from typing import Any
from uuid import UUID, uuid4


@dataclass(slots=True, eq=False, frozen=True)
class Series(MinorResource):
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

    def get_detailed(self) -> dict[str, Any]:
        return {str(k): v.get_simple() for k, v in self._bouts.items()}


bouts: Series = Series()
