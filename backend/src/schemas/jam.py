from datetime import datetime

from pydantic import Field

from schemas.schemas import ServerSchema


class TripSchema(ServerSchema):
    timestamp: datetime
    passes: int


class TeamJamSchema(ServerSchema):
    lead: datetime | None
    lost: bool
    trips: list[TripSchema]


class JamSchema(ServerSchema):
    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    period: int
    jam: int
    home: TeamJamSchema | None = Field(alias='_home')
    away: TeamJamSchema | None = Field(alias='_away')
