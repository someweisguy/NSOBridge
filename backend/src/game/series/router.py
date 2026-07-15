"""FastAPI routes associated with Series."""

import random
from typing import Annotated, Final, Sequence
from uuid import UUID

from core.app import CacheSchema
from core.db import GetAsyncSession
from fastapi import APIRouter, Body, Query
from game.bouts.models import REQUIRED_NUM_TEAMS, BaseBout, Team
from sqlalchemy import Result, Select, select
from sqlalchemy.orm.attributes import flag_dirty

from .constants import RANDOM_TEAM_NAMES
from .dependencies import GetSeries, _get_series
from .models import Series
from .schemas import SeriesSchema

SERIES_TAG = 'Series'

router: Final[APIRouter] = APIRouter(prefix='/series', tags=[SERIES_TAG])
router.add_api_route('', _get_series, response_model=SeriesSchema)


@router.get('/allSeries', response_model=list[SeriesSchema])
async def get_all_series(session: GetAsyncSession) -> Sequence[Series]:
    """Get all the Series in the database."""
    statement: Select[tuple[Series]] = select(Series)
    results: Result[tuple[Series]] = await session.execute(statement)

    return results.scalars().all()


@router.put('/activeBout', response_model=CacheSchema)
async def set_active_bout(
    series: GetSeries, bout_uuid: Annotated[UUID, Body(alias='boutUuid')]
) -> Series:
    """Set the active Bout of the Series."""
    for bout in series.bouts:
        if bout.uuid == bout_uuid:
            break
    else:
        raise ValueError('No such Bout was found.')

    series.active_bout = bout
    return series


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

    # Add the Bout to the Series and make it active
    series.bouts.append(bout)
    series.active_bout = bout

    flag_dirty(series)  # Include Series in cache updates

    return bout
