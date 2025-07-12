from datetime import datetime, timedelta

from pydantic import Field, computed_field

from core.models import ProjectModel


class ReadOnlyOneShotTimer(ProjectModel):
    start_timestamp: datetime | None = Field(None)
    stop_timestamp: datetime | None = Field(None)

    def is_running(self) -> bool:
        return self.start_timestamp is not None and self.stop_timestamp is None

    def get_duration(self, timestamp: datetime | None = None) -> timedelta:
        if self.stop_timestamp is not None and self.start_timestamp is not None:
            return self.stop_timestamp - self.start_timestamp
        elif self.is_running():
            assert self.start_timestamp is not None
            if timestamp is None:
                timestamp = datetime.now()
            if timestamp < self.start_timestamp:
                raise RuntimeError('Timestamp cannot be in the past')
            return timestamp - self.start_timestamp
        else:
            return timedelta(seconds=0)


class ReadOnlyInterval(ReadOnlyOneShotTimer):
    elapsed: timedelta = timedelta(seconds=0)

    def get_duration(self, timestamp: datetime | None = None) -> timedelta:
        return super().get_duration(timestamp) + self.elapsed


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
