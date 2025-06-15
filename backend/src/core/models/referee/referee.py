from functools import cached_property
from typing import Iterable, Protocol

from model import bouts
from model.bout import Bout
from core.responses import JSONable


class RefereeProtocol(Protocol):
    def __init__(self, bout_id: str):
        self.bout_id: str = bout_id

    @cached_property
    def bout(self) -> Bout:
        return bouts[self.bout_id]

    @property
    def update_keys(self) -> Iterable[JSONable]: ...
