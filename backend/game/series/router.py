from typing import Final

from fastapi import APIRouter

from .dependencies import get_all_series
from .schemas import SeriesSchema

router: Final[APIRouter] = APIRouter(prefix='/series')
router.add_api_route('', get_all_series, response_model=list[SeriesSchema])
