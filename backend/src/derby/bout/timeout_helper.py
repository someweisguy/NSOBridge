from __future__ import annotations
from datetime import datetime, timedelta
from derby.attributes import TeamAttribute
from derby.timeout import Timeout
from typing import Literal, TYPE_CHECKING

if TYPE_CHECKING:
    from derby.bout import Bout


class TimeoutHelper:
    __slots__ = '_bout'

    def __init__(self, bout: Bout) -> None:
        self._bout = bout

    @property
    def bout(self) -> Bout:
        return self._bout

    def is_running(self) -> bool:
        return (len(self.bout._timeouts) > 0
                and self.bout._timeouts[-1].is_running())

    def call(self, timestamp: datetime | None = None) -> None:
        if self.is_running():
            raise RuntimeError('A Timeout is already running')
        if not self.bout.clock.lineup.is_running():
            raise RuntimeError('A Timeout cannot be called right now')
        if timestamp is None:
            timestamp = datetime.now()

        # Assume the timeout is not an official review by default
        new_timeout: Timeout = Timeout(
            self.bout.id, len(self.bout._timeouts))

        # Set the period clock at which this timeout was called
        period_clock: timedelta | None = self.bout._period_clock.get_remaining(
            timestamp)
        if period_clock is not None:
            new_timeout.period_clock = period_clock

        # Set the Jam number at which this timeout was called
        current_period_index: int = self.bout.get_current_period_index()
        new_timeout.jam_id = (current_period_index,
                              len(self.bout._jams[current_period_index]))
        # FIXME: get the current ACTIVE jam number

        self.bout._timeouts.append(new_timeout)
        self.bout.watch(new_timeout)
        if self.bout._period_clock.is_running():
            self.bout._period_clock.stop(timestamp)
        self.bout._timeout_clock.start(timestamp)
        self.bout.notify()

    def set_caller(self, caller: Literal['home', 'away',
                                                 'official']) -> None:
        if not self.is_running():
            raise RuntimeError('There is no active Timeout running')
        if caller not in ('home', 'away', 'official'):
            raise ValueError('Caller is invalid')

        timeout: Timeout = self.bout._timeouts[-1]

        if timeout.caller == caller:
            return

        team_attribute: TeamAttribute[int] = (self.bout._official_reviews_remaining
                                              if timeout.is_official_review
                                              else self.bout._timeouts_remaining)
        if timeout.caller != 'official':
            team_attribute[timeout.caller] += 1
        if caller != 'official':
            team_attribute[caller] -= 1

        self.bout._timeouts[-1].caller = caller
        self.bout.notify()

    def set_official_review(self, is_official_review: bool) -> None:
        if not self.is_running():
            raise RuntimeError('There is no active Timeout running')
        timeout: Timeout = self.bout._timeouts[-1]
        if timeout.caller == 'official':
            raise RuntimeError('Officials cannot call an Official Review')

        notify: bool = timeout.is_official_review != is_official_review
        self.bout._timeouts[-1].is_official_review = is_official_review
        if notify:
            self.bout.notify()

    def set_official_review_is_retained(self, is_retained: bool) -> None:
        if not self.is_running():
            raise RuntimeError('There is no active Timeout running')
        timeout: Timeout = self.bout._timeouts[-1]
        notify: bool = timeout.is_retained != is_retained
        timeout.is_retained = is_retained
        if notify:
            self.bout.notify()

    def set_official_review_detail(self, detail: str) -> None:
        if not self.is_running():
            raise RuntimeError('There is no active Timeout running')
        timeout: Timeout = self.bout._timeouts[-1]
        notify: bool = timeout.detail != detail
        timeout.detail = detail
        if notify:
            self.bout.notify()

    def set_official_review_result(self, result: str) -> None:
        if not self.is_running():
            raise RuntimeError('There is no active Timeout running')
        timeout: Timeout = self.bout._timeouts[-1]
        notify: bool = timeout.result != result
        timeout.result = result
        if notify:
            self.bout.notify()

    def end(self, timestamp: datetime | None = None) -> None:
        if not self.is_running():
            raise RuntimeError('There is no active Timeout running')
        if timestamp is None:
            timestamp = datetime.now()

        timeout: Timeout = self.bout._timeouts[-1]

        # Replenish the Official Review if it was retained
        if timeout.is_official_review and timeout.is_retained:
            self.bout._official_reviews_remaining[timeout.caller] += 1

        elapsed: timedelta = self.bout._timeout_clock.get_elapsed(timestamp)
        self.bout._timeout_clock.stop(timestamp)
        self.bout._timeout_clock.reset()
        timeout.duration = elapsed
        self.bout.notify()
