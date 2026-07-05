"""Shared schemas used within the game module."""

from datetime import datetime, timedelta
from typing import Annotated

from core.app import ServerSchema, timedelta_serializer


class ClockSchema(ServerSchema):
    """Represent a Clock as a JSON schema."""

    start_timestamp: datetime | None
    elapsed: Annotated[timedelta, timedelta_serializer]
    alarm: Annotated[timedelta, timedelta_serializer]
