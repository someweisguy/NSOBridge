"""Pydantic Series schemas."""

from uuid import UUID

from core import ServerSchema
from game.bouts.schemas import BoutSchema
from pydantic import Field, computed_field


class SeriesSchema(ServerSchema):
    """Represent a Series as a JSON schema."""

    uuid: UUID
    name: str
    active_bout_uuid: UUID
    bouts: list[BoutSchema] = Field(exclude=True)

    @computed_field
    @property
    def bout_uuids(self) -> list[UUID]:
        """Get a list representing the IDs of this Series' Bouts."""
        return [bout.uuid for bout in self.bouts]
