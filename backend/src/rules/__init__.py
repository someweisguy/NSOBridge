from __future__ import annotations
from abc import ABC, abstractmethod


# TODO: move this class to a different location
class BoutHandler:
    pass


class Rule(ABC):
    def __init__(self, handler: BoutHandler) -> None:
        self.__handler: BoutHandler = handler

    @property
    def handler(self) -> BoutHandler:
        return self.__handler

    @abstractmethod
    def execute(self, *args, **kwargs) -> None:
        raise NotImplementedError
