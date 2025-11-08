from typing import Final

from fastapi import APIRouter
from game.jams.dependencies import get_jam

from .schemas import JamSchema

router: Final[APIRouter] = APIRouter(prefix='/jam')
router.add_api_route('', get_jam, response_model=JamSchema)
