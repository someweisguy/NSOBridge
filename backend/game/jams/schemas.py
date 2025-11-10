from datetime import datetime

from game.team_jams.schemas import TeamJamSchema
from schemas import ServerSchema


class JamSchema(ServerSchema):
    id: int
    bout_id: int
    period: int
    num: int

    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    stop_reason: str | None

    team_jams: list[TeamJamSchema]
