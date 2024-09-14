from __future__ import annotations
from abc import ABC, abstractmethod
from copy import copy
from typing import Any, Self


class Requestable(ABC):
    @abstractmethod
    def serve(self) -> dict[str, Any]:
        ...


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
