"""Pydantic Series schemas."""

from typing import Annotated
from uuid import UUID

from core.app import ServerSchema, register_model
from game.bouts.models import BaseBout
from pydantic import Field, SkipValidation, computed_field

from .models import Series


@register_model(Series)
class SeriesSchema(ServerSchema):
    """Represent a Series as a JSON schema."""

    uuid: UUID
    name: str
    active_bout: Annotated[BaseBout | None, SkipValidation] = Field(exclude=True)
    bouts: Annotated[list[BaseBout], SkipValidation] = Field(exclude=True)

    @computed_field
    @property
    def active_bout_uuid(self) -> UUID | None:
        """Return the UUID of the active Bout or None."""
        return self.active_bout.uuid if self.active_bout is not None else None

    @computed_field
    @property
    def bout_uuids(self) -> list[UUID]:
        """Return a list of UUIDs for each bout in the series."""
        return [bout.uuid for bout in self.bouts]
