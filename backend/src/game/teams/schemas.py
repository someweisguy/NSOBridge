"""Pydantic Team schemas."""

from __future__ import annotations

from core.app import ServerSchema
from game.skaters.schemas import SkaterSchema  # noqa: TC002


class TeamSchema(ServerSchema):
    """Represent a Team as a JSON schema."""

    name: str
    league: str
    mnemonic: str
    num: int
    bout_score: int
    jam_score: int
    timeouts_remaining: int
    reviews_remaining: int
    score_offset: int
    skaters: list[SkaterSchema]
