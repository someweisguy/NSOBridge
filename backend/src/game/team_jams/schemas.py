"""Pydantic TeamJam schemas."""

from core.app import ServerSchema
from game.trip_events.schemas import TripEventSchema


class TeamJamSchema(ServerSchema):
    """Represent a TeamJam as a JSON schema."""

    team_num: int
    events: list[TripEventSchema]
