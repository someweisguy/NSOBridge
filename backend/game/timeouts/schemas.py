"""Pydantic Timeout schemas."""

from datetime import datetime, timedelta  # noqa: TC003

from core import ServerSchema


class TimeoutSchema(ServerSchema):
    id: int
    bout_id: int
    num: int

    team_id: int | None
    jam_id: int | None

    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    clock_elapsed: timedelta | None

    team_is_officials: bool
    is_review: bool
    details: str
    result: str
    retained: bool
