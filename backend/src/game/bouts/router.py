"""FastAPI routes associated with Bouts."""

from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Annotated, Final, Sequence

from core import APIResponse
from db import GetAsyncSession
from fastapi import APIRouter, Body
from game.teams.dependencies import GetTeam
from sqlalchemy import Result, Select, select
from sqlalchemy.orm.attributes import flag_dirty

from .dependencies import GetBout, _get_bout
from .models import AbstractBout
from .schemas import BoutSchema

if TYPE_CHECKING:
    from game.timeouts.models import Timeout

BOUTS_TAG = 'Bouts'

router: Final[APIRouter] = APIRouter(prefix='/bout', tags=[BOUTS_TAG])
router.add_api_route('', _get_bout, response_model=BoutSchema)


@router.get('/allBouts', response_model=list[BoutSchema])
async def get_all_bouts(session: GetAsyncSession) -> Sequence[AbstractBout]:
    """Get all the Bouts in the database."""
    statement: Select[tuple[AbstractBout]] = select(AbstractBout)
    results: Result[tuple[AbstractBout]] = await session.execute(statement)

    return results.scalars().all()


@router.post('/beginPeriod')
async def begin_period(bout: GetBout) -> APIResponse:
    """Begin the period of the specified Bout."""
    bout.begin_period(datetime.now())
    return APIResponse(None, cache=await bout.get_updates())


@router.post('/endPeriod')
async def end_period(bout: GetBout) -> APIResponse:
    """End the period of the specified Bout."""
    bout.end_period(datetime.now())
    return APIResponse(None, cache=await bout.get_updates())


@router.post('/startJam')
async def start_jam(bout: GetBout):
    """Start the next Jam of the specified Bout."""
    bout.start_jam(datetime.now())
    return APIResponse(None, cache=await bout.get_updates())


@router.post('/stopJam')
async def stop_jam(bout: GetBout) -> APIResponse:
    """Stop the active Jam of the specified Bout."""
    bout.stop_jam(datetime.now())
    return APIResponse(None, cache=await bout.get_updates())


@router.post('/startTimeout')
async def start_timeout(
    bout: GetBout,
    team_num: Annotated[int | None, Body(alias='teamNum')] = None,
    is_review: Annotated[bool, Body(alias='isReview')] = False,
) -> APIResponse:
    """Start a new Timeout in the specified Bout."""
    bout.start_timeout(datetime.now())
    timeout: Timeout | None = bout.get_last_timeout()
    if timeout is not None:
        timeout.is_review = is_review
        if team_num is not None:
            timeout.team = bout.teams[team_num]
    return APIResponse(None, cache=await bout.get_updates())


@router.post(path='/stopTimeout')
async def stop_timeout(bout: GetBout) -> APIResponse:
    """Stop the active Timeout in the specified Bout."""
    bout.stop_timeout(datetime.now())
    return APIResponse(None, cache=await bout.get_updates())


@router.post('/addTrip')
async def add_trip(
    bout: GetBout,
    team: GetTeam,
    passes: Annotated[int, Body()],
) -> APIResponse:
    """Add a Trip for the specified Team of the specified Jam."""
    bout.add_trip(team, datetime.now(), passes)
    return APIResponse(None, await bout.get_updates())


@router.post('/addLead')
async def set_lead(
    bout: GetBout,
    team: GetTeam,
    lead: Annotated[bool, Body()],
) -> APIResponse:
    """Set Lead for the specified Team of the specified Jam."""
    bout.add_lead(team, datetime.now(), lead)
    return APIResponse(None, await bout.get_updates())


@router.post('/addLost')
async def set_lost(
    bout: GetBout,
    team: GetTeam,
    lost: Annotated[bool, Body()],
) -> APIResponse:
    """Set Lost for the specified Team of the specified Jam."""
    bout.add_lost(team, datetime.now(), lost)
    return APIResponse(None, await bout.get_updates())


@router.post('/addStarPass')
async def set_star_pass(
    bout: GetBout,
    team: GetTeam,
    star_pass: Annotated[bool, Body(alias='starPass')],
) -> APIResponse:
    """Set a Star Pass for the specified Team of the specified Jam."""
    bout.add_star_pass(team, datetime.now(), star_pass)
    return APIResponse(None, await bout.get_updates())


__all__ = ('router',)


@router.post(path='/setClockElapsed')
async def set_clock_elapsed(
    bout: GetBout, elapsed: Annotated[int, Body(alias='elapsed')]
) -> APIResponse:
    """Set the amount of time that has elapsed on the Bout clock."""
    if bout.clock.is_running():
        bout.clock.start_timestamp = datetime.now()
    bout.clock.elapsed = timedelta(milliseconds=elapsed)
    flag_dirty(bout)  # Clock has no association with Bout
    return APIResponse(None, cache=await bout.get_updates())


@router.post(path='/setClockAlarm')
async def set_clock_alarm(
    bout: GetBout, alarm: Annotated[int, Body(alias='alarm')]
) -> APIResponse:
    """Set the alarm time on the Bout clock."""
    if bout.clock.alarm.total_seconds() != alarm / 1000:
        bout.clock.alarm = timedelta(milliseconds=alarm)
        flag_dirty(bout)  # Clock has no association with Bout
    return APIResponse(None, cache=await bout.get_updates())


@router.post(path='/setClockIsRunning')
async def set_clock_is_running(
    bout: GetBout, is_running: Annotated[bool, Body(alias='isRunning')]
) -> APIResponse:
    """Pause or unpause the Bout clock."""
    now: datetime = datetime.now()
    if bout.clock.is_running() != is_running:
        if is_running:
            bout.clock.start(now)
        else:
            bout.clock.stop(now)
        flag_dirty(bout)  # Clock has no association with Bout

    return APIResponse(None, cache=await bout.get_updates())


__all__ = ('router',)
