"""FastAPI routes associated with Series."""

from typing import Annotated, Final, Sequence
from uuid import UUID

from core.app.schemas import CacheSchema
from core.db import GetAsyncSession
from fastapi import APIRouter, Body
from sqlalchemy import Result, Select, select

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
    series.set_active_bout(bout)
    return series
