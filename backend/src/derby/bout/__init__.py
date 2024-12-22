from __future__ import annotations
from datetime import datetime
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
                 '_official_reviews_remaining', '_timeouts', '_score_state')

    def __init__(self, id: UUID) -> None:
        super().__init__((id,))

        # Instantiate clocks
        self._period_clock: Clock = Clock(id, 'period')
        self._intermission_clock: Clock = Clock(id, 'intermission')
        self._lineup_clock: Clock = Clock(id, 'lineup')
        self._jam_clock: Clock = Clock(id, 'jam')
        self._timeout_clock: Clock = Clock(id, 'timeout')
        self._period_clock.set_alarm(seconds=30)
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
        self._score_state: Literal['pregame', 'live', 'halftime', 'unofficial',
                                   'final'] = 'pregame'

    def get(self) -> dict[str | float | int, Any]:
        return {
            'gameNumber': None,  # TODO
            'gameState': self.get_game_state(),
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
    def clock(self) -> ClockHelper:
        return ClockHelper(self)

    @property
    def jam(self) -> JamHelper:
        return JamHelper(self)

    @property
    def timeout(self) -> TimeoutHelper:
        return TimeoutHelper(self)

    def get_game_state(self) -> Literal['pregame', 'jam', 'lineup', 'timeout',
                                        'halftime', 'unofficial', 'final']:
        if not self._jam_clock.is_running() and [len(period) for period
                                                 in self._jams] == [1, 0]:
            return 'pregame'
        elif self._jam_clock.is_running():
            return 'jam'
        elif self._timeout_clock.is_running():
            return 'timeout'
        elif self._lineup_clock.is_running():
            return 'lineup'
        elif self._intermission_clock.is_running():
            return 'halftime'
        else:
            assert self._score_state != 'live'
            return self._score_state

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
        elif self.get_game_state() not in ['pregame', 'lineup', 'halftime']:
            raise RuntimeError('Intermission cannot be started right now')

        for clock in (self._period_clock, self._lineup_clock):
            if clock.is_running():
                clock.stop(timestamp)
        self._intermission_clock.start(timestamp)

        # TODO: determine if the game state is in pregame of halftime

        self.notify()

    def stop_intermission(self, timestamp: datetime) -> None:
        if not self.clock.intermission.is_running():
            raise RuntimeError('There is no Intermission running')

        self.clock.intermission.stop(timestamp)
        self.notify()

    def advance_game(self) -> None:
        if any(clock.is_running() for clock in (self._jam_clock,
                                                self._timeout_clock)):
            raise RuntimeError('The game can only advance during Lineup')
        elif self._score_state == 'final':
            raise RuntimeError('The game has already been finalized')
        if self.get_current_period_index() == 0:
            self.jam.push(1)
        elif self._score_state == 'live':
            self._score_state = 'unofficial'
        else:
            self._score_state = 'final'
        print('advancing game state')
        self.notify()
