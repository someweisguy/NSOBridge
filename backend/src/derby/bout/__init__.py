from __future__ import annotations
from datetime import datetime
from operator import is_
from derby.bout.clock_helper import ClockHelper
from derby.bout.jam_helper import JamHelper
from derby.bout.timeout_helper import TimeoutHelper
from derby.attributes import TeamAttribute
from derby.clock import Clock
from derby.jam import Jam
from derby.timeout import Timeout
from server import Queryable
from typing import Any, Literal
from uuid import UUID


class Bout(Queryable[UUID]):
    __slots__ = ('_period_clock', '_intermission_clock', '_lineup_clock',
                 '_jam_clock', '_timeout_clock', '_jams', '_timeouts_remaining',
                 '_official_reviews_remaining', '_timeouts', '_score_state',
                 '_is_overtime')

    def __init__(self, id: UUID) -> None:
        super().__init__((id,))

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
        for clock in (self._period_clock, self._intermission_clock,
                      self._lineup_clock, self._jam_clock, self._timeout_clock):
            self.watch(clock)

        # Instantiate Timeouts and Official Reviews
        self._timeouts_remaining: TeamAttribute[int] = TeamAttribute(3, 3)
        self._official_reviews_remaining: TeamAttribute[int] = TeamAttribute(
            1, 1)
        self._timeouts: list[Timeout] = []

        # Instantiate periods
        self._jams: tuple[list[Jam], list[Jam]] = ([], [])
        self.jam.push(0)  # At least 1 Jam is required

        # Set the initial score state
        self._score_state: Literal['live', 'unofficial', 'final'] = 'live'
        self._is_overtime: bool = False

    def get(self) -> dict[str | float | int, Any]:
        return {
            'gameNumber': None,  # TODO
            'scoreState': self.score_state,
            'playState': self.get_play_state(),
            'numJams': [len(period) for period in self._jams],
            'numTimeouts': len(self._timeouts),
            'timeoutsRemaining': {
                'home': self._timeouts_remaining.home,
                'away': self._timeouts_remaining.away
            },
            'officialReviewsRemaining': {
                'home': self._official_reviews_remaining.home,
                'away': self._official_reviews_remaining.away
            },
            'score': {
                'home': self.get_total_score('home'),
                'away': self.get_total_score('away')
            },
            'roster': {
                'home': None,  # TODO
                'away': None   # TODO
            },
        }

    @property
    def score_state(self) -> Literal['live', 'unofficial', 'final']:
        return self._score_state

    @property
    def clock(self) -> ClockHelper:
        return ClockHelper(self)

    @property
    def jam(self) -> JamHelper:
        return JamHelper(self)

    @property
    def timeout(self) -> TimeoutHelper:
        return TimeoutHelper(self)

    def get_play_state(self) -> Literal['stopped', 'jam', 'lineup', 'timeout']:
        if self.clock.jam.is_running():
            return 'jam'
        elif self.clock.timeout.is_running():
            return 'timeout'
        elif self.clock.lineup.is_running():
            return 'lineup'
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

    def start_intermission(self, timestamp: datetime) -> None:
        if self.clock.intermission.is_running():
            raise RuntimeError('Intermission is already running')
        elif self.get_play_state() != 'stopped':
            raise RuntimeError(
                'The Intermission Clock cannot be started right now')

        self.clock.intermission.start(timestamp)
        self.notify()

    def stop_intermission(self, timestamp: datetime) -> None:
        if not self.clock.intermission.is_running():
            raise RuntimeError('There is no Intermission running')

        self.clock.intermission.stop(timestamp)
        self.notify()

    def advance_game(self) -> None:
        if self.get_play_state() not in ('stopped', 'lineup'):
            raise RuntimeError('The Bout cannot be advanced right now')

        # Stop and reset all clocks
        for clock in (self.clock.period, self.clock.lineup):
            if clock.is_running():
                clock.stop(datetime.now())
            clock.reset()
        self.clock.jam.reset()  # Jam clock is not running

        # Advance the game state
        if self.score_state == 'live':
            # Purge un-started Jams
            period: list[Jam] = self._jams[self.get_current_period_index()]
            if not period[-1].has_started():
                period.pop()

            # Advance the game state
            if self.get_current_period_index() == 0:
                self.jam.push(1)
            else:
                self._score_state = 'unofficial'
        elif self.score_state == 'unofficial':
            self._score_state = 'final'
        else:
            raise RuntimeError('This Bout has already ended')

        self.notify()
