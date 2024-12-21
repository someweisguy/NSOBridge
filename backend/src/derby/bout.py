from datetime import datetime, timedelta
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
                 '_official_reviews_remaining', '_timeouts', '_is_final')

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
        self.push_jam(0)  # At least 1 Jam is required
        
        self._is_final: bool = False

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

    def get_game_state(self) -> str:
        if not self._jam_clock.is_running() and [len(period) for period in self._jams] == [1, 0]:
            return 'pregame'
        elif self._jam_clock.is_running():
            return 'jam'
        elif not self._timeout_clock.is_running():
            return 'lineup'
        elif self._intermission_clock.is_running():
            return 'halftime'
        elif not self._is_final:
            return 'unofficial'
        else:
            return 'final'

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
        if self.get_game_state() == 'jam':
            raise RuntimeError('A Jam is already running')
        elif self.timeout_is_running():
            raise RuntimeError('A Jam cannot start when a Timeout is ongoing')
        jam: Jam = self._jams[self.get_current_period_index()][-1]

        for clock in (self._intermission_clock, self._lineup_clock,
                      self._timeout_clock):
            if clock.is_running():
                clock.stop(timestamp)
        
        if not self._period_clock.is_running():
            self._period_clock.start(timestamp)

        jam.set_start(timestamp)
        self._jam_clock.reset()
        self._jam_clock.start(timestamp)
        self.notify()

    def stop_jam(self, timestamp: datetime) -> None:
        if self.get_game_state() != 'jam':
            raise RuntimeError('There is no Jam running')
        current_period_index: int = self.get_current_period_index()
        jam: Jam = self._jams[current_period_index][-1]

        # Attempt the guess the call-off reason
        reason: Jam.stop_reasons
        remaining_time: timedelta | None = self._jam_clock.get_remaining()
        if remaining_time is not None and remaining_time.total_seconds() <= 0:
            reason = 'time'
        elif ((jam.score.home.lead and not jam.score.home.lost)
              or (jam.score.away.lead and not jam.score.away.lost)):
            reason = 'called'
        else:
            reason = 'other'

        jam.set_stop(timestamp)
        jam.stop_reason = reason
        self._jam_clock.stop(timestamp)
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
            
    def timeout_is_running(self) -> bool:
        return len(self._timeouts) > 0 and self._timeouts[-1].is_running()

    def call_timeout(self, timestamp: datetime | None = None) -> None:
        if self.timeout_is_running():
            raise RuntimeError('A Timeout is already running')
        if self.get_game_state() != 'lineup':
            raise RuntimeError('A Timeout cannot be called right now')
        if timestamp is None:
            timestamp = datetime.now()

        # Assume the timeout is not an official review by default
        new_timeout: Timeout = Timeout(self.id, len(self._timeouts))

        # Set the period clock at which this timeout was called
        period_clock: timedelta | None = self._period_clock.get_remaining(
            timestamp)
        if period_clock is not None:
            new_timeout.period_clock = period_clock

        # Set the Jam number at which this timeout was called
        current_period_index: int = self.get_current_period_index()
        new_timeout.jam_id = (current_period_index,
                              len(self._jams[current_period_index]))
        # FIXME: get the current ACTIVE jam number

        self._timeouts.append(new_timeout)
        self.watch(new_timeout)
        if self._period_clock.is_running():
            self._period_clock.stop(timestamp)
        self._timeout_clock.start(timestamp)
        self.notify()

    def set_timeout_caller(self, caller: Literal['home', 'away', 'official']) -> None:
        if not self.timeout_is_running():
            raise RuntimeError('There is no active Timeout running')
        if caller not in ('home', 'away', 'official'):
            raise ValueError('Caller is invalid')

        timeout: Timeout = self._timeouts[-1]

        if timeout.caller == caller:
            return

        team_attribute: TeamAttribute[int] = (self._official_reviews_remaining
                                              if timeout.is_official_review
                                              else self._timeouts_remaining)
        if timeout.caller != 'official':
            team_attribute[timeout.caller] += 1
        if caller != 'official':
            team_attribute[caller] -= 1

        self._timeouts[-1].caller = caller
        self.notify()

    def set_official_review(self, is_official_review: bool) -> None:
        if not self.timeout_is_running():
            raise RuntimeError('There is no active Timeout running')
        timeout: Timeout = self._timeouts[-1]
        if timeout.caller == 'official':
            raise RuntimeError('Officials cannot call an Official Review')

        notify: bool = timeout.is_official_review != is_official_review
        self._timeouts[-1].is_official_review = is_official_review
        if notify:
            self.notify()

    def set_official_review_is_retained(self, is_retained: bool) -> None:
        if not self.timeout_is_running():
            raise RuntimeError('There is no active Timeout running')
        timeout: Timeout = self._timeouts[-1]
        notify: bool = timeout.is_retained != is_retained
        timeout.is_retained = is_retained
        if notify:
            self.notify()

    def set_official_review_detail(self, detail: str) -> None:
        if not self.timeout_is_running():
            raise RuntimeError('There is no active Timeout running')
        timeout: Timeout = self._timeouts[-1]
        notify: bool = timeout.detail != detail
        timeout.detail = detail
        if notify:
            self.notify()

    def set_official_review_result(self, result: str) -> None:
        if not self.timeout_is_running():
            raise RuntimeError('There is no active Timeout running')
        timeout: Timeout = self._timeouts[-1]
        notify: bool = timeout.result != result
        timeout.result = result
        if notify:
            self.notify()

    def end_timeout(self, timestamp: datetime | None = None) -> None:
        if not self.timeout_is_running():
            raise RuntimeError('There is no active Timeout running')
        if timestamp is None:
            timestamp = datetime.now()

        timeout: Timeout = self._timeouts[-1]

        # Replenish the Official Review if it was retained
        if timeout.is_official_review and timeout.is_retained:
            self._official_reviews_remaining[timeout.caller] += 1

        elapsed: timedelta = self._timeout_clock.get_elapsed(timestamp)
        self._timeout_clock.stop(timestamp)
        self._timeout_clock.reset()
        timeout.duration = elapsed
        self.notify()

    def start_intermission(self, timestamp: datetime) -> None:
        if self.get_game_state() in ['intermission', 'timeout', 'jam']:
            raise RuntimeError('Intermission cannot be started right now')
        
        if self._period_clock.is_running():
            self._period_clock.stop(timestamp)
        self._intermission_clock.start(timestamp)
        self.notify()
    
    def stop_intermission(self, timestamp: datetime) -> None:
        if self.get_game_state() != 'intermission':
            raise RuntimeError('There is no Intermission running')
        
        self._intermission_clock.stop(timestamp)
        self.notify()
        
    def advance_game(self) -> None:
        ...