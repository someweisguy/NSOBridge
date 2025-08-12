from datetime import datetime, timedelta
from typing import Literal

from pydantic import Field, computed_field

from schemas.schemas import ServerSchema


class ClockSchema(ServerSchema):
    start_timestamp: datetime | None
    elapsed: timedelta
    alarm: timedelta


class TimerSchema(ServerSchema):
    start_timestamp: datetime | None
    stop_timestamp: datetime | None


class TimeoutSchema(TimerSchema):
    period: int
    jam: int


class JamSchema(TimerSchema):
    period: int
    jam: int


class TeamSchema(ServerSchema):
    # TODO: name: str
    bout_score: int
    jam_score: int
    timeouts_remaining: int
    reviews_remaining: int
    score_offset: int


class BoutSchema(ServerSchema):
    ruleset: str
    clock: ClockSchema
    teams: list[TeamSchema]
    jams: list[JamSchema] = Field(exclude=True)
    timeouts: list[TimeoutSchema] = Field(exclude=True)
    intermission_timer: TimerSchema | None = Field(
        validation_alias='timer', exclude=True
    )

    @computed_field
    @property
    def jam_counts(self) -> list[int]:
        counts: list[int] = []
        for jam in self.jams:
            # A naive solution but it works because data is ordered
            if len(counts) <= jam.period:
                counts.append(0)
            counts[-1] += 1
        return counts

    @computed_field
    @property
    def num_timeouts(self) -> int:
        return len(self.timeouts)

    @computed_field
    @property
    def active_jam(self) -> JamSchema | None:
        num_jams: int = len(self.jams)
        if num_jams == 0:
            return None
        if num_jams == 1:
            return self.jams[0]
        else:
            jam: JamSchema = self.jams[-1]
            if jam.start_timestamp is None:
                jam = self.jams[-2]
            return jam

    @computed_field
    @property
    def timer_type(self) -> Literal['timeout', 'intermission'] | None:
        timer: TimeoutSchema | TimerSchema | None = self.timer
        if timer is None:
            return None
        elif isinstance(timer, TimeoutSchema):
            return 'timeout'
        else:
            return 'intermission'

    @computed_field
    @property
    def timer(self) -> TimeoutSchema | TimerSchema | None:
        if self.intermission_timer is not None:
            return self.intermission_timer
        if len(self.timeouts) == 0:
            return None

        timeout: TimeoutSchema = self.timeouts[-1]
        active_jam: JamSchema | None = self.active_jam
        if active_jam is None:
            # This situation should never occur
            return timeout
        if timeout.period < active_jam.period or timeout.jam < active_jam.jam:
            return None

        return timeout
