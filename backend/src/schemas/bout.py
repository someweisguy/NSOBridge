from pydantic import Field, computed_field

from schemas.jam import JamSchema
from schemas.schemas import ServerSchema


class TimeoutSchema(ServerSchema):
    pass


class BoutSchema(ServerSchema):
    ruleset: str
    jams: list[JamSchema] = Field(exclude=True)
    timeouts: list[TimeoutSchema] = Field(exclude=True)

    @computed_field
    @property
    def active_jam(self) -> JamSchema | None:
        if len(self.jams) == 0:
            return None
        return self.jams[-1]

    @computed_field
    @property
    def latest_timeout(self) -> TimeoutSchema | None:
        if len(self.timeouts) == 0:
            return None
        return self.timeouts[-1]

    @computed_field
    @property
    def num_jams(self) -> int:
        return len(self.jams)
