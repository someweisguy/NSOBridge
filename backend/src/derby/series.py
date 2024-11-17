from typing import Any
from uuid import UUID, uuid4
from server import Queryable
from .bout import Bout


class Series(Queryable):   
    def __init__(self) -> None:
        super().__init__(None)
        self._bouts: dict[UUID, Bout] = {}

    def get(self) -> dict[str | float | int, Any]:
        return {str(k): {

        } for k, v in self._bouts.items()}

    def add_bout(self, uuid: str | UUID = '') -> Bout:
        if not uuid:
            uuid = uuid4()
        elif isinstance(uuid, str):
            uuid = UUID(uuid)
        bout: Bout = Bout(uuid)
        self.watch(bout)
        self._bouts[uuid] = bout
        return bout
    
    def get_bout(self, uuid: str | UUID) -> Bout:
        if isinstance(uuid, str):
            uuid = UUID(uuid)
        return self._bouts[uuid]