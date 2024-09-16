from dataclasses import dataclass, field
from datetime import datetime
from roller_derby.bout import Bout
from roller_derby.interface import Resource
from typing import Any
from uuid import UUID, uuid4
import server


@dataclass(slots=True, eq=False, frozen=True)
class Series(Resource):
    _bouts: dict[UUID, Bout] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.new_bout()

    def __getitem__(self, boutId: UUID) -> Bout:
        return self._bouts[boutId]

    def new_bout(self) -> Bout:
        id: UUID = uuid4()
        bout: Bout = Bout()
        self._bouts[id] = bout
        bout.clocks.set_callback(lambda _: server.queue_update((id, ), bout))
        return bout

    def serve(self, timestamp: datetime | None = None) -> dict[str, Any]:
        return {str(k): v.serve(timestamp) for k, v in self._bouts.items()}


bouts: Series = Series()


@server.register
def getSeries() -> Series:
    return bouts


@server.register
def getBout(bout_id: UUID) -> Bout:
    return bouts[bout_id]
