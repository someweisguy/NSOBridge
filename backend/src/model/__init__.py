from typing import Final
from uuid import UUID

from .bouts import BoutState
from .rules import Ruleset


class Model:
    __slots__ = '_bouts', 'rules'

    def __init__(self):
        self._bouts: dict[UUID, BoutState] = {}
        self.rules: Final[dict[str, Ruleset]] = {}

    @property
    def bouts(self) -> dict[UUID, BoutState]:
        return self._bouts

    def add_bout(self, ruleset_name: str) -> BoutState:
        if ruleset_name not in self.rules:
            raise ValueError(f"Ruleset {ruleset_name} not found")
        bout = BoutState(ruleset_name)
        return bout

    def delete_bout(self, bout_id: UUID) -> None:
        if bout_id not in self._bouts:
            raise KeyError(f"Bout {bout_id} not found")
        del self._bouts[bout_id]

    def get_bout(self, bout_id: UUID) -> BoutState:
        if bout_id not in self._bouts:
            raise KeyError(f"Bout {bout_id} not found")
        return self._bouts[bout_id]
