from __future__ import annotations

from datetime import timedelta
from functools import cached_property
from typing import TYPE_CHECKING, Final

from core.fastapi import RulesError

from ..bout import BoutContext, GenericBoutModel
from ..jam import JamModel, StarPassModel, TeamName, TripModel

if TYPE_CHECKING:
    from datetime import datetime

    from ..series import SeriesModel
    from ..team import RosterModel

RULESET: Final[str] = 'WFTDA 2025'


class BoutModel(GenericBoutModel):
    __mapper_args__: dict[str, str | bool] = {
        'polymorphic_identity': RULESET,
    }

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

    def add_trip(self, team: TeamName, passes: int, timestamp: datetime) -> None:
        if self.get_state() != 'jam':
            raise RuntimeError('There is no active Jam to which to add a Trip')
        if 0 > passes > self.context.points_per_trip:
            raise RulesError(f"""Number of passes must be {self.context.points_per_trip}
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
            raise RulesError('A Lead Jammer has already been declared in this Jam')
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
