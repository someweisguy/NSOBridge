from datetime import datetime

from pydantic import Field, computed_field

from schemas.schemas import ServerSchema


class TripSchema(ServerSchema):
    timestamp: datetime
    passes: int


class StarPassSchema(ServerSchema):
    trip: TripSchema | None
    timestamp: datetime


class TeamJamSchema(ServerSchema):
    lead: datetime | None
    lost: bool
    trips: list[TripSchema] = Field(exclude=True)
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

    @computed_field
    @property
    def trip_passes(self) -> list[int]:
        return [trip.passes for trip in self.trips]


class BoutSchema(ServerSchema):
    id: int


class JamSchema(ServerSchema):
    parent: BoutSchema = Field(exclude=True, validation_alias='bout')
    
    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    period: int
    jam: int
    home: TeamJamSchema
    away: TeamJamSchema

    @computed_field
    @property
    def bout(self) -> int:
        return self.parent.id