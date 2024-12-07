from datetime import datetime, timedelta
from typing import Any, Literal
from server.view_model import Queryable
from uuid import UUID


class Timeout(Queryable[tuple[UUID, int]]):
    __slots__ = '_caller', '_jam_id', '_duration'

    def __init__(self, bout_id: UUID, id: int) -> None:
        super().__init__((bout_id, id))
        self._caller: Literal['home', 'away', 'official'] = 'official'
        self._jam_id: tuple[int, int] | None = None
        self._duration: timedelta | None = None

    @property
    def caller(self) -> Literal['home', 'away', 'official']:
        return self._caller

    @caller.setter
    def caller(self, value: Literal['home', 'away', 'official']) -> None:
        if value not in ('home', 'away', 'official'):
            raise ValueError('Caller is invalid')
        notify: bool = self._caller != value
        self._caller = value
        if notify:
            self.notify()

    @property
    def jam_id(self) -> tuple[int, int] | None:
        return self._jam_id

    @jam_id.setter
    def jam_id(self, value: tuple[int, int]) -> None:
        if any(num < 0 for num in value) or value[0] > 1:
            raise ValueError('Jam ID is invalid')
        notify: bool = self._jam_id != value
        self._jam_id = value
        if notify:
            self.notify()

    @property
    def duration(self) -> timedelta | None:
        return self._duration

    @duration.setter
    def duration(self, value: timedelta) -> None:
        if value.total_seconds() < 0:
            raise ValueError('Duration must be greater than zero')
        notify: bool = self._duration != value
        self._duration = value
        if notify:
            self.notify()

    def get(self) -> dict[str | float | int, Any]:
        duration: int | None = (round(self._duration.total_seconds() * 1000)
                                if self._duration is not None else None)
        return {
            'caller': self._caller,
            'jamId': self._jam_id,
            'duration': duration
        }

    def is_running(self) -> bool:
        return self._duration is None


class OfficialReview(Timeout):
    __slots__ = ('_period_clock_remaining', '_is_retained', '_detail',
                 '_result')

    def __init__(self, bout_id: UUID, id: int) -> None:
        super().__init__(bout_id, id)
        self._period_clock_remaining: timedelta | None = None
        self._is_retained: bool = False
        self._detail: str = ''
        self._result: str = ''

    @property
    def period_clock(self) -> timedelta | None:
        return self._period_clock_remaining

    @period_clock.setter
    def period_clock(self, value: timedelta) -> None:
        notify: bool = self._period_clock_remaining != value
        self._period_clock_remaining = value
        if notify:
            self.notify()

    @property
    def is_retained(self) -> bool:
        return self._is_retained

    @is_retained.setter
    def is_retained(self, value: bool) -> None:
        notify: bool = self._is_retained != value
        self._is_retained = value
        if notify:
            self.notify()

    @property
    def detail(self) -> str:
        return self._detail

    @detail.setter
    def detail(self, value: str) -> None:
        notify: bool = self._detail != value
        self._detail = value
        if notify:
            self.notify()

    @property
    def result(self) -> str:
        return self._result

    @result.setter
    def result(self, value: str) -> None:
        notify: bool = self._result != value
        self._result = value
        if notify:
            self.notify()

    def get(self) -> dict[str | float | int, Any]:
        period_clock: int | None = (round(self._period_clock_remaining.total_seconds() * 1000)
                                    if self._period_clock_remaining is not None else None)
        return {
            **super().get(),
            'periodClock': period_clock,
            'isRetained': self._is_retained,
            'detail': self._detail,
            'result': self._result
        }
