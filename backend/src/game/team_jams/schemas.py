"""Pydantic TeamJam schemas."""

from core import ServerSchema
from game.trip_events.schemas import TripEventSchema


class TeamJamSchema(ServerSchema):
    """Represent a TeamJam as a JSON schema."""

    # FIXME: figure out how to refer back to the team that owns this team-jam
    events: list[TripEventSchema]
