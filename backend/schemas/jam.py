from datetime import datetime

from core import ServerSchema
from pydantic import Field, computed_field


class TripEventSchema(ServerSchema):
    timestamp: datetime
    lead: bool
    lost: bool
    passes: int | None
    star_pass: bool


class TeamJamSchema(ServerSchema):
    events: list[TripEventSchema] = Field(exclude=True)

    @computed_field
    @property
    def lead(self) -> int | None:
        for event in self.events:
            if event.lead:
                return True
        return False

    @computed_field
    @property
    def lost(self) -> bool:
        for event in self.events:
            if event.lost:
                return True
        return False

    @computed_field
    @property
    def star_pass(self) -> int | None:
        trip_index: int = 0
        for event in self.events:
            if event.passes is not None:
                trip_index += 1
            if event.star_pass:
                return trip_index
        return None

    @computed_field
    @property
    def passes(self) -> list[int]:
        return [trip.passes for trip in self.events if trip.passes is not None]


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
