from __future__ import annotations

from datetime import datetime, timedelta  # noqa: TC003

from schemas import ServerSchema


class ClockSchema(ServerSchema):
    id: int
    start_timestamp: datetime | None
    elapsed: timedelta
    alarm: timedelta
