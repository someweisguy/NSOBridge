from datetime import datetime
from typing import Literal

from pydantic import Field, computed_field

from schemas.schemas import ServerSchema
from schemas.team import TeamSchema
from schemas.time import ClockSchema


class TimerSchema(ServerSchema):
    start_timestamp: datetime | None
    stop_timestamp: datetime | None


class TimeoutSchema(TimerSchema):
    pass


class JamSchema(TimerSchema):
    period: int = Field(exclude=True)
    jam: int = Field(exclude=True)


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
    def timer_type(self) -> Literal['jam', 'timeout', 'intermission'] | None:
        timer: JamSchema | TimeoutSchema | TimerSchema | None = self.timer
        if timer is None:
            return None
        elif isinstance(timer, TimeoutSchema):
            return 'timeout'
        elif isinstance(timer, JamSchema):
            return 'jam'
        else:
            return 'intermission'

    @computed_field
    @property
    def timer(self) -> JamSchema | TimeoutSchema | TimerSchema | None:
        if self.intermission_timer is not None:
            return self.intermission_timer

        active_jam: JamSchema | None = next(
            (jam for jam in self.jams if jam.start_timestamp is not None), None
        )
        previous_timeout: TimeoutSchema | None = (
            self.timeouts[-1] if len(self.timeouts) > 0 else None
        )

        # Guard against one or the other being None
        if active_jam is None:
            return previous_timeout
        elif previous_timeout is None:
            return active_jam

        assert (
            active_jam.start_timestamp is not None
            and previous_timeout.start_timestamp is not None
        )
        return (
            active_jam
            if active_jam.start_timestamp > previous_timeout.start_timestamp
            else previous_timeout
        )
