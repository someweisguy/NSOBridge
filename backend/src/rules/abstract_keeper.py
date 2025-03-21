from typing import Protocol
from uuid import UUID

import model
from model import BoutState


class AbstractKeeper(Protocol):
    @classmethod
    def get_bout(cls, bout_id: UUID) -> BoutState:
        return model.series[bout_id]
