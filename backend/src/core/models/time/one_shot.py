from abc import ABC
from datetime import datetime, timedelta
from typing import Self

from pydantic import Field, model_validator

from core.models import ProjectModel


class AbstractTimer(ProjectModel, ABC):
    start_timestamp: datetime | None = Field(None)
    stop_timestamp: datetime | None = Field(None)

    @model_validator(mode='after')
    def _model_validator(self) -> Self:
        if self.start_timestamp is None and self.stop_timestamp is not None:
            raise ValueError('Invalid timestamp state')
        if (
            self.start_timestamp is not None
            and self.stop_timestamp is not None
            and self.start_timestamp > self.stop_timestamp
        ):
            raise ValueError('Start timestamp must be before stop timestamp')
        return self

    def is_running(self) -> bool:
        return self.start_timestamp is not None and self.stop_timestamp is None

    def get_duration(self, timestamp: datetime | None = None) -> timedelta:
        if self.stop_timestamp is not None and self.start_timestamp is not None:
            return self.stop_timestamp - self.start_timestamp
        elif self.start_timestamp is not None:
            if timestamp is None:
                timestamp = datetime.now()
            if timestamp < self.start_timestamp:
                raise RuntimeError('Cannot get a duration for a time in the past')
            return timestamp - self.start_timestamp
        else:
            return timedelta(seconds=0)


class OneShotTimer(AbstractTimer):
    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError(f'This {self.__class__.__name__} is already running')
        self.start_timestamp = timestamp

    def stop(self, timestamp: datetime) -> None:
        if self.start_timestamp is None:
            raise RuntimeError(f'This {self.__class__.__name__} has already stopped')
        if self.start_timestamp > timestamp:
            raise ValueError(f'Cannot stop a {self.__class__.__name__} in the past')
        self.stop_timestamp = timestamp

    def reset(self) -> None:
        self.stop_timestamp = None
