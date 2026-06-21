"""FastAPI routes associated with Bouts."""

import random
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Annotated, Final, Sequence

from core import APIResponse
from core.db import GetAsyncSession
from fastapi import APIRouter, Body, Query
from game.series.dependencies import GetSeries
from game.teams.dependencies import GetTeam
from game.teams.models import Team
from sqlalchemy import Result, Select, select
from sqlalchemy.orm.attributes import flag_dirty

from .constants import RANDOM_TEAM_NAMES
from .dependencies import GetBout, _get_bout
from .models import BaseBout
from .schemas import BoutSchema

if TYPE_CHECKING:
    from game.timeouts.models import Timeout

BOUTS_TAG = 'Bouts'
REQUIRED_NUM_TEAMS: Final[int] = 2


router: Final[APIRouter] = APIRouter(prefix='/bout', tags=[BOUTS_TAG])
router.add_api_route('', _get_bout, response_model=BoutSchema)


@router.get('/allBouts', response_model=list[BoutSchema])
async def get_all_bouts(session: GetAsyncSession) -> Sequence[BaseBout]:
    """Get all the Bouts in the database."""
    statement: Select[tuple[BaseBout]] = select(BaseBout)
    results: Result[tuple[BaseBout]] = await session.execute(statement)

    return results.scalars().all()


@router.put('/createBout')
async def create_bout(
    session: GetAsyncSession,
    series: GetSeries,
    ruleset_name: Annotated[str, Query(alias='rulesetName')],
    team_names: Annotated[list[str] | None, Query(alias='teamName')] = None,
) -> APIResponse:
    if team_names is None:
        team_names = list(random.choice(RANDOM_TEAM_NAMES))  # noqa: S311

    if len(team_names) < REQUIRED_NUM_TEAMS:
        raise ValueError(
            f'At least {REQUIRED_NUM_TEAMS} team are needed to create a Bout.'
        )

    home_name, away_name, *_ = team_names
    bout: BaseBout = BaseBout(ruleset_name, Team(home_name), Team(away_name))
    bout.series_uuid = series.uuid
    session.add(bout)

    # Expunge and merge the Bout to allow the subclass to call init()
    # It's a weird hack, but it appears to be the only way to allow the object to be
    # loaded as the correct subclass.
    try:
        await session.flush()
        session.expunge(bout)
        bout = await session.merge(bout)
    except AssertionError as e:
        # SQLAlchemy raises AssertionError on invalid polymorphic identity
        raise ValueError(
            f'Cannot create bout with unknown ruleset: {ruleset_name}'
        ) from e
    bout.init()

    # Add the Bout to the Series
    series.bouts.append(bout)
    if series.active_bout_uuid is None:
        series.set_active_bout(bout)
    flag_dirty(series)  # Include Series in cache updates

    return APIResponse(bout.uuid, bout.get_session())


@router.post('/beginPeriod')
async def begin_period(bout: GetBout) -> APIResponse:
    """Begin the period of the specified Bout."""
    bout.begin_period(datetime.now())
    return APIResponse(None, bout.get_session())


@router.post('/endPeriod')
async def end_period(bout: GetBout) -> APIResponse:
    """End the period of the specified Bout."""
    bout.end_period(datetime.now())
    return APIResponse(None, bout.get_session())


@router.post('/startJam')
async def start_jam(bout: GetBout):
    """Start the next Jam of the specified Bout."""
    bout.start_jam(datetime.now())
    return APIResponse(None, bout.get_session())


@router.post('/stopJam')
async def stop_jam(bout: GetBout) -> APIResponse:
    """Stop the active Jam of the specified Bout."""
    bout.stop_jam(datetime.now())
    return APIResponse(None, bout.get_session())


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
    return APIResponse(None, bout.get_session())


@router.post(path='/stopTimeout')
async def stop_timeout(bout: GetBout) -> APIResponse:
    """Stop the active Timeout in the specified Bout."""
    bout.stop_timeout(datetime.now())
    return APIResponse(None, bout.get_session())


@router.post('/addTrip')
async def add_trip(
    bout: GetBout,
    team: GetTeam,
    passes: Annotated[int, Body()],
) -> APIResponse:
    """Add a Trip for the specified Team of the specified Jam."""
    bout.add_trip(team, datetime.now(), passes)
    return APIResponse(None, bout.get_session())


@router.post('/addLead')
async def set_lead(
    bout: GetBout,
    team: GetTeam,
    lead: Annotated[bool, Body()],
) -> APIResponse:
    """Set Lead for the specified Team of the specified Jam."""
    bout.add_lead(team, datetime.now(), lead)
    return APIResponse(None, bout.get_session())


@router.post('/addLost')
async def set_lost(
    bout: GetBout,
    team: GetTeam,
    lost: Annotated[bool, Body()],
) -> APIResponse:
    """Set Lost for the specified Team of the specified Jam."""
    bout.add_lost(team, datetime.now(), lost)
    return APIResponse(None, bout.get_session())


@router.post('/addStarPass')
async def set_star_pass(
    bout: GetBout,
    team: GetTeam,
    star_pass: Annotated[bool, Body(alias='starPass')],
) -> APIResponse:
    """Set a Star Pass for the specified Team of the specified Jam."""
    bout.add_star_pass(team, datetime.now(), star_pass)
    return APIResponse(None, bout.get_session())


@router.post(path='/finalize')
async def finalize(bout: GetBout) -> APIResponse:
    """Finalize the Bout."""
    bout.finalize()
    return APIResponse(None, bout.get_session())


@router.put(path='/setClockRemaining')
async def set_clock_remaining(
    bout: GetBout, remaining: Annotated[int, Body(alias='remaining')]
) -> APIResponse:
    """Set the amount of time that is remaining on the Bout clock."""
    if bout.clock.is_running():
        bout.clock.start_timestamp = datetime.now()
    remaining_timedelta = timedelta(milliseconds=remaining)
    if bout.clock.alarm is not None:
        remaining_timedelta = bout.clock.alarm - remaining_timedelta
    bout.clock.elapsed = remaining_timedelta
    flag_dirty(bout)  # Clock has no association with Bout
    return APIResponse(None, bout.get_session())


@router.put(path='/setClockAlarm')
async def set_clock_alarm(
    bout: GetBout, alarm: Annotated[int, Body(alias='alarm')]
) -> APIResponse:
    """Set the alarm time on the Bout clock."""
    if bout.clock.alarm.total_seconds() != alarm / 1000:
        bout.clock.alarm = timedelta(milliseconds=alarm)
        flag_dirty(bout)  # Clock has no association with Bout
    return APIResponse(None, bout.get_session())


@router.put(path='/setClockIsRunning')
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

    return APIResponse(None, bout.get_session())


@router.put(path='/setTeamName')
async def set_team_name(team: GetTeam, name: Annotated[str, Body()]) -> APIResponse:
    """Set the desired Team's name."""
    # TODO: Does any additional string handling need to happen here?

    team.name = name

    return APIResponse(None, team.get_session())


__all__ = ('router',)
