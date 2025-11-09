from __future__ import annotations

from datetime import datetime, timedelta  # noqa: TC003
from typing import Literal  # noqa: TC003

from game.clocks.schemas import ClockSchema  # noqa: TC002
from game.jams.schemas import JamSchema  # noqa: TC002
from game.timeouts.schemas import TimeoutSchema  # noqa: TC002
from pydantic import Field, computed_field
from schemas import ServerSchema


class TeamSchema(ServerSchema):
    id: int
    roster_id: int
    bout_score: int
    jam_score: int
    timeouts_remaining: int
    reviews_remaining: int
    score_offset: int


class BoutSchema(ServerSchema):
    id: int
    ruleset: str
    clock: ClockSchema
    is_running: bool
    expected_start_timestamp: datetime | None
    is_final: bool
    state: Literal['final', 'jam', 'lineup', 'stopped', 'timeout']
    teams: list[TeamSchema]
    jams: list[JamSchema] = Field(exclude=True)
    timeouts: list[TimeoutSchema] = Field(exclude=True)

    @computed_field
    @property
    def jam_counts(self) -> tuple[int, int, int]:
        jam_counts: list[int] = [0, 0, 0]
        for jam in self.jams:
            jam_counts[jam.period] += 1
        return jam_counts[0], jam_counts[1], jam_counts[2]

    @computed_field
    @property
    def num_timeouts(self) -> int:
        return len(self.timeouts)


class BoutContextSchema(ServerSchema):
    jam_duration: timedelta
    lineup_duration: timedelta
    points_per_trip: int
    num_timeouts: int
    num_reviews: int
