from game.trip_events.schemas import TripEventSchema
from schemas import ServerSchema


class TeamJamSchema(ServerSchema):
    team_id: int
    events: list[TripEventSchema]
