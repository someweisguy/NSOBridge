"""FastAPI routes associated with Bouts."""

import random
from datetime import datetime, timedelta
from http import HTTPStatus
from typing import TYPE_CHECKING, Annotated, Final

from core.app import update_model
from core.db import CacheAPIRoute, GetAsyncSession
from fastapi import APIRouter, HTTPException, Query
from game.bouts.dependencies import GetTeam
from game.series.dependencies import GetSeries
from sqlalchemy.orm.attributes import flag_dirty

from .constants import RANDOM_TEAM_NAMES
from .dependencies import GetBout, get_bout
from .models import REQUIRED_NUM_TEAMS, BaseBout
from .schemas import BoutSchema, UpdateBoutClockSchema, UpdateTeamSchema

if TYPE_CHECKING:
    from game.series.models import Series

TAG = 'Bouts'


router: Final[APIRouter] = APIRouter(
    prefix='/bout', route_class=CacheAPIRoute, tags=[TAG]
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
