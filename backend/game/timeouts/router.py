from typing import Annotated, Final

from fastapi import APIRouter, Body
from game.teams.dependencies import OptionalTeamDepends

from .dependencies import TimeoutDepends, get_timeout
from .schemas import TimeoutSchema

router: Final[APIRouter] = APIRouter(prefix='/timeout')
router.add_api_route('', get_timeout, response_model=TimeoutSchema | None)


@router.post('/type')
async def set_type(
    timeout: TimeoutDepends,
    team_or_none: OptionalTeamDepends,  # TODO: this should be a Body parameter
    is_review: Annotated[bool, Body()],
) -> None:
    timeout.set_type(team_or_none, is_review)


@router.post('/retained')
async def set_retained(
    timeout: TimeoutDepends, retained: Annotated[bool, Body()]
) -> None:
    timeout.set_retained(retained)


@router.put('/details')
async def set_details(timeout: TimeoutDepends, details: Annotated[str, Body()]) -> None:
    timeout.details = details


@router.put('/result')
async def set_result(timeout: TimeoutDepends, result: Annotated[str, Body()]) -> None:
    timeout.result = result
