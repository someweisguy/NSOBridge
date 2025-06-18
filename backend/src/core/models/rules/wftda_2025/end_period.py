from dataclasses import dataclass
from datetime import datetime
from typing import Iterable

from core.models.bout.bout import Bout


@dataclass(slots=True)
class EndPeriod:
    bout: Bout
    timestamp: datetime

    def execute(self) -> None:
        pass  # TODO

    def get_update_keys(self) -> Iterable:
        return []  # TODO
