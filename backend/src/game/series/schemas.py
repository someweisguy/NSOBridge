"""Pydantic Series schemas."""

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
    active_bout_uuid: UUID | None
    bouts: list[SkipValidation[BaseBout]] = Field(exclude=True)

    @computed_field
    @property
    def bout_uuids(self) -> list[UUID]:
        """Return a list of UUIDs for each bout in the series."""
        return [bout.uuid for bout in self.bouts]
