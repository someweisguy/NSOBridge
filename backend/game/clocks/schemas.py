from __future__ import annotations

from datetime import datetime, timedelta  # noqa: TC003

from schemas import ServerSchema


class ClockSchema(ServerSchema):
    start_timestamp: datetime | None
    elapsed: timedelta
    alarm: timedelta


class TimeoutSchema(ServerSchema):
    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    # team: TeamSchema | None = Field(exclude=True)
    is_review: bool
    # jam: JamSchema = Field(exclude=True)
    clock_elapsed: timedelta
    details: str
    result: str | None
    retained: bool

