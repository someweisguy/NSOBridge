from typing import Final

from fastapi import APIRouter

from .dependencies import get_series
from .schemas import SeriesSchema

router: Final[APIRouter] = APIRouter(prefix='/series')
router.add_api_route('', get_series, response_model=SeriesSchema)
