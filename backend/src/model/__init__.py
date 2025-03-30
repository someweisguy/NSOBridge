from typing import Final
from uuid import UUID

from state import Bout
from rules import Ruleset



class Model:
    __slots__ = '_bouts', 'rules'

    def __init__(self):
        self._bouts: dict[UUID, Bout] = {}
        self.rules: Final[dict[str, Ruleset]] = {}

    @property
    def bouts(self) -> dict[UUID, Bout]:
        return self._bouts

    def add_bout(self, ruleset_name: str) -> Bout:
        if ruleset_name not in self.rules:
            raise ValueError(f"Ruleset {ruleset_name} not found")
        bout = Bout(ruleset_name)
        return bout

    def delete_bout(self, bout_id: UUID) -> None:
        if bout_id not in self._bouts:
            raise KeyError(f"Bout {bout_id} not found")
        del self._bouts[bout_id]

    def get_bout(self, bout_id: UUID) -> Bout:
        if bout_id not in self._bouts:
            raise KeyError(f"Bout {bout_id} not found")
        return self._bouts[bout_id]
