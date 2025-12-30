"""Pydantic Series schemas."""

from core import ServerSchema
from game.bouts.schemas import BoutSchema
from pydantic import Field, computed_field


class SeriesSchema(ServerSchema):
    """Represent a Series as a JSON schema."""

    id: int
    name: str
    bouts: list[BoutSchema] = Field(exclude=True)

    @computed_field
    @property
    def bout_ids(self) -> list[int]:
        """Get a list representing the IDs of this Series' Bouts."""
        return [bout.id for bout in self.bouts]

    @computed_field
    @property
    def active_bout_id(self) -> int | None:
        """The active Bout ID of this Series or None if there is no active Bout.

        The active Bout is the first Bout in the Series which is not final.

        """
        return next((bout.id for bout in self.bouts if not bout.is_final), None)
