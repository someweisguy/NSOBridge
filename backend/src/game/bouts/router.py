"""FastAPI routes associated with Bouts."""

import random
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Annotated, Final, Sequence

from core.app import CacheSchema
from core.db import GetAsyncSession
from fastapi import APIRouter, Body, Query
from game.bouts.dependencies import GetTeam
from game.bouts.models import REQUIRED_NUM_TEAMS, Team
from game.series.dependencies import GetSeries
from sqlalchemy import Result, Select, select
from sqlalchemy.orm.attributes import flag_dirty

from .constants import RANDOM_TEAM_NAMES
from .dependencies import GetBout, _get_bout
from .models import BaseBout
from .schemas import BoutSchema, RulesetSchema

if TYPE_CHECKING:
    from game.timeouts.models import Timeout

BOUTS_TAG = 'Bouts'

ALL_RULESET_NAMES: Final[list[str]] = []
"""A list of all the unique ruleset names in this application. 

This value is lazily computed when it is initially queried.
"""

router: Final[APIRouter] = APIRouter(prefix='/bout', tags=[BOUTS_TAG])
router.add_api_route('', _get_bout, response_model=BoutSchema)


@router.get('/ruleset')
async def get_ruleset(bout: GetBout) -> RulesetSchema:
    """Get the ruleset associated with a specific Bout."""
    return bout.ruleset


@router.get('/allRulesetNames')
async def get_all_ruleset_names() -> list[str]:
    """Get all the ruleset names supported by the application."""
    # Don't query the database; all possible ruleset names should be fetched, not just
    # the rulesets that are persisted in the database.
    if len(ALL_RULESET_NAMES) == 0:
        unique_ruleset_names: set[str] = set()
        for subclass in BaseBout.__subclasses__():
            unique_ruleset_names.add(subclass.ruleset.name)
        ALL_RULESET_NAMES.extend(unique_ruleset_names)
    return ALL_RULESET_NAMES


@router.get('/allBouts', response_model=list[BoutSchema])
async def get_all_bouts(session: GetAsyncSession) -> Sequence[BaseBout]:
    """Get all the Bouts in the database."""
    statement: Select[tuple[BaseBout]] = select(BaseBout)
    results: Result[tuple[BaseBout]] = await session.execute(statement)

    return results.scalars().all()


@router.put('/createBout', response_model=CacheSchema)
async def create_bout(
    session: GetAsyncSession,
    series: GetSeries,
    ruleset_name: Annotated[str, Query(alias='rulesetName')],
    team_names: Annotated[list[str] | None, Query(alias='teamName')] = None,
) -> BaseBout:
    """Create a Bout and initialize it."""
    # Ensure that the team names are properly initialized
    if team_names is None:
        team_names = list(random.choice(RANDOM_TEAM_NAMES))  # noqa: S311
    if len(team_names) < REQUIRED_NUM_TEAMS:
        raise ValueError(
            f'At least {REQUIRED_NUM_TEAMS} team are needed to create a Bout.'
        )
    home_name, away_name, *_ = team_names

    # Create the Bout
    bout: BaseBout = BaseBout(ruleset_name, Team(home_name, 0), Team(away_name, 1))
    bout._series_uuid = series.uuid
    session.add(bout)

    # Expunge and merge the Bout to allow the subclass to call setup()
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
    bout.setup()

    # Add the Bout to the Series
    series.bouts.append(bout)
    if series.active_bout_uuid is None:
        series.set_active_bout(bout)
    flag_dirty(series)  # Include Series in cache updates

    return bout


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
    # TODO: Does any additional string handling need to happen here?

    team.name = name

    return team.bout


__all__ = ('router',)
