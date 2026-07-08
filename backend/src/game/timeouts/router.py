"""FastAPI routes associated with Timeouts."""

from typing import TYPE_CHECKING, Annotated, Final, Literal

from core.app import CacheSchema
from fastapi import APIRouter, Body

from .dependencies import GetTimeout, _get_timeout
from .models import Timeout
from .schemas import TimeoutSchema

if TYPE_CHECKING:
    from game.bouts.models import BaseBout

TIMEOUTS_TAG = 'Timeouts'

router: Final[APIRouter] = APIRouter(prefix='/timeout', tags=[TIMEOUTS_TAG])
router.add_api_route('', _get_timeout, response_model=TimeoutSchema | None)


@router.post('/type', response_model=CacheSchema)
async def set_type(
    timeout: GetTimeout,
    timeout_type: Annotated[Literal['timeout', 'review'], Body()],
) -> Timeout:
    """Set the type of the specified Timeout."""
    timeout.is_review = timeout_type == 'review'
    return timeout


@router.post('/team', response_model=CacheSchema)
async def set_team(
    timeout: GetTimeout, team_num: Annotated[int | None, Body()] = None
) -> Timeout:
    """Set the calling Team of the specified Timeout."""
    bout: BaseBout = timeout.bout
    timeout.team = bout.teams[team_num] if team_num is not None else None
    return timeout


@router.post('/retained', response_model=CacheSchema)
async def set_retained(
    timeout: GetTimeout, retained: Annotated[bool, Body()]
) -> Timeout:
    """Set whether or not the Timeout is retained."""
    timeout.retained = retained
    return timeout


@router.put('/details', response_model=CacheSchema)
async def set_details(timeout: GetTimeout, details: Annotated[str, Body()]) -> Timeout:
    """Add details about the specified Timeout."""
    timeout.details = details
    return timeout


@router.put('/result', response_model=CacheSchema)
async def set_result(timeout: GetTimeout, result: Annotated[str, Body()]) -> Timeout:
    """Add results about the specified Timeout."""
    timeout.result = result
    return timeout
