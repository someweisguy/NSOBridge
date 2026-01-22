"""Pydantic Roster schemas."""

from uuid import UUID

from core import ServerSchema


class RosterSchema(ServerSchema):
    """Represent a Roster as a JSON schema."""

    uuid: UUID
    name: str
