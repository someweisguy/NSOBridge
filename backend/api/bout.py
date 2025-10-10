from datetime import datetime
from typing import Annotated, Final

from fastapi import APIRouter, Body, Depends, Query
from models import GenericBoutModel
from models.bout import BoutContext
from models.rulesets.wftda_2025 import BoutModel
from schemas import BoutSchema
from schemas.bout import BoutContextSchema
from sqlalchemy import select

from .api import DatabaseDepends
from .roster import RosterDepends
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


# FIXME: fix roster dependency
@router.post('/wftda2025')
async def create_bout(
    db: DatabaseDepends,
    series: SeriesDepends,
    rosters: RosterDepends,
    order: Annotated[int, Body()] = 0,
) -> None:
    home, away = rosters
    bout = BoutModel(series, home, away)
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
