"""FastAPI routes associated with Timeouts."""

from typing import Annotated, Final

from core.app import update_model
from core.db import CacheAPIRoute
from fastapi import APIRouter, Body

from .dependencies import GetTimeout, _get_timeout
from .models import Timeout
from .schemas import TimeoutSchema, UpdateTimeoutSchema

TIMEOUTS_TAG = 'Timeouts'

router: Final[APIRouter] = APIRouter(
    prefix='/timeout', route_class=CacheAPIRoute, tags=[TIMEOUTS_TAG]
)
router.add_api_route('', _get_timeout, response_model=TimeoutSchema | None)


@router.put('', response_model=TimeoutSchema)
async def update_timeout(
    timeout: GetTimeout, updates: Annotated[UpdateTimeoutSchema, Body()]
) -> Timeout:
    """Update the desired Timeout."""
    update_model(timeout, updates)
    return timeout
