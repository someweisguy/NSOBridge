"""FastAPI routes associated with Timeouts."""

from typing import TYPE_CHECKING, Annotated, Final, Literal

from core import APIResponse
from fastapi import APIRouter, Body

from .dependencies import GetTimeout, _get_timeout
from .schemas import TimeoutSchema

if TYPE_CHECKING:
    from game.bouts.models import AbstractBout

TIMEOUTS_TAG = 'Timeouts'

router: Final[APIRouter] = APIRouter(prefix='/timeout')
router.add_api_route(
    '', _get_timeout, response_model=TimeoutSchema | None, tags=[TIMEOUTS_TAG]
)


@router.post('/type', tags=[TIMEOUTS_TAG])
async def set_type(
    timeout: GetTimeout,
    is_review: Annotated[Literal['timeout', 'review'], Body()],
) -> APIResponse:
    """Set the type of the specified Timeout."""
    timeout.set_type(is_review == 'review')
    return APIResponse(None, await timeout.get_updates())


@router.post('/team', tags=[TIMEOUTS_TAG])
async def set_team(
    timeout: GetTimeout, team_num: Annotated[int | None, Body()] = None
) -> APIResponse:
    """Set the calling Team of the specified Timeout."""
    bout: AbstractBout = timeout.get_bout()
    timeout.set_team(bout.teams[team_num] if team_num is not None else None)
    return APIResponse(None, await timeout.get_updates())


@router.post('/retained', tags=[TIMEOUTS_TAG])
async def set_retained(
    timeout: GetTimeout, retained: Annotated[bool, Body()]
) -> APIResponse:
    """Set whether or not the Timeout is retained."""
    timeout.set_retained(retained)
    return APIResponse(None, await timeout.get_updates())


@router.put('/details', tags=[TIMEOUTS_TAG])
async def set_details(
    timeout: GetTimeout, details: Annotated[str, Body()]
) -> APIResponse:
    """Add details about the specified Timeout."""
    timeout.details = details
    return APIResponse(None, await timeout.get_updates())


@router.put('/result', tags=[TIMEOUTS_TAG])
async def set_result(
    timeout: GetTimeout, result: Annotated[str, Body()]
) -> APIResponse:
    """Add results about the specified Timeout."""
    timeout.result = result
    return APIResponse(None, await timeout.get_updates())
