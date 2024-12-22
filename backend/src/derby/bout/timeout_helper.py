from __future__ import annotations
from datetime import datetime, timedelta
from derby.attributes import TeamAttribute
from derby.abstract_helper import AbstractHelper
from derby.timeout import Timeout
from typing import Literal, TYPE_CHECKING

if TYPE_CHECKING:
    from derby.bout import Bout

class TimeoutHelper(AbstractHelper['Bout']):
    def __init__(self, bout: Bout) -> None:
        super().__init__(bout)

    def is_running(self) -> bool:
        return (len(self.object._timeouts) > 0
                and self.object._timeouts[-1].is_running())

    def call(self, timestamp: datetime | None = None) -> None:
        if self.is_running():
            raise RuntimeError('A Timeout is already running')
        if self.object.get_game_state() != 'lineup':
            raise RuntimeError('A Timeout cannot be called right now')
        if timestamp is None:
            timestamp = datetime.now()

        # Assume the timeout is not an official review by default
        new_timeout: Timeout = Timeout(
            self.object.id, len(self.object._timeouts))

        # Set the period clock at which this timeout was called
        period_clock: timedelta | None = self.object._period_clock.get_remaining(
            timestamp)
        if period_clock is not None:
            new_timeout.period_clock = period_clock

        # Set the Jam number at which this timeout was called
        current_period_index: int = self.object.get_current_period_index()
        new_timeout.jam_id = (current_period_index,
                              len(self.object._jams[current_period_index]))
        # FIXME: get the current ACTIVE jam number

        self.object._timeouts.append(new_timeout)
        self.object.watch(new_timeout)
        if self.object._period_clock.is_running():
            self.object._period_clock.stop(timestamp)
        self.object._timeout_clock.start(timestamp)
        self.object.notify()

    def set_caller(self, caller: Literal['home', 'away',
                                                 'official']) -> None:
        if not self.is_running():
            raise RuntimeError('There is no active Timeout running')
        if caller not in ('home', 'away', 'official'):
            raise ValueError('Caller is invalid')

        timeout: Timeout = self.object._timeouts[-1]

        if timeout.caller == caller:
            return

        team_attribute: TeamAttribute[int] = (self.object._official_reviews_remaining
                                              if timeout.is_official_review
                                              else self.object._timeouts_remaining)
        if timeout.caller != 'official':
            team_attribute[timeout.caller] += 1
        if caller != 'official':
            team_attribute[caller] -= 1

        self.object._timeouts[-1].caller = caller
        self.object.notify()

    def set_official_review(self, is_official_review: bool) -> None:
        if not self.is_running():
            raise RuntimeError('There is no active Timeout running')
        timeout: Timeout = self.object._timeouts[-1]
        if timeout.caller == 'official':
            raise RuntimeError('Officials cannot call an Official Review')

        notify: bool = timeout.is_official_review != is_official_review
        self.object._timeouts[-1].is_official_review = is_official_review
        if notify:
            self.object.notify()

    def set_official_review_is_retained(self, is_retained: bool) -> None:
        if not self.is_running():
            raise RuntimeError('There is no active Timeout running')
        timeout: Timeout = self.object._timeouts[-1]
        notify: bool = timeout.is_retained != is_retained
        timeout.is_retained = is_retained
        if notify:
            self.object.notify()

    def set_official_review_detail(self, detail: str) -> None:
        if not self.is_running():
            raise RuntimeError('There is no active Timeout running')
        timeout: Timeout = self.object._timeouts[-1]
        notify: bool = timeout.detail != detail
        timeout.detail = detail
        if notify:
            self.object.notify()

    def set_official_review_result(self, result: str) -> None:
        if not self.is_running():
            raise RuntimeError('There is no active Timeout running')
        timeout: Timeout = self.object._timeouts[-1]
        notify: bool = timeout.result != result
        timeout.result = result
        if notify:
            self.object.notify()

    def end(self, timestamp: datetime | None = None) -> None:
        if not self.is_running():
            raise RuntimeError('There is no active Timeout running')
        if timestamp is None:
            timestamp = datetime.now()

        timeout: Timeout = self.object._timeouts[-1]

        # Replenish the Official Review if it was retained
        if timeout.is_official_review and timeout.is_retained:
            self.object._official_reviews_remaining[timeout.caller] += 1

        elapsed: timedelta = self.object._timeout_clock.get_elapsed(timestamp)
        self.object._timeout_clock.stop(timestamp)
        self.object._timeout_clock.reset()
        timeout.duration = elapsed
        self.object.notify()
