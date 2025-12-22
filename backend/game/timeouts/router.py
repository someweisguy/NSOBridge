from typing import Annotated, Final, Literal

from fastapi import APIRouter, Body
from game.teams.dependencies import GetTeamOrNoneByID

from .dependencies import GetTimeoutByID, get_timeout_by_id
from .schemas import TimeoutSchema

router: Final[APIRouter] = APIRouter(prefix='/timeout')
router.add_api_route('', get_timeout_by_id, response_model=TimeoutSchema | None)


@router.post('/type')
async def set_type(
    timeout: GetTimeoutByID,
    is_review: Annotated[Literal['timeout', 'review'], Body()],
) -> None:
    timeout.set_type(is_review == 'review')


@router.post('/team')
async def set_team(timeout: GetTimeoutByID, team: GetTeamOrNoneByID) -> None:
    timeout.set_team(team)
    pass


@router.post('/retained')
async def set_retained(
    timeout: GetTimeoutByID, retained: Annotated[bool, Body()]
) -> None:
    timeout.set_retained(retained)


@router.put('/details')
async def set_details(timeout: GetTimeoutByID, details: Annotated[str, Body()]) -> None:
    timeout.details = details


@router.put('/result')
async def set_result(timeout: GetTimeoutByID, result: Annotated[str, Body()]) -> None:
    timeout.result = result
