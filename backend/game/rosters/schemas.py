"""Pydantic Roster schemas."""

from core import ServerSchema


class RosterSchema(ServerSchema):
    id: int
    name: str
