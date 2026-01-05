"""FastAPI routes associated with Timeouts."""

from typing import Annotated, Final, Literal

from fastapi import APIRouter, Body
from game.teams.dependencies import GetTeamOrNoneByID

from .dependencies import GetTimeoutByID, _get_timeout
from .schemas import TimeoutSchema

TIMEOUTS_TAG = 'Timeouts'

router: Final[APIRouter] = APIRouter(prefix='/timeout')
router.add_api_route(
    '', _get_timeout, response_model=TimeoutSchema | None, tags=[TIMEOUTS_TAG]
)


@router.post('/type', tags=[TIMEOUTS_TAG])
async def set_type(
    timeout: GetTimeoutByID,
    is_review: Annotated[Literal['timeout', 'review'], Body()],
) -> None:
    """Set the type of the specified Timeout."""
    timeout.set_type(is_review == 'review')


@router.post('/team', tags=[TIMEOUTS_TAG])
async def set_team(timeout: GetTimeoutByID, team: GetTeamOrNoneByID) -> None:
    """Set the calling Team of the specified Timeout."""
    timeout.set_team(team)
    pass


@router.post('/retained', tags=[TIMEOUTS_TAG])
async def set_retained(
    timeout: GetTimeoutByID, retained: Annotated[bool, Body()]
) -> None:
    """Set whether or not the Timeout is retained."""
    timeout.set_retained(retained)


@router.put('/details', tags=[TIMEOUTS_TAG])
async def set_details(timeout: GetTimeoutByID, details: Annotated[str, Body()]) -> None:
    """Add details about the specified Timeout."""
    timeout.details = details


@router.put('/result', tags=[TIMEOUTS_TAG])
async def set_result(timeout: GetTimeoutByID, result: Annotated[str, Body()]) -> None:
    """Add results about the specified Timeout."""
    timeout.result = result
