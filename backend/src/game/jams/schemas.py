"""Pydantic Jam schemas."""

from datetime import datetime
from uuid import UUID

from core.app import ServerSchema

from .types import StopReasonStr


class TripEventSchema(ServerSchema):
    """Represent a TripEvent as a JSON schema."""

    uuid: UUID
    timestamp: datetime
    lead: bool
    lost: bool
    passes: int | None
    star_pass: bool


class TeamJamSchema(ServerSchema):
    """Represent a TeamJam as a JSON schema."""

    team_num: int
    events: list[TripEventSchema]


class JamSchema(ServerSchema):
    """Represent a Jam as a JSON schema."""

    bout_uuid: UUID
    period: int
    num: int

    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    stop_reason: StopReasonStr | None

    team_jams: list[TeamJamSchema]
