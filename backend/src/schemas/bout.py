from datetime import datetime
from typing import Literal

from pydantic import Field, computed_field

from schemas.schemas import ServerSchema
from schemas.team import TeamSchema
from schemas.time import ClockSchema


class TimeoutSchema(ServerSchema):
    period: int
    jam: int
    start_timestamp: datetime
    stop_timestamp: datetime | None


class JamSchema(ServerSchema):
    period: int
    jam: int
    start_timestamp: datetime | None
    stop_timestamp: datetime | None


class BoutSchema(ServerSchema):
    ruleset: str
    clock: ClockSchema
    teams: list[TeamSchema]
    jams: list[JamSchema] = Field(exclude=True)
    timeouts: list[TimeoutSchema] = Field(exclude=True)

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
    def timer_type(self) -> Literal['jam', 'timeout'] | None:
        timer: JamSchema | TimeoutSchema | None = self.timer
        if isinstance(timer, JamSchema):
            return 'jam'
        elif isinstance(timer, TimeoutSchema):
            return 'timeout'
        else:
            return None

    @computed_field
    @property
    def timer(self) -> JamSchema | TimeoutSchema | None:
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

        assert active_jam.start_timestamp is not None
        return (
            active_jam
            if active_jam.start_timestamp > previous_timeout.start_timestamp
            else previous_timeout
        )
