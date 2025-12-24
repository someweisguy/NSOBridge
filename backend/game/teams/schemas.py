from __future__ import annotations

from core.schemas import ServerSchema


class TeamSchema(ServerSchema):
    id: int
    roster_id: int
    bout_id: int
    bout_score: int
    jam_score: int
    timeouts_remaining: int
    reviews_remaining: int
    score_offset: int
