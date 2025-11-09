from typing import Final

from fastapi import APIRouter
from game.timeouts.dependencies import get_timeout

from .schemas import TimeoutSchema

router: Final[APIRouter] = APIRouter(prefix='/jam')
router.add_api_route('', get_timeout, response_model=TimeoutSchema)
