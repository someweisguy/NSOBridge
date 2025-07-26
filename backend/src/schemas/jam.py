from datetime import datetime

from schemas.base import ServerSchema


class JamSchema(ServerSchema):
    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    period: int
    jam: int
