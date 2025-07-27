from datetime import datetime, timedelta

from schemas.schemas import ServerSchema


class ClockSchema(ServerSchema):
    start_timestamp: datetime | None
    elapsed: timedelta
    alarm: timedelta
