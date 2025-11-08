from __future__ import annotations

from datetime import datetime, timedelta  # noqa: TC003

from pydantic import Field, computed_field
from schemas import ServerSchema


class ClockSchema(ServerSchema):
    start_timestamp: datetime | None
    elapsed: timedelta
    alarm: timedelta


class TimerSchema(ServerSchema):
    start_timestamp: datetime | None
    stop_timestamp: datetime | None


class TimeoutSchema(TimerSchema):
    team: TeamSchema | None = Field(exclude=True)
    is_review: bool
    jam: JamSchema = Field(exclude=True)

    @computed_field
    @property
    def team_id(self) -> int | None:
        return self.team.id if self.team is not None else None

    @computed_field
    @property
    def period(self) -> int:
        return self.jam.period

    @computed_field(alias='jam')
    @property
    def jam_num(self) -> int:
        return self.jam.num


class TeamJamSchema(ServerSchema):
    team: TeamSchema = Field(exclude=True)

    @computed_field
    @property
    def team_id(self) -> int:
        return self.team.id

    @computed_field
    @property
    def star_pass(self) -> bool:
        return False  # FIXME


class JamSchema(TimerSchema):
    period: int
    num: int
    team_jams: list[TeamJamSchema]


class RosterSchema(ServerSchema):
    id: int


class TeamSchema(ServerSchema):
    id: int
    roster: RosterSchema = Field(exclude=True)
    bout_score: int
    jam_score: int
    timeouts_remaining: int
    reviews_remaining: int
    score_offset: int

    @computed_field
    @property
    def roster_id(self) -> int:
        return self.roster.id


class BoutSchema(ServerSchema):
    id: int
    ruleset: str
    is_running: bool = Field(exclude=True)
    expected_start_timestamp: datetime | None
    is_final: bool
    clock: ClockSchema
    teams: list[TeamSchema]
    jams: list[JamSchema] = Field(exclude=True)
    timeouts: list[TimeoutSchema] = Field(exclude=True)

    @staticmethod
    def _get_counts(events: list[JamSchema] | list[TimeoutSchema]) -> list[int]:
        counts: list[int] = []
        for event in events:
            # A naive solution but it works because data is ordered
            if len(counts) <= event.period:
                counts.append(0)
            counts[-1] += 1
        return counts

    @computed_field
    @property
    def jam_counts(self) -> list[int]:
        return self._get_counts(self.jams)

    @computed_field
    @property
    def timeout_counts(self) -> list[int]:
        return self._get_counts(self.timeouts)

    @computed_field
    @property
    def active_jam(self) -> JamSchema | None:
        num_jams: int = len(self.jams)
        if num_jams == 0 or not self.is_running:
            return None

        if num_jams == 1:
            return self.jams[0]
        jam: JamSchema = self.jams[-1]
        if jam.start_timestamp is None and jam.period == self.jams[-2].period:
            # Only show the active Jam in the current Period
            jam = self.jams[-2]
        return jam

    @computed_field
    @property
    def active_timeout(self) -> TimeoutSchema | None:
        if len(self.timeouts) == 0 or not self.is_running:
            return None

        # Get the active Jam to see if the latest Timeout is considered active
        active_jam: JamSchema | None = self.active_jam
        if active_jam is None:
            return None  # This condition should never occur

        timeout: TimeoutSchema = self.timeouts[-1]
        if timeout.period != active_jam.period and timeout.jam.num != active_jam.num:
            return None

        return timeout


class BoutContextSchema(ServerSchema):
    jam_duration: timedelta
    lineup_duration: timedelta
    points_per_trip: int
    num_timeouts: int
    num_reviews: int
