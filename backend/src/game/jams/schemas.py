"""Pydantic Jam schemas."""

from datetime import datetime
from uuid import UUID

from core.app import ServerSchema
from game.team_jams.schemas import TeamJamSchema

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
