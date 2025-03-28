from datetime import datetime

from model import BoutState

class TimeKeeper:
    def start_half(self, bout: BoutState, timestamp: datetime) -> None:
        pass

    def end_half(self, bout: BoutState, timestamp: datetime) -> None:
        pass

    def start_jam(self, bout: BoutState, timestamp: datetime) -> None:
        pass

    def end_jam(self, bout: BoutState, timestamp: datetime) -> None:
        pass
