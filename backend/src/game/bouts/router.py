"""FastAPI routes associated with Bouts."""

from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Annotated, Final, Sequence

from core.app import CacheSchema
from core.db import GetAsyncSession
from fastapi import APIRouter, Body
from game.bouts.dependencies import GetTeam
from sqlalchemy import Result, Select, select
from sqlalchemy.orm.attributes import flag_dirty

from .dependencies import GetBout, _get_bout
from .models import BaseBout
from .schemas import BoutSchema, RulesetSchema

if TYPE_CHECKING:
    from game.timeouts.models import Timeout

BOUTS_TAG = 'Bouts'

ALL_RULESETS: Final[list[RulesetSchema]] = []
"""A list of all the unique rulesets in this application. 

This value is lazily computed when it is initially queried.
"""

router: Final[APIRouter] = APIRouter(prefix='/bout', tags=[BOUTS_TAG])
router.add_api_route('', _get_bout, response_model=BoutSchema)


@router.get('/ruleset')
async def get_ruleset(bout: GetBout) -> RulesetSchema:
    """Get the ruleset associated with a specific Bout."""
    return bout.ruleset


@router.get('/allRulesets')
async def get_all_rulesets() -> list[RulesetSchema]:
    """Get all the ruleset names supported by the application."""
    # Don't query the database; all possible rulesets should be fetched, not just the
    # rulesets that are persisted in the database.
    if len(ALL_RULESETS) == 0:
        unique_rulesets: set[RulesetSchema] = set()
        for subclass in BaseBout.__subclasses__():
            unique_rulesets.add(subclass.ruleset)
        ALL_RULESETS.extend(unique_rulesets)
    return ALL_RULESETS


@router.get('/allBouts', response_model=list[BoutSchema])
async def get_all_bouts(session: GetAsyncSession) -> Sequence[BaseBout]:
    """Get all the Bouts in the database."""
    statement: Select[tuple[BaseBout]] = select(BaseBout)
    results: Result[tuple[BaseBout]] = await session.execute(statement)

    return results.scalars().all()


@router.post('/beginPeriod', response_model=CacheSchema)
async def begin_period(bout: GetBout) -> BaseBout:
    """Begin the period of the specified Bout."""
    bout.begin_period(datetime.now())
    return bout


@router.post('/endPeriod', response_model=CacheSchema)
async def end_period(bout: GetBout) -> BaseBout:
    """End the period of the specified Bout."""
    bout.end_period(datetime.now())
    return bout


@router.post('/startJam', response_model=CacheSchema)
async def start_jam(bout: GetBout) -> BaseBout:
    """Start the next Jam of the specified Bout."""
    bout.start_jam(datetime.now())
    return bout


@router.post('/stopJam', response_model=CacheSchema)
async def stop_jam(bout: GetBout) -> BaseBout:
    """Stop the active Jam of the specified Bout."""
    bout.stop_jam(datetime.now())
    return bout


@router.post('/startTimeout', response_model=CacheSchema)
async def start_timeout(
    bout: GetBout,
    team_num: Annotated[int | None, Body(alias='teamNum')] = None,
    is_review: Annotated[bool, Body(alias='isReview')] = False,
) -> BaseBout:
    """Start a new Timeout in the specified Bout."""
    bout.start_timeout(datetime.now())
    timeout: Timeout | None = bout.get_last_timeout()
    if timeout is not None:
        timeout.is_review = is_review
        if team_num is not None:
            timeout._team = bout.teams[team_num]
    return bout


@router.post(path='/stopTimeout', response_model=CacheSchema)
async def stop_timeout(bout: GetBout) -> BaseBout:
    """Stop the active Timeout in the specified Bout."""
    bout.stop_timeout(datetime.now())
    return bout


@router.post('/addTrip', response_model=CacheSchema)
async def add_trip(
    bout: GetBout,
    team: GetTeam,
    passes: Annotated[int, Body()],
) -> BaseBout:
    """Add a Trip for the specified Team of the specified Jam."""
    bout.add_trip(team, datetime.now(), passes)
    return bout


@router.post('/addLead', response_model=CacheSchema)
async def set_lead(
    bout: GetBout,
    team: GetTeam,
    lead: Annotated[bool, Body()],
) -> BaseBout:
    """Set Lead for the specified Team of the specified Jam."""
    bout.add_lead(team, datetime.now(), lead)
    return bout


@router.post('/addLost', response_model=CacheSchema)
async def set_lost(
    bout: GetBout,
    team: GetTeam,
    lost: Annotated[bool, Body()],
) -> BaseBout:
    """Set Lost for the specified Team of the specified Jam."""
    bout.add_lost(team, datetime.now(), lost)
    return bout


@router.post('/addStarPass', response_model=CacheSchema)
async def set_star_pass(
    bout: GetBout,
    team: GetTeam,
    star_pass: Annotated[bool, Body(alias='starPass')],
) -> BaseBout:
    """Set a Star Pass for the specified Team of the specified Jam."""
    bout.add_star_pass(team, datetime.now(), star_pass)
    return bout


@router.post(path='/finalize', response_model=CacheSchema)
async def finalize(bout: GetBout) -> BaseBout:
    """Finalize the Bout."""
    bout.finalize()
    return bout


@router.put(path='/setClockRemaining', response_model=CacheSchema)
async def set_clock_remaining(
    bout: GetBout, remaining: Annotated[int, Body(alias='remaining')]
) -> BaseBout:
    """Set the amount of time that is remaining on the Bout clock."""
    if bout.clock.is_running():
        bout.clock.start_timestamp = datetime.now()
    remaining_timedelta = timedelta(milliseconds=remaining)
    if bout.clock.alarm is not None:
        remaining_timedelta = bout.clock.alarm - remaining_timedelta
    bout.clock.elapsed = remaining_timedelta
    flag_dirty(bout)  # Clock has no association with Bout
    return bout


@router.put(path='/setClockAlarm', response_model=CacheSchema)
async def set_clock_alarm(
    bout: GetBout, alarm: Annotated[int, Body(alias='alarm')]
) -> BaseBout:
    """Set the alarm time on the Bout clock."""
    if bout.clock.alarm.total_seconds() != alarm / 1000:
        bout.clock.alarm = timedelta(milliseconds=alarm)
        flag_dirty(bout)  # Clock has no association with Bout
    return bout


@router.put(path='/setClockIsRunning', response_model=CacheSchema)
async def set_clock_is_running(
    bout: GetBout, is_running: Annotated[bool, Body(alias='isRunning')]
) -> BaseBout:
    """Pause or unpause the Bout clock."""
    now: datetime = datetime.now()
    if bout.clock.is_running() != is_running:
        if is_running:
            bout.clock.start(now)
        else:
            bout.clock.stop(now)
        flag_dirty(bout)  # Clock has no association with Bout

    return bout


@router.put(path='/setTeamName', response_model=CacheSchema)
async def set_team_name(team: GetTeam, name: Annotated[str, Body()]) -> BaseBout:
    """Set the desired Team's name."""
    team.name = name
    return team.bout


__all__ = ('router',)
