"""FastAPI routes associated with Bouts."""

from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Annotated, Final

from core import APIResponse
from fastapi import APIRouter, Body

from game.teams.dependencies import GetTeam

from .dependencies import GetRuleset
from .schemas import Ruleset

if TYPE_CHECKING:
    from game.timeouts.models import Timeout

BOUTS_TAG = 'Bouts'

router: Final[APIRouter] = APIRouter(prefix='/bout', tags=[BOUTS_TAG])
# router.add_api_route('', _get_bout, response_model=BoutSchema)


@router.get('/ruleset', response_model=Ruleset)
async def _get_ruleset(bout: GetRuleset):  # TODO: add return type
    return Ruleset(
        name='WFTDA 2025',
        num_periods=2,
        jam_duration=timedelta(minutes=2),
        lineup_duration=timedelta(seconds=30),
        points_per_trip=4,
        num_timeouts=3,
        num_reviews=1,
    )


@router.post('/beginPeriod')
async def begin_period(bout: GetRuleset) -> APIResponse:
    """Begin the period of the specified Bout."""
    bout.begin_period(datetime.now())
    return APIResponse(None, cache=await bout.bout.get_updates())


@router.post('/endPeriod')
async def end_period(bout: GetRuleset) -> APIResponse:
    """End the period of the specified Bout."""
    bout.end_period(datetime.now())
    return APIResponse(None, cache=await bout.bout.get_updates())


@router.post('/startJam')
async def start_jam(bout: GetRuleset):
    """Start the next Jam of the specified Bout."""
    bout.start_jam(datetime.now())
    return APIResponse(None, cache=await bout.bout.get_updates())


@router.post('/stopJam')
async def stop_jam(bout: GetRuleset) -> APIResponse:
    """Stop the active Jam of the specified Bout."""
    bout.stop_jam(datetime.now())
    return APIResponse(None, cache=await bout.bout.get_updates())


@router.post('/startTimeout')
async def start_timeout(
    bout: GetRuleset,
    team_num: Annotated[int | None, Body(alias='teamNum')] = None,
    is_review: Annotated[bool, Body(alias='isReview')] = False,
) -> APIResponse:
    """Start a new Timeout in the specified Bout."""
    bout.start_timeout(datetime.now())
    timeout: Timeout | None = bout.get_last_timeout()
    if timeout is not None:
        timeout.is_review = is_review
        if team_num is not None:
            timeout.team = bout.bout.teams[team_num]
    return APIResponse(None, cache=await bout.bout.get_updates())


@router.post(path='/stopTimeout')
async def stop_timeout(bout: GetRuleset) -> APIResponse:
    """Stop the active Timeout in the specified Bout."""
    bout.stop_timeout(datetime.now())
    return APIResponse(None, cache=await bout.bout.get_updates())


@router.post('/addTrip')
async def add_trip(
    bout: GetRuleset,
    team: GetTeam,
    passes: Annotated[int, Body()],
) -> APIResponse:
    """Add a Trip for the specified Team of the specified Jam."""
    bout.add_trip(team, datetime.now(), passes)
    return APIResponse(None, await bout.bout.get_updates())


@router.post('/addLead')
async def set_lead(
    bout: GetRuleset,
    team: GetTeam,
    lead: Annotated[bool, Body()],
) -> APIResponse:
    """Set Lead for the specified Team of the specified Jam."""
    bout.add_lead(team, datetime.now(), lead)
    return APIResponse(None, await bout.bout.get_updates())


@router.post('/addLost')
async def set_lost(
    bout: GetRuleset,
    team: GetTeam,
    lost: Annotated[bool, Body()],
) -> APIResponse:
    """Set Lost for the specified Team of the specified Jam."""
    bout.add_lost(team, datetime.now(), lost)
    return APIResponse(None, await bout.bout.get_updates())


@router.post('/addStarPass')
async def set_star_pass(
    bout: GetRuleset,
    team: GetTeam,
    star_pass: Annotated[bool, Body(alias='starPass')],
) -> APIResponse:
    """Set a Star Pass for the specified Team of the specified Jam."""
    bout.add_star_pass(team, datetime.now(), star_pass)
    return APIResponse(None, await bout.bout.get_updates())


__all__ = ('router',)
