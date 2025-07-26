from datetime import datetime

from schemas.base import ServerModel


class JamSchema(ServerModel):
    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    period: int
    jam: int
