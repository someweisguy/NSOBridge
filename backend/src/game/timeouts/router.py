"""FastAPI routes associated with Timeouts."""

from typing import Annotated, Final, Literal

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


# FIXME: Remove
@router.post('/type', response_model=TimeoutSchema)
async def set_type(
    timeout: GetTimeout,
    timeout_type: Annotated[Literal['timeout', 'review'], Body()],
) -> Timeout:
    """Set the type of the specified Timeout."""
    timeout.is_review = timeout_type == 'review'
    return timeout


# FIXME: Remove
@router.post('/team', response_model=TimeoutSchema)
async def set_team(
    timeout: GetTimeout, team_num: Annotated[int | None, Body()] = None
) -> Timeout:
    """Set the calling Team of the specified Timeout."""
    timeout.team = team_num
    return timeout


# FIXME: Remove
@router.post('/retained', response_model=TimeoutSchema)
async def set_retained(
    timeout: GetTimeout, retained: Annotated[bool, Body()]
) -> Timeout:
    """Set whether or not the Timeout is retained."""
    timeout.retained = retained
    return timeout


# FIXME: Remove
@router.put('/details', response_model=TimeoutSchema)
async def set_details(timeout: GetTimeout, details: Annotated[str, Body()]) -> Timeout:
    """Add details about the specified Timeout."""
    timeout.details = details
    return timeout


# FIXME: Remove
@router.put('/result', response_model=TimeoutSchema)
async def set_result(timeout: GetTimeout, result: Annotated[str, Body()]) -> Timeout:
    """Add results about the specified Timeout."""
    timeout.result = result
    return timeout


@router.put('/', response_model=TimeoutSchema)
async def update_timeout(
    timeout: GetTimeout, updates: Annotated[UpdateTimeoutSchema, Body()]
) -> Timeout:
    """Update the desired Timeout."""
    update_model(timeout, updates)
    return timeout
