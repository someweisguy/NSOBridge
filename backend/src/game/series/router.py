"""FastAPI routes associated with Series."""

from typing import Final, Sequence

from core import GetAsyncSession
from fastapi import APIRouter
from sqlalchemy import Result, Select, select

from .dependencies import _get_series
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
