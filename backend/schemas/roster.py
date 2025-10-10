from .schemas import ServerSchema


class RosterSchema(ServerSchema):
    id: int
    name: str
