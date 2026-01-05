"""Pydantic Timeout schemas."""

from datetime import datetime, timedelta  # noqa: TC003
from typing import Annotated

from core import ServerSchema, timedelta_serializer


class TimeoutSchema(ServerSchema):
    """Represent a Timeout as a JSON schema."""

    id: int
    bout_id: int
    num: int

    team_id: int | None
    jam_id: int | None

    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    clock_elapsed: Annotated[timedelta, timedelta_serializer] | None

    team_is_officials: bool
    is_review: bool
    details: str
    result: str
    retained: bool
