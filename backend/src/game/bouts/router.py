"""FastAPI routes associated with Bouts."""

from datetime import datetime
from typing import TYPE_CHECKING, Annotated, Final, Sequence

from core import AsyncSessionDepends
from fastapi import APIRouter, Body
from game.rulesets.schemas import Ruleset
from game.teams.dependencies import OptionalTeamDepends
from sqlalchemy import Result, Select, select

from .dependencies import BoutDepends, _get_bout
from .models import BaseBout
from .schemas import BoutSchema

if TYPE_CHECKING:
    from game.timeouts.models import BaseTimeout

BOUTS_TAG = 'Bouts'

router: Final[APIRouter] = APIRouter(prefix='/bout', tags=[BOUTS_TAG])
router.add_api_route('', _get_bout, response_model=BoutSchema)


@router.get('/bouts', response_model=list[BoutSchema])
async def get_all_bouts(session: AsyncSessionDepends) -> Sequence[BaseBout]:
    statement: Select[tuple[BaseBout]] = select(BaseBout)
    results: Result[tuple[BaseBout]] = await session.execute(statement)

    return results.scalars().all()


@router.get('/ruleset', response_model=Ruleset)
async def _get_ruleset(bout: BoutDepends) -> Ruleset:
    return bout.ruleset


@router.post('/beginPeriod')
async def begin_period(bout: BoutDepends) -> None:
    """Begin the period of the specified Bout."""
    await bout.begin_period(datetime.now())


@router.post('/endPeriod')
async def end_period(bout: BoutDepends) -> None:
    """End the period of the specified Bout."""
    await bout.end_period(datetime.now())


@router.post('/startJam')
async def start_jam(bout: BoutDepends) -> None:
    """Start the next Jam of the specified Bout."""
    await bout.start_jam(datetime.now())


@router.post('/stopJam')
async def stop_jam(bout: BoutDepends) -> None:
    """Stop the active Jam of the specified Bout."""
    await bout.stop_jam(datetime.now())


@router.post('/startTimeout')
async def start_timeout(
    bout: BoutDepends,
    team: OptionalTeamDepends = None,  # TODO: dependency should be in Body
    is_review: Annotated[bool, Body(alias='isReview')] = False,
) -> None:
    """Start a new Timeout in the specified Bout."""
    timeout: BaseTimeout = await bout.start_timeout(datetime.now())
    timeout.is_review = is_review
    if team is not None:
        timeout.team = team


@router.post(path='/stopTimeout')
async def stop_timeout(bout: BoutDepends) -> None:
    """Stop the active Timeout in the specified Bout."""
    await bout.stop_timeout(datetime.now())


__all__ = ('router',)
