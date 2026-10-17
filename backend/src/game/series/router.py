"""FastAPI routes associated with Series."""

from typing import Annotated, Final
from uuid import UUID

from core.db import CacheAPIRoute
from fastapi import APIRouter, Body

from .dependencies import GetSeries, get_series
from .models import Series
from .schemas import SeriesSchema

SERIES_TAG = 'Series'

router: Final[APIRouter] = APIRouter(
    prefix='/series', route_class=CacheAPIRoute, tags=[SERIES_TAG]
)
router.add_api_route('', get_series, response_model=SeriesSchema | list[SeriesSchema])


@router.put('/activeBout', response_model=SeriesSchema)
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
