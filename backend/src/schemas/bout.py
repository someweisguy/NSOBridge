from datetime import datetime

from pydantic import Field, computed_field

from schemas.schemas import CacheableSchema, ServerSchema
from schemas.team import TeamSchema
from schemas.time import ClockSchema


class TimeoutSchema(ServerSchema):
    pass


class JamSchema(ServerSchema):
    period: int
    jam: int
    start_timestamp: datetime | None
    stop_timestamp: datetime | None


class BoutSchema(CacheableSchema):
    ruleset: str
    clock: ClockSchema
    teams: list[TeamSchema]
    jams: list[JamSchema] = Field(exclude=True)
    timeouts: list[TimeoutSchema] = Field(exclude=True)

    @computed_field
    @property
    def num_jams(self) -> list[int]:
        num_jams: list[int] = []
        for jam in self.jams:
            # A naive solution but it works because data is ordered
            if len(num_jams) <= jam.period:
                num_jams.append(0)
            num_jams[-1] += 1
        return num_jams

    @computed_field
    @property
    def current_jam(self) -> JamSchema | None:
        num_jams: list[int] = self.num_jams
        if len(num_jams) == 0:
            return None
        jam: JamSchema = self.jams[-1]
        if jam.start_timestamp is None:
            if jam.jam == 0:
                return None
            jam = self.jams[-2]
        return jam

    # @computed_field
    # @property
    # def current_timeout(self) -> TimeoutSchema | None:
    #     if len(self.timeouts) == 0:
    #         return None
    #     return self.timeouts[-1]
