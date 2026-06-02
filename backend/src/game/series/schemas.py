"""Pydantic Series schemas."""

from typing import Any
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
    def bout_data(self) -> list[dict[str, Any]]:
        """Return a list of dicts containing information on each bout in the series."""
        return [
            {
                'uuid': bout.uuid,
                'name': ' vs. '.join([team.name for team in bout.teams]),
            }
            for bout in self.bouts
        ]
