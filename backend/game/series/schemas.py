from game.bouts.models import BaseBout
from pydantic import Field
from schemas import ServerSchema


class SeriesSchema(ServerSchema):
    name: str
    bouts: list[BaseBout] = Field(exclude=True)

    @property
    def bout_ids(self) -> list[int]:
        return [bout.id for bout in self.bouts if bout.id is not None]
