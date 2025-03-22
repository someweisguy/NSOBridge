from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass, field
from typing import ClassVar, Final, Literal, Protocol
from uuid import UUID, uuid4

from .attribute import TeamType
from .jam import JamState, JamStopReasons, TripState
from .time import TimeState

type JamId = tuple[int, int]
type QueryKey = (tuple[UUID] | tuple[UUID, Literal['time', 'jam']] |
                 tuple[UUID, Literal['jam'], tuple[int, int]])


class Queryable(Protocol):
    def get_query_key(self, *args, **kwargs) -> QueryKey:
        raise NotImplementedError


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
    BOUTS: ClassVar[Final[dict[UUID, BoutState]]] = {}

    ruleset_name: Final[str]
    clock: Final[TimeState] = field(init=False, default_factory=TimeState)
    jams: Final[tuple[list[JamState], list[JamState]]] = field(
        init=False, default=([JamState()], []))

    def __post_init__(self) -> None:
        from rules import Ruleset
        if self.ruleset_name not in Ruleset.RULESETS:
            raise ValueError(f"Ruleset {self.ruleset_name} not found")
        self.BOUTS[uuid4()] = self

    def get_snapshot(self):
        return Memento(self)

    def get_jam(self, jam_id: JamId) -> JamState:
        period, jam = jam_id
        return self.jams[period][jam]

    def get_query_key(self, bout_id: UUID) -> QueryKey:
        return (bout_id,)


def get_bout(bout_id: UUID) -> BoutState:
    return BoutState.BOUTS[bout_id]
