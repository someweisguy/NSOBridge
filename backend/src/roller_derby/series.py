from dataclasses import dataclass, field
from datetime import datetime
from roller_derby.bout import Bout
from roller_derby.interface import Resource
from typing import Any
from uuid import UUID, uuid4
from server import context as bouts
import server


@dataclass(slots=True, eq=False, frozen=True)
class Series(Resource):
    _bouts: dict[UUID, Bout] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.add()

    def __getitem__(self, boutId: UUID) -> Bout:
        return self._bouts[boutId]

    def add(self) -> UUID:
        id: UUID = uuid4()
        bout: Bout = Bout()
        self._bouts[id] = bout
        bout.clocks.set_callback(lambda _: server.queue_update((id, ), bout))
        return id

    def delete(self, bout_id: UUID) -> None:
        del self._bouts[bout_id]

    def serve(self, timestamp: datetime | None = None) -> dict[str, Any]:
        return {str(k): v.serve(timestamp) for k, v in self._bouts.items()}


@server.register
def getSeries() -> Series:
    return bouts


@server.register
def addBout() -> None:
    new_bout_id: UUID = bouts.add()
    server.queue_update((new_bout_id,), bouts[new_bout_id])


@server.register
def deleteBout(boutId: UUID) -> None:
    bouts.delete(boutId)
    server.queue_update((boutId,), None)
