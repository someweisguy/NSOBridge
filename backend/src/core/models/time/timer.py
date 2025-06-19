from datetime import datetime, timedelta

from pydantic import computed_field

from core.models import ProjectModel


class Timer(ProjectModel):
    _start_timestamp: datetime | None = None
    _elapsed: timedelta = timedelta(seconds=0)

    @computed_field
    @property
    def start_timestamp(self) -> datetime | None:
        return self._start_timestamp

    @computed_field
    @property
    def elapsed(self) -> timedelta:
        return self._elapsed

    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError(f'This {self.__class__.__name__} is already running')
        self._start_timestamp = timestamp

    def stop(self, timestamp: datetime) -> None:
        if self._start_timestamp is None:
            raise RuntimeError(f'This {self.__class__.__name__} has already stopped')
        if self._start_timestamp > timestamp:
            raise ValueError('Stop timestamp cannot be in the past')
        self._elapsed += timestamp - self._start_timestamp
        self._start_timestamp = None

    def is_running(self) -> bool:
        return self._start_timestamp is not None

    def reset(self) -> None:
        self._start_timestamp = None
        self._elapsed = timedelta(seconds=0)

    def get_elapsed_at_timestamp(self, timestamp: datetime) -> timedelta:
        elapsed = self._elapsed
        if self._start_timestamp is not None:
            elapsed += timestamp - self._start_timestamp
        return elapsed
