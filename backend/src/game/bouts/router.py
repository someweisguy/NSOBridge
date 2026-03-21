"""FastAPI routes associated with Bouts."""

from datetime import datetime
from typing import TYPE_CHECKING, Annotated, Final, Sequence

from core import APIResponse
from db import GetAsyncSession
from fastapi import APIRouter, Body
from game.rulesets.schemas import Ruleset
from sqlalchemy import Result, Select, select

from .dependencies import GetBout, _get_bout
from .models import BaseBout
from .schemas import BoutSchema

if TYPE_CHECKING:
    from game.timeouts.models import BaseTimeout

BOUTS_TAG = 'Bouts'

router: Final[APIRouter] = APIRouter(prefix='/bout', tags=[BOUTS_TAG])
router.add_api_route('', _get_bout, response_model=BoutSchema)


@router.get('/allBouts', response_model=list[BoutSchema])
async def get_all_bouts(session: GetAsyncSession) -> Sequence[BaseBout]:
    """Get all the Bouts in the database."""
    statement: Select[tuple[BaseBout]] = select(BaseBout)
    results: Result[tuple[BaseBout]] = await session.execute(statement)

    return results.scalars().all()


@router.get('/ruleset', response_model=Ruleset)
async def _get_ruleset(bout: GetBout) -> Ruleset:
    return bout.ruleset


@router.post('/beginPeriod')
async def begin_period(bout: GetBout) -> APIResponse:
    """Begin the period of the specified Bout."""
    await bout.begin_period(datetime.now())
    return APIResponse(None, cache=await bout.get_updates())


@router.post('/endPeriod')
async def end_period(bout: GetBout) -> APIResponse:
    """End the period of the specified Bout."""
    await bout.end_period(datetime.now())
    return APIResponse(None, cache=await bout.get_updates())


@router.post('/startJam')
async def start_jam(bout: GetBout):
    """Start the next Jam of the specified Bout."""
    await bout.start_jam(datetime.now())
    return APIResponse(None, cache=await bout.get_updates())


@router.post('/stopJam')
async def stop_jam(bout: GetBout) -> APIResponse:
    """Stop the active Jam of the specified Bout."""
    await bout.stop_jam(datetime.now())
    return APIResponse(None, cache=await bout.get_updates())


@router.post('/startTimeout')
async def start_timeout(
    bout: GetBout,
    team_num: Annotated[int | None, Body(alias='teamNum')] = None,
    is_review: Annotated[bool, Body(alias='isReview')] = False,
) -> APIResponse:
    """Start a new Timeout in the specified Bout."""
    timeout: BaseTimeout = await bout.start_timeout(datetime.now())
    timeout.is_review = is_review
    if team_num is not None:
        timeout.team = bout.teams[team_num]
    return APIResponse(None, cache=await bout.get_updates())


@router.post(path='/stopTimeout')
async def stop_timeout(bout: GetBout) -> APIResponse:
    """Stop the active Timeout in the specified Bout."""
    await bout.stop_timeout(datetime.now())
    return APIResponse(None, cache=await bout.get_updates())


__all__ = ('router',)
