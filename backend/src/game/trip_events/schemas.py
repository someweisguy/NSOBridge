"""Pydantic TripEvent schemas."""

from datetime import datetime
from uuid import UUID

from core.app import ServerSchema


class TripEventSchema(ServerSchema):
    """Represent a TripEvent as a JSON schema."""

    uuid: UUID
    timestamp: datetime
    lead: bool
    lost: bool
    passes: int | None
    star_pass: bool
