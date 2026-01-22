"""Pydantic Roster schemas."""

from core import ServerSchema


class RosterSchema(ServerSchema):
    """Represent a Roster as a JSON schema."""

    # FIXME: add roster UUID
    name: str
