from __future__ import annotations
from copy import deepcopy
from dataclasses import dataclass, field
from . import AbstractState
from .timer import TimerState
from .jam import JamState
from .stops import StopState


class Memento:
    __slots__ = '_originator', '_state'

    def __init__(self, originator: BoutState) -> None:
        self._originator: BoutState = originator
        self._state: BoutState = deepcopy(originator)

    def restore(self) -> None:
        for slot in self._originator.__slots__:
            setattr(self._originator, slot, getattr(self._state, slot))


@dataclass(slots=True)
class BoutState(AbstractState):
    _clock: TimerState = field(default_factory=TimerState)
    _jams: tuple[list[JamState], list[JamState]] = ([JamState()], [])
    _stops: StopState = field(default_factory=StopState)

    @property
    def clock(self) -> TimerState:
        return self._clock

    @property
    def jams(self) -> tuple[list[JamState], list[JamState]]:
        return self._jams

    @property
    def stops(self) -> StopState:
        return self._stops

    def get_snapshot(self):
        return Memento(self)
