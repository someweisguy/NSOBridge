from datetime import datetime
from typing import Annotated, Final, Sequence

from fastapi import APIRouter, Body, Depends, Query
from models import GenericBoutModel
from models.bout import BoutContext
from models.rulesets.wftda_2025 import BoutModel
from models.team import RosterModel
from schemas import BoutSchema
from schemas.bout import BoutContextSchema
from sqlalchemy import Result, select

from .api import DatabaseDepends
from .series import SeriesDepends

router: Final[APIRouter] = APIRouter(prefix='/bout')


@router.get('', response_model=BoutSchema)
async def get_bout(
    db: DatabaseDepends, bout_id: Annotated[int, Query(alias='boutId')]
) -> GenericBoutModel:
    statement = select(GenericBoutModel).where(GenericBoutModel.id == bout_id)
    results = await db.execute(statement)
    return results.scalar_one()


BoutDepends = Annotated[GenericBoutModel, Depends(get_bout)]


# TODO: Move this to its own FastAPI router
async def get_rosters(
    db: DatabaseDepends, roster_ids: Annotated[list[int], Body(alias='rosterIds')]
) -> Sequence[RosterModel]:
    if len(roster_ids) == 0:
        raise ValueError('At least one Roster ID is required')
    if len(roster_ids) != len(set(roster_ids)):
        raise ValueError('Duplicate Roster IDs are not permitted')
    results: Result[tuple[RosterModel]] = await db.execute(
        select(RosterModel).where(RosterModel.id.in_(roster_ids))
    )
    rosters: Sequence[RosterModel] = results.scalars().all()
    if len(rosters) != len(roster_ids):
        raise KeyError('Unknown Roster ID provided')
    return rosters


@router.post('/wftda2025')
async def create_bout(
    db: DatabaseDepends,
    series: SeriesDepends,
    rosters: Annotated[Sequence[RosterModel], Depends(get_rosters)],
    order: Annotated[int, Body()] = 0,
) -> None:
    bout = BoutModel(series, *rosters)
    db.add(bout)


@router.get('/context', response_model=BoutContextSchema)
async def get_bout_context(
    bout: Annotated[BoutModel, Depends(get_bout)],
) -> BoutContext:
    return bout.context


@router.post('/setup-track')
async def setup_track(bout: BoutDepends) -> None:
    bout.setup_track(datetime.now())


@router.post('/clear-track')
async def clear_track(bout: BoutDepends) -> None:
    bout.clear_track(datetime.now())


@router.post('/start-jam')
async def start_jam(bout: BoutDepends) -> None:
    bout.start_jam(datetime.now())


@router.post('/stop-jam')
async def stop_jam(bout: BoutDepends) -> None:
    bout.stop_jam(datetime.now())


@router.post('/call-timeout')
async def call_timeout(bout: BoutDepends) -> None:
    bout.start_timeout(datetime.now())


@router.post('/end-timeout')
async def end_timeout(bout: BoutDepends) -> None:
    bout.stop_timeout(datetime.now())


@router.post('/expected-start')
async def set_expected_start(
    bout: BoutDepends, timestamp: Annotated[datetime, Body()]
) -> None:
    if bout.is_running:
        raise RuntimeError('Cannot set the expected start timestamp now')
    bout.expected_start_timestamp = timestamp.astimezone()


__all__ = ('router',)
