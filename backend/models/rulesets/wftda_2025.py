from __future__ import annotations

from datetime import timedelta
from functools import cached_property
from typing import TYPE_CHECKING, Final

from ..bout import BoutContext, GenericBoutModel

if TYPE_CHECKING:
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
