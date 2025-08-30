from __future__ import annotations

from datetime import timedelta
from functools import cached_property
from typing import TYPE_CHECKING, Final

from models.bout import NUM_PERIODS, BoutContext, GenericBoutModel
from models.jam import JamModel, StarPassModel, TeamName, TripModel
from models.time import TimeoutModel

if TYPE_CHECKING:
    from datetime import datetime

    from models.series import SeriesModel
    from models.team import TeamModel

RULESET: Final[str] = 'WFTDA 2025'


class BoutModel(GenericBoutModel):
    __mapper_args__ = {
        'polymorphic_identity': RULESET,
    }

    def __init__(self, series: SeriesModel, home: TeamModel, away: TeamModel) -> None:
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

    def setup_track(self, timestamp: datetime) -> None:
        if self.get_state() != 'stopped':
            raise RuntimeError('The Bout cannot be started now')

        self._prepare_next_period(self.teams[0], self.teams[1])
        self.expected_start_timestamp = None
        self.is_running = True
        if self.get_period() < NUM_PERIODS:
            self.clock.reset()

    def clear_track(self, timestamp: datetime) -> None:
        if self.is_running and self.get_state() != 'lineup':
            raise RuntimeError('The Bout cannot be stopped now')

        if not self.is_running or self.get_period() >= NUM_PERIODS:
            # TODO: Figure out a method to forfeit a Bout
            self.is_final = True

        # End the Period
        if self.clock.is_running():
            self.clock.stop(timestamp)
        self.is_running = False

    def start_jam(self, timestamp: datetime) -> JamModel:
        if not self.is_running:
            self.setup_track(timestamp)  # Handle immediate game start
        if self.get_state() != 'lineup':
            raise RuntimeError('The Jam cannot be started now')

        self.jams[-1].start(timestamp)
        if not self.clock.is_running() and self.get_period() < NUM_PERIODS:
            self.clock.start(timestamp)
        return self.jams[-1]

    def stop_jam(self, timestamp: datetime) -> None:
        if self.get_state() != 'jam':
            raise RuntimeError('There is no active Jam to stop')

        self.jams[-1].stop(timestamp)
        self._prepare_next_jam(self.teams[0], self.teams[1])

    def add_trip(self, team: TeamName, passes: int, timestamp: datetime) -> None:
        if self.get_state() != 'jam':
            raise RuntimeError('There is no active Jam to which to add a Trip')
        if 0 > passes > self.context.points_per_trip:
            raise ValueError(f"""Number of passes must be {self.context.points_per_trip}
                             or less ({passes=})""")

        jam: JamModel = self.jams[-1]
        if passes > 0 and not jam.lead_is_declared():
            self.set_lead(team, True, timestamp)  # Set Lead on first legal Trip
        if len(jam[team].trips) == 0:
            passes = 0  # The initial Trip should always be set to 0 passes
        jam[team].trips.append(TripModel(timestamp=timestamp, passes=passes))

    def set_lead(self, team: TeamName, lead: bool, timestamp: datetime) -> None:
        if self.get_state() != 'jam':
            raise RuntimeError('There is no active Jam to which to set Lead')

        jam: JamModel = self.jams[-1]
        if lead and jam.lead_is_declared():
            raise RuntimeError('A Lead Jammer has already been declared in this Jam')
        jam[team].lead = timestamp if lead else None

    def set_lost(self, team: TeamName, lost: bool) -> None:
        if self.get_state() != 'jam':
            raise RuntimeError('There is no active Jam to which to set Lost')

        jam: JamModel = self.jams[-1]
        jam[team].lost = lost

    def set_star_pass(self, team: TeamName, timestamp: datetime) -> None:
        if self.get_state() != 'jam':
            raise RuntimeError('There is no active Jam to which to add a Star Pass')

        jam: JamModel = self.jams[-1]
        star_pass: StarPassModel = StarPassModel(
            timestamp=timestamp,
            trip=jam[team].trips[-1] if len(jam[team].trips) > 0 else None,
        )
        jam[team].star_passes.append(star_pass)

    def start_timeout(self, timestamp: datetime) -> TimeoutModel:
        if self.get_state() != 'lineup':
            raise RuntimeError('A Timeout cannot be started now')

        # Timeouts are recorded on the latest running Jam

        latest: JamModel = self.jams[-2] if len(self.jams) > 1 else self.jams[-1]
        timeout: TimeoutModel = TimeoutModel(
            period=latest.period,
            jam=latest.jam,
            start_timestamp=timestamp,
            clock_elapsed=self.clock.get_duration(timestamp),
        )
        self.timeouts.append(timeout)
        return timeout

    def stop_timeout(self, timestamp: datetime) -> None:
        if self.get_state() != 'timeout':
            raise RuntimeError('There is no active Timeout to stop')
        timeout: TimeoutModel = self.timeouts[-1]
        if timeout.team is None and timeout.is_review:
            raise RuntimeError('Officials cannot call an Official Review')

        timeout.stop(timestamp)

        # Decrement the Timeout or Official Review if it was not retained
        if timeout.team is not None and not timeout.retained:
            # Only decrement if the value is greater than zero
            if timeout.is_review and timeout.team.reviews_remaining > 0:
                timeout.team.reviews_remaining -= 1
            elif timeout.team.timeouts_remaining > 0:
                timeout.team.timeouts_remaining -= 1
