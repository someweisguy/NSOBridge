from typing import Any
from datetime import datetime, timedelta
from uuid import UUID
from server.view_model import Queryable


class Timer(Queryable):
    def __init__(self, bout_id: UUID, id: str) -> None:
        super().__init__((bout_id, id))
        self._start: datetime | None = None
        self._stop: datetime | None = None
        self._elapsed: timedelta = timedelta(milliseconds=0)
        self._alarm: timedelta | None = None
        # self._callback: Callable[[datetime], None] | None = None
        # self._task: asyncio.Task | None = None
        # self.set_alarm(hours=hours, minutes=minutes, seconds=seconds,
        #                 milliseconds=milliseconds)
    
    def get(self) -> dict[str | float | int, Any]:
        return {
            # TODO
        }

    def get_alarm(self) -> timedelta | None:
        return self._alarm
    
    def set_alarm(self, hours: float = 0, minutes: float = 0,
                  seconds: float = 0, milliseconds: float = 0) -> None:
        new_alarm: timedelta | None = timedelta(hours=hours, minutes=minutes,
                                                seconds=seconds,
                                                milliseconds=milliseconds)
        if new_alarm.total_seconds() <= 0:
            new_alarm = None
        notify: bool = new_alarm != self._alarm
        self._alarm = new_alarm
        if notify:
            self.notify()
    
    def get_elapsed(self, timestamp: datetime | None = None) -> timedelta:
        if self._start is not None and self._stop is not None:
            return self._stop - self._stop + self._elapsed
        elif self._start is not None:
            if timestamp is None:
                timestamp = datetime.now()
            return timestamp - self._start + self._elapsed
        else:
            return self._elapsed
    
    def start(self, timestamp: datetime) -> None:
        if self._start is not None:
            raise RuntimeError('This Timer is already running')
        self._start = timestamp
        self.notify()  # TODO: recurring notification
        
    def pause(self, timestamp: datetime) -> None:
        if self._stop is not None:
            raise RuntimeError('This Timer is already paused')
        self._stop = timestamp
        self.notify()
    
    def reset(self) -> None:
        ...

    def is_running(self) -> bool:
        return self._start is not None and self._stop is None