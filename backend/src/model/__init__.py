from typing import Any, Protocol
from uuid import UUID, uuid4

from .attribute import TeamType
from .bout import BoutState, JamId
from .jam import JamState, JamStopReasons, TripState


class JSONSerializable(Protocol):
    def to_json(self) -> dict[str, Any]:
        raise NotImplementedError


series: dict[UUID, BoutState] = {
    uuid4(): BoutState('')
}
