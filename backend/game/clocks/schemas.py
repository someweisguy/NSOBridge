"""Pydantic Clock schemas."""

from __future__ import annotations

from datetime import datetime, timedelta  # noqa: TC003

from core import ServerSchema


class ClockSchema(ServerSchema):
    """Represent a Clock as a JSON schema."""

    id: int
    start_timestamp: datetime | None
    elapsed: timedelta
    alarm: timedelta
