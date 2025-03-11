from __future__ import annotations
from .timer import Timer
from .jam import Jam
from .stops import Stops
from copy import deepcopy
from dataclasses import dataclass, field


class Memento:
    __slots__ = '_originator', '_state'

    def __init__(self, originator: Bout) -> None:
        self._originator: Bout = originator
        self._state: Bout = deepcopy(originator)

    def restore(self) -> None:
        for slot in self._originator.__slots__:
            setattr(self._originator, slot, getattr(self._state, slot))


@dataclass(slots=True)
class Bout:
    _clock: Timer = field(default_factory=Timer)
    _jams: tuple[list[Jam], list[Jam]] = ([Jam()], [])
    _stops: Stops = field(default_factory=Stops)

    @property
    def clock(self) -> Timer:
        return self._clock

    @property
    def jams(self) -> tuple[list[Jam], list[Jam]]:
        return self._jams

    @property
    def stops(self) -> Stops:
        return self._stops

    def get_snapshot(self):
        return Memento(self)
