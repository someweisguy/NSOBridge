from datetime import datetime, timedelta

from pydantic import Field

from core.models.time.one_shot import OneShotTimer, Runnable


class Resettable(Runnable):
    elapsed: timedelta = Field(timedelta(seconds=0))

    def get_duration(self, timestamp: datetime | None = None) -> timedelta:
        return super().get_duration(timestamp) + self.elapsed


class IntervalTimer(Resettable, OneShotTimer):
    def stop(self, timestamp: datetime) -> None:
        super().stop(timestamp)
        assert self.start_timestamp is not None and self.stop_timestamp is not None
        self.elapsed += self.stop_timestamp - self.start_timestamp
        self.start_timestamp = None
        self.stop_timestamp = None

    def reset(self) -> None:
        super().reset()
        self.elapsed = timedelta(seconds=0)
