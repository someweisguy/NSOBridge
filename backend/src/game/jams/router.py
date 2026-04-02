"""FastAPI routes associated with Jams."""

from typing import Final

from fastapi import APIRouter

from .dependencies import _get_jam
from .schemas import JamSchema

JAMS_TAG = 'Jams'

router: Final[APIRouter] = APIRouter(prefix='/jam')
router.add_api_route('', _get_jam, response_model=JamSchema | None, tags=[JAMS_TAG])
