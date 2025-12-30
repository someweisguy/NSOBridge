"""Pydantic Series schemas."""

from core import ServerSchema
from game.bouts.schemas import BoutSchema
from pydantic import Field, computed_field


class SeriesSchema(ServerSchema):
    id: int
    name: str
    bouts: list[BoutSchema] = Field(exclude=True)

    @computed_field
    @property
    def bout_ids(self) -> list[int]:
        return [bout.id for bout in self.bouts]

    @computed_field
    @property
    def active_bout_id(self) -> int | None:
        return next((bout.id for bout in self.bouts if not bout.is_final), None)
