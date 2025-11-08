from datetime import datetime

from schemas import ServerSchema


class TripEventSchema(ServerSchema):
    id: int
    timestamp: datetime
    lead: bool
    lost: bool
    passes: int | None
    star_pass: bool


class TeamJamSchema(ServerSchema):
    id: int
    team_id: int
    events: list[TripEventSchema]


class JamSchema(ServerSchema):
    id: int
    bout_id: int
    period: int
    num: int

    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    stop_reason: str | None

    team_jams: list[TeamJamSchema]
