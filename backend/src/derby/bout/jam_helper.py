from __future__ import annotations
from datetime import datetime, timedelta
from derby.jam import Jam
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from derby.bout import Bout


class JamHelper:
    __slots__ = '_bout'

    def __init__(self, bout: Bout) -> None:
        self._bout = bout

    @property
    def bout(self) -> Bout:
        return self._bout
    
    def is_running(self) -> bool:
        return self.bout.clock.jam.is_running()

    def get(self, jam_id: tuple[int, int]) -> Jam:
        period_index, jam_index = jam_id
        return self.bout._jams[period_index][jam_index]

    def push(self, period: int) -> None:
        next_jam_number: int = len(self.bout._jams[period])
        new_jam: Jam = Jam(self.bout.id, (period, next_jam_number))
        self.bout._jams[period].append(new_jam)
        self.bout.watch(new_jam)
        self.bout.notify()

    def pop(self, period: int) -> Jam:
        popped_jam: Jam = self.bout._jams[period].pop()
        self.bout.un_watch(popped_jam)
        self.bout.notify()
        return popped_jam

    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError('A Jam is already running')
        elif self.bout._timeout_clock.is_running():
            raise RuntimeError('A Jam cannot start when a Timeout is ongoing')
        jam: Jam = self.bout._jams[self.bout.get_current_period_index()][-1]

        for clock in (self.bout._intermission_clock, self.bout._lineup_clock,
                      self.bout._timeout_clock):
            if clock.is_running():
                clock.stop(timestamp)

        if not self.bout._period_clock.is_running():
            self.bout._period_clock.start(timestamp)

        jam.set_start(timestamp)
        self.bout._jam_clock.reset()
        self.bout._jam_clock.start(timestamp)
        self.bout.notify()

    def stop(self, timestamp: datetime) -> None:
        if not self.is_running():
            raise RuntimeError('There is no Jam running')
        current_period_index: int = self.bout.get_current_period_index()
        jam: Jam = self.bout._jams[current_period_index][-1]

        # Attempt the guess the call-off reason
        reason: Jam.stop_reasons
        remaining_time: timedelta | None = self.bout._jam_clock.get_remaining()
        if remaining_time is not None and remaining_time.total_seconds() < 1:
            reason = 'time'
        elif ((jam.score.home.lead and not jam.score.home.lost)
              or (jam.score.away.lead and not jam.score.away.lost)):
            reason = 'called'
        else:
            reason = 'other'

        jam.set_stop(timestamp)
        jam.stop_reason = reason
        self.bout._jam_clock.stop(timestamp)
        self.bout._lineup_clock.reset()
        self.bout._lineup_clock.start(timestamp)
        self.push(current_period_index)
        self.bout.notify()
