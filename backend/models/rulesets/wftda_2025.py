from __future__ import annotations

from datetime import datetime, timedelta
from functools import cached_property
from typing import TYPE_CHECKING, Final, override

from models.jam import JamModel
from sqlalchemy import inspect

from ..bout import BoutContext, GenericBoutModel

if TYPE_CHECKING:
    from ..series import SeriesModel
    from ..team import RosterModel

RULESET: Final[str] = 'WFTDA 2025'
NUM_PERIODS: Final[int] = 2


class BoutModel(GenericBoutModel):
    __mapper_args__: dict[str, str | bool] = {
        'polymorphic_identity': RULESET,
    }

    # TODO: Figure out a method to forfeit a Bout

    def __init__(
        self, series: SeriesModel, home: RosterModel, away: RosterModel
    ) -> None:
        super().__init__(series, RULESET, *(home, away))
        self.clock.alarm = timedelta(minutes=30)
        for team in self.teams:
            team.timeouts_remaining = self.context.num_timeouts
            team.reviews_remaining = self.context.num_reviews

    @cached_property
    def context(self) -> BoutContext:
        return BoutContext(
            jam_duration=timedelta(minutes=2),
            lineup_duration=timedelta(seconds=30),
            points_per_trip=4,
            num_timeouts=3,
            num_reviews=1,
        )

    @override
    def begin_period(self, timestamp: datetime) -> None:
        if self.get_state() != 'stopped':
            raise RuntimeError('The Bout cannot be started now')
        if len(self.jams) > 0 and self.jams[-1].period == NUM_PERIODS:
            raise RuntimeError('')  # TODO

        # Get the Period number and Jam number of the next Jam
        period_num: int = 0
        jam_num: int = 0
        if len(self.jams) > 0:
            latest: JamModel = self.jams[-1]
            period_num = latest.period + 1

        # Instantiate the Jam and add it to this Bout
        home, away = self.teams[:2]
        jam: JamModel = JamModel(period_num, jam_num, home, away)
        self.jams.append(jam)

        # If this Period is not in overtime reset the Clock
        if period_num < NUM_PERIODS:
            self.clock.reset()

        self.is_running = True

    @override
    def end_period(self, timestamp: datetime) -> None:
        if self.is_running and self.get_state() != 'lineup':
            raise RuntimeError('the period can only be ended during lineup')
        if not self.is_running and self.jams[-1].period < NUM_PERIODS:
            raise RuntimeError('there is no running period to end')

        # Calling end_period() twice in a row after Period 2 ends the Bout
        if not self.is_running:
            self.is_final = True

        if self.clock.is_running():
            self.clock.stop(timestamp)

        # Cull the unused Jam that is at the end of the Jam queue
        if len(self.jams) > 0:
            final_jam: JamModel = self.jams[-1]
            if final_jam.start_timestamp is None:
                self.jams.remove(final_jam)

        self.is_running = False

    @override
    def start_jam(self, timestamp: datetime) -> None:
        if not self.is_running:
            # Allow user to skip the initial call to begin_period()
            self.begin_period(timestamp)
        if self.get_state == 'timeout':
            # Allow the user to end a Timeout and immediately start the next Jam
            pass  # TODO: Stop the timeout to put the Bout into Lineup

        if self.get_state() != 'lineup':
            raise RuntimeError('a jam may only be started from lineup')

        # Start the Clock if not in overtime
        if self.jams[-1].period < NUM_PERIODS and not self.clock.is_running():
            self.clock.start(timestamp)

        self.jams[-1].start(timestamp)

    @override
    def stop_jam(self, timestamp: datetime) -> None:
        if self.get_state() != 'jam':
            raise RuntimeError('there is no running jam to stop')

        self.jams[-1].stop(timestamp)

        # Push a new Jam to the queue to allow users to immediately fill out the Lineup
        period_num: int = self.jams[-1].period
        jam_num: int = self.jams[-1].jam + 1
        home, away = self.teams[:2]
        self.jams.append(JamModel(period_num, jam_num, home, away))

    @override
    def start_timeout(self, timestamp: datetime) -> None:
        pass  # FIXME
        # if self.bout.get_state() != 'lineup':
        #     raise RuntimeError('Cannot call a Timeout now')

        # # Instantiate the Timeout
        # clock_elapsed: timedelta = self.bout.clock.get_duration(self.timestamp)
        # timeout: TimeoutModel = TimeoutModel(clock_elapsed)
        # commands.append(Bout.AddTimeout(self.bout, timeout))

        # # Start the Timeout
        # commands.append(Timeout.Start(timeout, self.timestamp))

        # return tuple(commands)

    @override
    def stop_timeout(self, timestamp: datetime) -> None:
        pass  # FIXME
        # if self.bout.get_state() != 'timeout':
        #     raise RuntimeError('Cannot stop a Timeout if none is running')

        # # Validate the Timeout's state
        # timeout: TimeoutModel = self.bout.timeouts[-1]
        # if timeout.is_review and timeout.team is None:
        #     raise ValueError('Officials cannot call an Official Review')

        # # Stop the Timeout
        # commands.append(Timeout.Stop(timeout, self.timestamp))

        # # Subtract remaining Timeouts as appropriate
        # if timeout.team is not None:
        #     if timeout.is_review and not timeout.retained:
        #         reviews: int = timeout.team.reviews_remaining - 1
        #         commands.append(Team.SetReviewsRemaining(timeout.team, reviews))
        #     elif not timeout.is_review:
        #         timeouts: int = timeout.team.timeouts_remaining - 1
        #         commands.append(Team.SetTimeoutsRemaining(timeout.team, timeouts))

        # return tuple(commands)
