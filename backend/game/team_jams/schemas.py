"""Pydantic TeamJam schemas."""

from core import ServerSchema
from game.trip_events.schemas import TripEventSchema


class TeamJamSchema(ServerSchema):
    jam_id: int
    team_id: int
    events: list[TripEventSchema]
