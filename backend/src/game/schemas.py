"""Shared schemas used within the game module."""

from __future__ import annotations

from typing import TYPE_CHECKING, Annotated

from core.app import ServerSchema, register_model, timedelta_serializer

from .models import Clock

if TYPE_CHECKING:
    from datetime import datetime, timedelta


@register_model(Clock)
class ClockSchema(ServerSchema):
    """Represent a Clock as a JSON schema."""

    start_timestamp: datetime | None
    elapsed: Annotated[timedelta, timedelta_serializer]
    alarm: Annotated[timedelta, timedelta_serializer]
