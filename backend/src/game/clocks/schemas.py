"""Pydantic Clock schemas."""

from __future__ import annotations

from datetime import datetime, timedelta  # noqa: TC003
from typing import Annotated

from core import ServerSchema, timedelta_serializer


class ClockSchema(ServerSchema):
    """Represent a Clock as a JSON schema."""

    id: int
    start_timestamp: datetime | None
    elapsed: Annotated[timedelta, timedelta_serializer]
    alarm: Annotated[timedelta, timedelta_serializer]
