import time
from datetime import timedelta


class Timer:
    @staticmethod
    def current_time() -> int:
        """Gets the server time in milliseconds using a monotonic clock."""
        now = time.monotonic_ns()
        return now // 1_000_000

    def __init__(self, duration: int) -> None:
        self._millis_remaining: int = duration
        self._started: None | int = None
    
    @property
    def remaining(self) -> timedelta:
        return timedelta(milliseconds=self._millis_remaining)
    
    @remaining.setter
    def remaining(self, duration: int) -> None:
        if not isinstance(duration, int):
            raise TypeError()  # TODO
        if duration < 0: 
            raise ValueError()  # TODO
        self._millis_remaining = duration
    
    def start(self, timestamp: int) -> None:
        if not isinstance(timestamp, int):
            raise TypeError(f"timestamp must be int, not {type(timestamp).__name__}")
        if self._started is not None:
            raise RuntimeError("timer is already running")
        self._started = timestamp

    def pause(self, timestamp: int) -> None:
        if not isinstance(timestamp, int):
            raise TypeError(f"timestamp must be int, not {type(timestamp).__name__}")
        if self._started is None:
            raise RuntimeError("timer is not running")
        self._millis_remaining -= timestamp - self._started
        self._started = None

class TimerManager:
    def __init__(self) -> None:
        self._game: Timer = Timer(30 * 60 * 1000)
        self._jam: Timer = Timer(2 * 60 * 1000)
    
    @property
    def game(self) -> Timer:
        return self._game
    
    @property
    def jam(self) -> Timer:
        return self._jam