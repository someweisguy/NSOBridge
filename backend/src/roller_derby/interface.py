from abc import ABC, abstractmethod
from typing import Any, Self


class Requestable(ABC):
    @abstractmethod
    def serve(self) -> dict[str, Any]:
        ...


class Copyable(ABC):
    @abstractmethod
    def __copy__(self) -> Self:
        ...

    def restore(self, copy: Self) -> None:
        if hasattr(self, '__slots__'):
            for slot in self.__slots__:
                setattr(self, slot, getattr(copy, slot))
        if hasattr(self, '__dict__'):
            for key in self.__dict__.keys():
                setattr(self, key, getattr(copy, key))
