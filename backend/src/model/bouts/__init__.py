from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass, field
from typing import Final
from uuid import UUID

from .attribute import Queryable, QueryKey, TeamType
from .jam import JamId, JamState, JamStopReasons, ScoreState, TripState
from .time import Clock, TeamTimeoutState, TimeState


class Memento:
    __slots__ = '_originator', '_state'

    def __init__(self, originator: BoutState) -> None:
        self._originator: BoutState = originator
        self._state: BoutState = deepcopy(originator)

    def restore(self) -> None:
        for slot in self._originator.__slots__:
            setattr(self._originator, slot, getattr(self._state, slot))


@dataclass(slots=True)
class BoutState(Queryable):
    ruleset_name: Final[str]
    clock: Final[TimeState] = field(init=False, default_factory=TimeState)
    jams: Final[tuple[list[JamState], list[JamState]]] = field(
        init=False, default=([JamState()], []))

    def get_snapshot(self):
        return Memento(self)

    def get_jam(self, jam_id: JamId) -> JamState:
        period, jam = jam_id
        return self.jams[period][jam]

    def get_query_key(self, bout_id: UUID) -> QueryKey:
        return (bout_id,)
