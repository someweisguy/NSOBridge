from functools import cached_property
from typing import Iterable, Protocol

from models.bout import Bout, bouts


class RefereeProtocol(Protocol):
    def __init__(self, bout_id: str):
        self.bout_id: str = bout_id

    @cached_property
    def bout(self) -> Bout:
        return bouts[self.bout_id]

    @property
    def update_keys(self) -> Iterable: ...
