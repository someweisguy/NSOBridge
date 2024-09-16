from __future__ import annotations
from copy import copy
from roller_derby.clocks import Clocks
from roller_derby.interface import Copyable, MajorResource
from roller_derby.jam import Jams
from typing import Any
from uuid import UUID
import server


class Bout(MajorResource, Copyable):
    __slots__ = '_id', '_clocks', '_jams'

    def __init__(self, id: UUID) -> None:
        self._id: UUID = id
        self._clocks: Clocks = Clocks()
        self._clocks.set_callback(lambda _: server.queue_update(self))
        self._jams: Jams = Jams()

    @property
    def clocks(self) -> Clocks:
        return self._clocks

    @property
    def jams(self) -> Jams:
        return self._jams

    def __copy__(self) -> Bout:
        # FIXME
        snapshot: Bout = Bout(self._id)
        snapshot._clocks = copy(self._clocks)
        snapshot._jams = copy(self._jams)
        return snapshot

    def get_simple(self) -> dict[str, Any]:
        return {
            # TODO: 'info'
            # TODO: 'roster'
            'timeouts': None,  # TODO
            'clocks': self._clocks,
            'jams': self._clocks,
            # TODO: 'penalties'
        }
