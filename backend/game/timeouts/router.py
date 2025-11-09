from typing import Final

from fastapi import APIRouter

from .dependencies import get_timeout_or_none
from .schemas import TimeoutSchema

router: Final[APIRouter] = APIRouter(prefix='/timeout')
router.add_api_route('', get_timeout_or_none, response_model=TimeoutSchema | None)
