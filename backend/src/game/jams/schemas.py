"""Pydantic Jam schemas."""

from __future__ import annotations

from typing import TYPE_CHECKING

from core.app import ServerSchema

if TYPE_CHECKING:
    from datetime import datetime
    from uuid import UUID

    from .types import StopReasonStr


class JamSchema(ServerSchema):
    """Represent a Jam as a JSON schema."""

    bout_uuid: UUID
    period: int
    num: int

    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    stop_reason: StopReasonStr | None

    team_jams: list[TeamJamSchema]


class TeamJamSchema(ServerSchema):
    """Represent a TeamJam as a JSON schema."""

    team_num: int
    events: list[TripEventSchema]


class TripEventSchema(ServerSchema):
    """Represent a TripEvent as a JSON schema."""

    uuid: UUID
    timestamp: datetime
    lead: bool
    lost: bool
    passes: int | None
    star_pass: bool
