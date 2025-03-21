from datetime import datetime
from uuid import UUID

from .abstract_keeper import AbstractKeeper

class TimeKeeper(AbstractKeeper):
    def start_half(self, bout_id: UUID, timestamp: datetime) -> None:
        pass

    def end_half(self, bout_id: UUID, timestamp: datetime) -> None:
        pass

    def start_jam(self, bout_id: UUID, timestamp: datetime) -> None:
        pass

    def end_jam(self, bout_id: UUID, timestamp: datetime) -> None:
        pass
