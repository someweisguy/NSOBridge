from pydantic import Field, computed_field

from schemas.jam import JamSchema
from schemas.schemas import ServerSchema
from schemas.team import TeamSchema
from schemas.time import ClockSchema


class TimeoutSchema(ServerSchema):
    pass


class BoutSchema(ServerSchema):
    ruleset: str
    clock: ClockSchema
    teams: list[TeamSchema]
    jams: list[JamSchema] = Field(exclude=True)
    timeouts: list[TimeoutSchema] = Field(exclude=True)

    @computed_field
    @property
    def num_jams(self) -> int:
        return len(self.jams)

    @computed_field
    @property
    def current_jam(self) -> JamSchema | None:
        num_jams: int = self.num_jams
        if num_jams == 0:
            return None
        jam: JamSchema = self.jams[-1]
        if jam.start_timestamp is None:
            if num_jams == 1:
                return None
            jam = self.jams[-2]
        return jam

    # @computed_field
    # @property
    # def current_timeout(self) -> TimeoutSchema | None:
    #     if len(self.timeouts) == 0:
    #         return None
    #     return self.timeouts[-1]