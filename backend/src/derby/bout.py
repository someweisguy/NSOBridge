from datetime import datetime, timedelta
from derby.jam import Jam
from derby.clock import Clock
from typing import Any, Literal
from server import Queryable
from uuid import UUID


class Bout(Queryable[UUID]):
    __slots__ = ('_period_clock', '_intermission_clock', '_lineup_clock',
                 '_jam_clock', '_timeout_clock', '_jams')

    def __init__(self, id: UUID) -> None:
        super().__init__(id)

        # Instantiate clocks
        self._period_clock: Clock = Clock(id, 'period')
        self._intermission_clock: Clock = Clock(id, 'intermission')
        self._lineup_clock: Clock = Clock(id, 'lineup')
        self._jam_clock: Clock = Clock(id, 'jam')
        self._timeout_clock: Clock = Clock(id, 'timeout')
        self._period_clock.set_alarm(minutes=30)
        self._lineup_clock.set_alarm(seconds=30)
        self._jam_clock.set_alarm(minutes=2)

        # Subscribe to each clock
        clocks: tuple[Clock, ...] = (self._period_clock,
                                     self._intermission_clock,
                                     self._lineup_clock, self._jam_clock,
                                     self._timeout_clock)
        for clock in clocks:
            self.watch(clock)

        # Instantiate periods
        self._jams: tuple[list[Jam], list[Jam]] = ([], [])
        self.push_jam(0)  # At least 1 Jam is required

    def get(self) -> dict[str | float | int, Any]:
        return {
            'gameNumber': None,  # TODO
            'gameState': self.get_game_state(),
            'numJams': [len(period) for period in self._jams],
            'score': {
                'home': self.get_total_score('home'),
                'away': self.get_total_score('away')
            },
            'roster': {
                'home': None,  # TODO
                'away': None   # TODO
            },
        }

    def get_game_state(self) -> str:
        if self._intermission_clock.is_running():
            return 'intermission'
        elif self._jam_clock.is_running():
            return 'jam'
        elif self._lineup_clock.is_running():
            return 'lineup'
        elif self._timeout_clock.is_running():
            # TODO: check timeout type?
            return 'timeout'
        else:
            return 'stopped'

    def get_total_score(self, team: Literal['home', 'away']) -> int:
        total_score: int = 0
        for period in self._jams:
            for jam in period:
                total_score += jam.score[team].total_points()

        return total_score

    def get_current_period_index(self) -> int:
        return int(len(self._jams[1]) > 0)

    def get_jam(self, jam_id: tuple[int, int]) -> Jam:
        period_index, jam_index = jam_id
        return self._jams[period_index][jam_index]

    def push_jam(self, period: int) -> None:
        next_jam_number: int = len(self._jams[period])
        new_jam: Jam = Jam(self.id, (period, next_jam_number))
        self._jams[period].append(new_jam)
        self.watch(new_jam)
        self.notify()

    def pop_jam(self, period: int) -> Jam:
        popped_jam: Jam = self._jams[period].pop()
        self.un_watch(popped_jam)
        self.notify()
        return popped_jam

    def start_jam(self, timestamp: datetime) -> None:
        jam: Jam = self._jams[self.get_current_period_index()][-1]

        clocks: tuple[Clock, ...] = (
            self._intermission_clock, self._lineup_clock, self._timeout_clock)
        for clock in clocks:
            if clock.is_running():
                clock.pause(timestamp)

        jam.set_start(timestamp)
        self._jam_clock.start(timestamp)
        self.notify()

    def stop_jam(self, timestamp: datetime) -> None:
        current_period_index: int = self.get_current_period_index()
        jam: Jam = self._jams[current_period_index][-1]

        # Attempt the guess the call-off reason
        reason: str
        remaining_time: timedelta | None = self._jam_clock.get_remaining()
        if remaining_time is not None and remaining_time.total_seconds() <= 0:
            reason = 'time'
        elif ((jam.score.home.lead and not jam.score.home.lost)
              or (jam.score.away.lead and not jam.score.away.lost)):
            reason = 'called'
        else:
            reason = 'unknown'

        jam.set_stop(timestamp, reason)
        self._jam_clock.pause(timestamp)
        self._lineup_clock.reset()
        self._lineup_clock.start(timestamp)
        self.push_jam(current_period_index)
        self.notify()

    def get_clock(self, type: str) -> Clock:
        match type:
            case 'jam': return self._jam_clock
            case 'lineup': return self._lineup_clock
            case 'period': return self._period_clock
            case 'intermission': return self._intermission_clock
            case 'timeout': return self._timeout_clock
            case _: raise ValueError(f'Timer \'{type}\' does not exist')
