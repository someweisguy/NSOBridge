"""Pydantic Series schemas."""

from uuid import UUID

from core import ServerSchema
from game.bouts.schemas import BoutSchema
from pydantic import Field, computed_field


class SeriesSchema(ServerSchema):
    """Represent a Series as a JSON schema."""

    uuid: UUID
    name: str
    bouts: list[BoutSchema] = Field(exclude=True)

    @computed_field
    @property
    def bout_uuids(self) -> list[UUID]:
        """Get a list representing the IDs of this Series' Bouts."""
        return [bout.uuid for bout in self.bouts]

    @computed_field
    @property
    def active_bout_index(self) -> int | None:
        """The active Bout ID of this Series or None if there is no active Bout.

        The active Bout is the first Bout in the Series which is not final.

        """
        return next((i for i, bout in enumerate(self.bouts) if not bout.is_final), None)
