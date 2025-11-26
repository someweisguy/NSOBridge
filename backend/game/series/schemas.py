from game.bouts.schemas import BoutSchema
from pydantic import Field
from schemas import ServerSchema


class SeriesSchema(ServerSchema):
    name: str
    bouts: list[BoutSchema] = Field(exclude=True)

    @property
    def bout_ids(self) -> list[int]:
        return [bout.id for bout in self.bouts]
