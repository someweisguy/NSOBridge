import time


class Timer:
    @staticmethod
    def current_time() -> int:
        """Gets the server time in milliseconds using a monotonic clock."""
        now = time.monotonic_ns()
        return now // 1_000_000

    def __init__(self, duration: int) -> None:
        self._millis_remaining: int = duration
        self._started: None | int = None
    
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