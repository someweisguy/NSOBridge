"""Pydantic TripEvent schemas."""

from datetime import datetime

from core import ServerSchema


class TripEventSchema(ServerSchema):
    """Represent a TripEvent as a JSON schema."""

    timestamp: datetime
    lead: bool
    lost: bool
    passes: int | None
    star_pass: bool
