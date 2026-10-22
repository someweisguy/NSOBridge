"""FastAPI routes associated with Bouts."""

import random
from datetime import datetime, timedelta
from http import HTTPStatus
from typing import TYPE_CHECKING, Annotated, Final

from core.app import update_model
from core.db import CacheAPIRoute, GetAsyncSession
from fastapi import APIRouter, Body, HTTPException, Query
from game.bouts.dependencies import GetTeam
from game.series.dependencies import GetSeries
from sqlalchemy.orm.attributes import flag_dirty

from .constants import RANDOM_TEAM_NAMES
from .dependencies import GetBout, get_bout
from .models import REQUIRED_NUM_TEAMS, BaseBout
from .schemas import BoutSchema, RulesetSchema, UpdateBoutClockSchema, UpdateTeamSchema

if TYPE_CHECKING:
    from game.series.models import Series
    from game.timeouts.models import Timeout

BOUTS_TAG = 'Bouts'

ALL_RULESETS: Final[set[RulesetSchema]] = set()
"""A list of all the unique rulesets in this application."""


def _compute_all_rulesets() -> None:
    """Collect all the rulesets in the application."""
    if len(ALL_RULESETS) == 0:
        for subclass in BaseBout.__subclasses__():
            ALL_RULESETS.add(subclass.ruleset)


router: Final[APIRouter] = APIRouter(
    prefix='/bout', route_class=CacheAPIRoute, tags=[BOUTS_TAG]
)
router.add_api_route('', get_bout, response_model=BoutSchema)


@router.post('', response_model=BoutSchema)
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

    # Create the Bout
    bout: BaseBout = BaseBout.create(ruleset_name, series, *team_names)
    session.add(bout)

    # Ensure the series always has an active Bout
    series: Series = await session.merge(series)
    if await series.awaitable_attrs.active_bout is None:
        series.active_bout = bout

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

    return bout


@router.delete('')
async def delete_bout(session: GetAsyncSession, bout: GetBout) -> None:
    series: Series = await bout.awaitable_attrs.series
    await series.awaitable_attrs.active_bout
    await series.awaitable_attrs.bouts

    if series.active_bout is bout:
        if len(series.bouts) > 1:
            series.active_bout = next(b for b in series.bouts if b is not bout)
        else:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail='At least one Bout is required in every Series',
            )
    series.bouts.remove(bout)
    await session.delete(bout)


@router.get('/ruleset', response_model=RulesetSchema | set[RulesetSchema])
async def get_ruleset(
    ruleset_name: Annotated[str | None, Query(alias='rulesetName')] = None,
) -> RulesetSchema | set[RulesetSchema]:
    """Get the ruleset associated with a specific Bout."""
    _compute_all_rulesets()
    if ruleset_name is None:
        return ALL_RULESETS
    return next(ruleset for ruleset in ALL_RULESETS if ruleset.name == ruleset_name)


@router.post('/beginPeriod', response_model=BoutSchema)
async def begin_period(bout: GetBout) -> BaseBout:
    """Begin the period of the specified Bout."""
    bout.begin_period(datetime.now())
    return bout


@router.post('/endPeriod', response_model=BoutSchema)
async def end_period(bout: GetBout) -> BaseBout:
    """End the period of the specified Bout."""
    bout.end_period(datetime.now())
    return bout


@router.post('/startJam', response_model=BoutSchema)
async def start_jam(bout: GetBout) -> BaseBout:
    """Start the next Jam of the specified Bout."""
    bout.start_jam(datetime.now())
    return bout


@router.post('/stopJam', response_model=BoutSchema)
async def stop_jam(bout: GetBout) -> BaseBout:
    """Stop the active Jam of the specified Bout."""
    bout.stop_jam(datetime.now())
    return bout


@router.post('/startTimeout', response_model=BoutSchema)
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


@router.post(path='/stopTimeout', response_model=BoutSchema)
async def stop_timeout(bout: GetBout) -> BaseBout:
    """Stop the active Timeout in the specified Bout."""
    bout.stop_timeout(datetime.now())
    return bout


@router.post('/team/trip', response_model=BoutSchema)
async def add_trip(
    team: GetTeam,
    passes: Annotated[int, Body()],
) -> BaseBout:
    """Add a Trip for the specified Team of the specified Jam."""
    bout: BaseBout = team.bout
    bout.add_trip(team, datetime.now(), passes)
    return bout


@router.post('/team/lead', response_model=BoutSchema)
async def set_lead(
    team: GetTeam,
    lead: Annotated[bool, Body()],
) -> BaseBout:
    """Set Lead for the specified Team of the specified Jam."""
    bout: BaseBout = team.bout
    bout.add_lead(team, datetime.now(), lead)
    return bout


@router.post('/team/lost', response_model=BoutSchema)
async def set_lost(
    team: GetTeam,
    lost: Annotated[bool, Body()],
) -> BaseBout:
    """Set Lost for the specified Team of the specified Jam."""
    bout: BaseBout = team.bout
    bout.add_lost(team, datetime.now(), lost)
    return bout


@router.post('/team/starPass', response_model=BoutSchema)
async def set_star_pass(
    team: GetTeam,
    star_pass: Annotated[bool, Body(alias='starPass')],
) -> BaseBout:
    """Set a Star Pass for the specified Team of the specified Jam."""
    bout: BaseBout = team.bout
    bout.add_star_pass(team, datetime.now(), star_pass)
    return bout


@router.post(path='/finalize', response_model=BoutSchema)
async def finalize(bout: GetBout) -> BaseBout:
    """Finalize the Bout."""
    bout.finalize()
    return bout


@router.put('/clock', response_model=BoutSchema)
async def update_bout_clock(bout: GetBout, updates: UpdateBoutClockSchema) -> BaseBout:
    now: datetime = datetime.now()
    if updates.is_running is not None and bout.clock.is_running() != updates.is_running:
        if updates.is_running:
            bout.clock.start(now)
        else:
            bout.clock.stop(now)
        flag_dirty(bout)  # Clock has no association with Bout
    if updates.remaining is not None:
        if bout.clock.is_running():
            bout.clock.start_timestamp = datetime.now()
        remaining_timedelta = timedelta(milliseconds=updates.remaining)
        if bout.clock.alarm is not None:
            remaining_timedelta = bout.clock.alarm - remaining_timedelta
        bout.clock.elapsed = remaining_timedelta
        flag_dirty(bout)  # Clock has no association with Bout
    return bout


@router.put('/team', response_model=BoutSchema)
async def update_bout_team(team: GetTeam, updates: UpdateTeamSchema) -> BaseBout:
    """Update the Team."""
    update_model(team, updates)
    return team.bout


__all__ = ('router',)
