from datetime import datetime, timedelta

from pydantic import Field, ValidationInfo, field_validator

from core.models import ProjectModel


class Runnable(ProjectModel):
    start_timestamp: datetime | None = Field(None)
    stop_timestamp: datetime | None = Field(None)

    @classmethod
    @field_validator('start_timestamp', mode='after')
    def _start_validator(
        cls, value: datetime | None, info: ValidationInfo
    ) -> datetime | None:
        if value is None and info.data['stop_timestamp'] is not None:
            raise ValueError('Invalid start timestamp state')
        return value

    @classmethod
    @field_validator('stop_timestamp', mode='after')
    def _stop_validator(
        cls, value: datetime | None, info: ValidationInfo
    ) -> datetime | None:
        start_timestamp: datetime | None = info.data['start_timestamp']
        if value is not None and start_timestamp is None:
            raise ValueError('Invalid stop timestamp state')
        if (
            value is not None
            and start_timestamp is not None
            and start_timestamp < value
        ):
            raise ValueError('Stop timestamp cannot be before start timestamp')
        return value

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


class OneShotTimer(Runnable):
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
