from datetime import datetime

from pydantic import Field, computed_field

from .schemas import ServerSchema


class TripSchema(ServerSchema):
    timestamp: datetime
    passes: int


class StarPassSchema(ServerSchema):
    trip: TripSchema | None
    timestamp: datetime


class TeamJamSchema(ServerSchema):
    lead: datetime | None
    lost: bool
    trips: list[TripSchema]
    star_passes: list[StarPassSchema] = Field(exclude=True)

    @computed_field
    @property
    def star_pass(self) -> int | None:
        if len(self.star_passes) == 0:
            return None
        star_pass: StarPassSchema = self.star_passes[0]
        if star_pass.trip is None:
            return 0
        return self.trips.index(star_pass.trip)


class JamSchema(ServerSchema):
    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    period: int
    jam: int
    home: TeamJamSchema | None = Field(alias='_home')
    away: TeamJamSchema | None = Field(alias='_away')
