from datetime import datetime

from ..state import Bout


class TimeKeeper:
    def start_half(self, bout: Bout, timestamp: datetime) -> None:
        pass

    def end_half(self, bout: Bout, timestamp: datetime) -> None:
        pass

    def start_jam(self, bout: Bout, timestamp: datetime) -> None:
        pass

    def end_jam(self, bout: Bout, timestamp: datetime) -> None:
        pass
