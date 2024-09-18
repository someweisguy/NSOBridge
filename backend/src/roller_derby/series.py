from dataclasses import dataclass, field
from datetime import datetime
from roller_derby.bout import Bout
from roller_derby.interface import Resource
from typing import Any
from uuid import UUID, uuid4


@dataclass(slots=True, eq=False, frozen=True)
class Series(Resource):
    _bouts: dict[UUID, Bout] = field(default_factory=dict)

    def __getitem__(self, boutId: UUID) -> Bout:
        return self._bouts[boutId]

    def add(self) -> UUID:
        id: UUID = uuid4()
        self._bouts[id] = Bout()
        return id

    def delete(self, bout_id: UUID) -> None:
        del self._bouts[bout_id]

    def serve(self, timestamp: datetime | None = None) -> dict[str, Any]:
        return {str(k): v.serve(timestamp) for k, v in self._bouts.items()}
