"""FastAPI routes associated with Bouts."""

from datetime import timedelta
from typing import Final

from db import GetAsyncSession
from fastapi import APIRouter
from game.bouts.dependencies import GetBout

from .schemas import Ruleset

router: Final[APIRouter] = APIRouter(prefix='/bout')


@router.get('/ruleset')
async def get_ruleset(bout: GetBout, session: GetAsyncSession) -> Ruleset:
    # TODO: this api should be deprecated
    return Ruleset(
        name='WFTDA 2025',
        num_periods=2,
        jam_duration=timedelta(minutes=2),
        lineup_duration=timedelta(seconds=30),
        points_per_trip=4,
        num_timeouts=3,
        num_reviews=1,
    )


__all__ = ('router',)
