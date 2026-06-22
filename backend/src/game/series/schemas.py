"""Pydantic Series schemas."""

from __future__ import annotations

from typing import TYPE_CHECKING

from core.app import ServerSchema
from pydantic import Field, SkipValidation, computed_field

if TYPE_CHECKING:
    from uuid import UUID

    from game.bouts.schemas import BoutSchema


class SeriesSchema(ServerSchema):
    """Represent a Series as a JSON schema."""

    uuid: UUID
    name: str
    active_bout_uuid: UUID | None
    bouts: list[SkipValidation[BoutSchema]] = Field(exclude=True)

    @computed_field
    @property
    def bout_uuids(self) -> list[UUID]:
        """Return a list of UUIDs for each bout in the series."""
        return [bout.uuid for bout in self.bouts]
