from datetime import datetime

from schemas import ServerSchema


class TripEventSchema(ServerSchema):
    id: int
    timestamp: datetime
    lead: bool
    lost: bool
    passes: int | None
    star_pass: bool
