from dataclasses import dataclass
from datetime import timedelta

from schemas import ServerSchema


@dataclass(frozen=True)
class RulesetContext(ServerSchema):
    name: str
    num_periods: int
    jam_duration: timedelta
    lineup_duration: timedelta
    points_per_trip: int
    num_timeouts: int
    num_reviews: int
