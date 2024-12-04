from datetime import datetime
from derby.jam import Jam
from derby.clock import Clock
from typing import Any
from server import Queryable
from uuid import UUID


class Bout(Queryable[UUID]):
    def __init__(self, id: UUID) -> None:
        super().__init__(id)

        # Instantiate Timers
        self._period_clock: Clock = Clock(id, 'period')
        self._intermission_clock: Clock = Clock(id, 'intermission')
        self._lineup_clock: Clock = Clock(id, 'lineup')
        self._jam_clock: Clock = Clock(id, 'jam')
        self._timeout_clock: Clock = Clock(id, 'timeout')

        self._period_clock.set_alarm(minutes=30)
        self._lineup_clock.set_alarm(seconds=30)
        self._jam_clock.set_alarm(minutes=2)

        clocks: tuple[Clock, ...] = (self._period_clock,
                                     self._intermission_clock,
                                     self._lineup_clock, self._jam_clock,
                                     self._timeout_clock)
        for clock in clocks:
            self.watch(clock)

        self._jams: tuple[list[Jam], list[Jam]] = ([], [])
        self.push_jam(0)  # At least 1 Jam is required

    def get(self, now: datetime | None = None) -> dict[str | float | int, Any]:
        if now is None:
            now = datetime.now()
        return {
            'info': {
                'venue': None,
                'gameNumber': None,
                'date': None
            },  # TODO
            'roster': {
                'home': None,
                'away': None
            },  # TODO
            'clocks': {
                'intermission': self._intermission_clock.get(now),
                'period': self._period_clock.get(now),
                'lineup': self._lineup_clock.get(now),
                'jam': self._jam_clock.get(now),
                'timeout': self._timeout_clock.get(now)
            },  # TODO
            'timeouts': {
                'remaining': {
                    'home': {
                        'timeouts': 0,  # TODO
                        'officialReviews': 0  # TODO
                    },
                    'away': {
                        'timeouts': 0,  # TODO
                        'officialReviews': 0  # TODO
                    }
                },
                'ongoing': {
                    'isOfficialReview': False,  # TODO
                    'caller': None,  # TODO
                }
            },
            'jams': {
                'score': {
                    'home': 0,  # TODO
                    'away': 0   # TODO
                },
                'counts': [len(period) for period in self._jams],
            },
            'penalties': None  # TODO
        }

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

    def pop_jam(self, period: int) -> Jam:
        popped_jam: Jam = self._jams[period].pop()
        self.un_watch(popped_jam)
        self.notify()
        return popped_jam

    def start_jam(self, timestamp: datetime) -> None:
        current_period_index: int = self.get_current_period_index()
        self._jam_clock.start(timestamp)
        self._jams[current_period_index][-1].start(timestamp)

    def get_clock(self, type: str) -> Clock:
        match type:
            case 'jam': return self._jam_clock
            case 'lineup': return self._lineup_clock
            case 'period': return self._period_clock
            case 'intermission': return self._intermission_clock
            case 'timeout': return self._timeout_clock
            case _: raise ValueError(f'Timer \'{type}\' does not exist')
