from __future__ import annotations
from abc import ABC, abstractmethod
from copy import copy
from typing import Self


class Copyable(ABC):
    @abstractmethod
    def __copy__(self) -> Self:
        ...

    def _copy_to(self, snapshot: Copyable) -> None:
        if hasattr(self, '__slots__'):
            for slot in self.__slots__:
                setattr(snapshot, slot, copy(getattr(self, slot)))
        if hasattr(self, '__dict__'):
            for key in self.__dict__.keys():
                setattr(snapshot, key, copy(getattr(self, key)))

    def restore(self, copy: Copyable) -> None:
        if hasattr(self, '__slots__'):
            for slot in self.__slots__:
                setattr(self, slot, getattr(copy, slot))
        if hasattr(self, '__dict__'):
            for key in self.__dict__.keys():
                setattr(self, key, getattr(copy, key))


# TODO: API design schema
'''
series:              getSeries
    bout:            getBout       boutId
        clocks
        info         getInfo       boutId
        roster       getRoster     boutId
        timeouts     getTimeouts   boutId
        jams:        getJam        boutId, periodId, jamId
            score    getScores     boutId, periodId, jamId, team
            lineup   getLineups    boutId, periodId, jamId, team
        penalties    getPenalties  boutId


The default serializer of each object should return a dict with just the basic
information. When the user is directly handling an object, it should be with
detailed information.

JSON encoder should strip leading underscores, and convert from snake_case to
camelCase.

Updates should be broadcast as:
    (bout_id, period_id, jam_id, team), resource

'''
