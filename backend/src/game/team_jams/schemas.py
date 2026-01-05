"""Pydantic TeamJam schemas."""

from core import ServerSchema
from game.trip_events.schemas import TripEventSchema


class TeamJamSchema(ServerSchema):
    """Represent a TeamJam as a JSON schema."""

    jam_id: int
    team_id: int
    events: list[TripEventSchema]
