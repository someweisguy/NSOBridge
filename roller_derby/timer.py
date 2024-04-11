from datetime import datetime
import time


class Timer:
    __slots__ = "_elapsed_milliseconds", "_started_milliseconds", "_alarm_milliseconds"

    @staticmethod
    def monotonic() -> int:
        """Returns the monotonic time of the server in milliseconds.

        Returns:
            int: The monotonic time of the game server in milliseconds elapsed since an arbitrary point.
        """
        now = time.monotonic_ns()
        return round(now / 1_000_000)

    def __init__(
        self,
        alarm: None | datetime = None,
        *,
        hours: int = 0,
        minutes: int = 0,
        seconds: int = 0,
        milliseconds: int = 0,
    ) -> None:
        """Initializes a Timer object. A Timer may act as a count-down or a
        count-up. To initialize a count-down Timer, a time value must be
        specified using the hours, minutes, seconds, and milliseconds keyword
        arguments. A counter-down Timer which counts down to a specified
        datetime may be initialized by passing a datetime to which to
        count-down. A count-up Timer is initialized without any arguments.

        Args:
            alarm (None | datetime, optional): The desired count-down datetime.
            This argument must be None if any other arguments are provided.
            Defaults to None.
            hours (int, optional): The number of hours to count-down. Defaults
            to 0.
            minutes (int, optional): The number of minutes to count-down.
            Defaults to 0.
            seconds (int, optional): The number of seconds to count-down.
            Defaults to 0.
            milliseconds (int, optional): The number of milliseconds to
            count-down. Defaults to 0.

        Raises:
            TypeError: if an invalid argument type is provided.
            ValueError: if a datetime in the past is provided or if a negative
            hours, minutes, seconds, or milliseconds value is provided.
        """
        assert alarm is None  # TODO
        if (
            not isinstance(hours, int)
            or not isinstance(minutes, int)
            or not isinstance(seconds, int)
            or not isinstance(milliseconds, int)
        ):
            raise TypeError("Timer alarm value must be int")
        if hours < 0 or minutes < 0 or seconds < 0 or milliseconds < 0:
            raise ValueError("Timer alarm value must be positive")
        self._elapsed_milliseconds: int = 0
        self._started_milliseconds: None | int = None
        self._alarm_milliseconds: int = hours * 60 * 60 * 1000
        self._alarm_milliseconds += minutes * 60 * 1000
        self._alarm_milliseconds += seconds * 1000
        self._alarm_milliseconds += milliseconds

    @property
    def remaining(self) -> int:
        """Returns the number of milliseconds that is remaining on this Timer.

        Returns:
            int: The number of milliseconds remaining.
        """
        return self._alarm_milliseconds - self._elapsed_milliseconds

    @property
    def elapsed(self) -> int:
        """Returns the number of milliseconds that have elapsed on this Timer.

        Returns:
            int: The number of milliseconds that have elapsed.
        """
        return self._elapsed_milliseconds

    def is_running(self) -> bool:
        """Returns True if the Timer is running.

        Returns:
            bool: True if the Timer is running, else False.
        """
        return self._started_milliseconds is not None

    def start(self, timestamp: int = monotonic()) -> None:
        """Starts the timer at the specified monotonic, millisecond timestamp.

        Args:
            timestamp (int, optional): The monotonic, millisecond timestamp at
            which this method was called. Defaults to Timer.monotonic().

        Raises:
            TypeError: if the incorrect type is provided.
            RuntimeError: if the Timer is already running.
        """
        if not isinstance(timestamp, int):
            raise TypeError(f"timestamp must be int, not {type(timestamp).__name__}")
        if self.is_running():
            raise RuntimeError("Timer is already running")
        self._started_milliseconds = timestamp

    def pause(self, timestamp: int = monotonic()) -> None:
        """Pauses the timer at the specified monotonic, millisecond timestamp.

        Args:
            timestamp (int, optional): The monotonic, millisecond timestamp at
            which this method was called. Defaults to Timer.monotonic().

        Raises:
            TypeError: if the incorrect type is provided.
            RuntimeError: if the Timer is not running.
        """
        if not isinstance(timestamp, int):
            raise TypeError(f"timestamp must be int, not {type(timestamp).__name__}")
        if not self.is_running():
            raise RuntimeError("Timer is not running")
        assert self._started_milliseconds is not None
        self._elapsed_milliseconds += timestamp - self._started_milliseconds
        self._started_milliseconds = None

    def serialize(self) -> dict:
        # TODO: make this an interface method
        return {
            "alarm": self._alarm_milliseconds,
            "elapsed": self._elapsed_milliseconds,
            "started": self._started_milliseconds,
        }


class TimerManager:
    def __init__(self) -> None:
        self._game: Timer = Timer(minutes=30)
        self._jam: Timer = Timer(minutes=2)
        self._lineup: Timer = Timer()

    @property
    def game(self) -> Timer:
        return self._game

    @property
    def jam(self) -> Timer:
        return self._jam

    @property
    def lineup(self) -> Timer:
        return self._lineup
