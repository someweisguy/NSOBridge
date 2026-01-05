"""FastAPI routes associated with Series."""

from typing import Final

from fastapi import APIRouter

from .dependencies import _get_all_series
from .schemas import SeriesSchema

SERIES_TAG = 'Series'

router: Final[APIRouter] = APIRouter(prefix='/series')
router.add_api_route(
    '', _get_all_series, response_model=list[SeriesSchema], tags=[SERIES_TAG]
)
