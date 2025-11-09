from typing import Final

from fastapi import APIRouter

from .dependencies import get_jam_or_none
from .schemas import JamSchema

router: Final[APIRouter] = APIRouter(prefix='/jam')
router.add_api_route('', get_jam_or_none, response_model=JamSchema | None)
