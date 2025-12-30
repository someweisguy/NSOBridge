"""Pydantic Team schemas."""

from __future__ import annotations

from core import ServerSchema


class TeamSchema(ServerSchema):
    """Represent a Team as a JSON schema."""

    id: int
    roster_id: int
    bout_id: int
    bout_score: int
    jam_score: int
    timeouts_remaining: int
    reviews_remaining: int
    score_offset: int
