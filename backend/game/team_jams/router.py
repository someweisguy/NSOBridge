from datetime import datetime
from typing import Annotated, Final

from fastapi import APIRouter
from fastapi.param_functions import Body

from .dependencies import TeamJamDepends, get_team_jam
from .schemas import TeamJamSchema

router: Final[APIRouter] = APIRouter(prefix='/team-jam')
router.add_api_route('', get_team_jam, response_model=TeamJamSchema)


@router.post('/add-trip')
async def add_trip(team_jam: TeamJamDepends, passes: Annotated[int, Body()]) -> None:
    await team_jam.add_trip(datetime.now(), passes)


@router.post('/set-lead')
async def set_lead(team_jam: TeamJamDepends, lead: Annotated[bool, Body()]) -> None:
    await team_jam.set_lead(datetime.now(), lead)


@router.post('/set-lost')
async def set_lost(team_jam: TeamJamDepends, lost: Annotated[bool, Body()]) -> None:
    await team_jam.set_lost(datetime.now(), lost)


@router.post('/set-star-pass')
async def set_star_pass(
    team_jam: TeamJamDepends, star_pass: Annotated[bool, Body()]
) -> None:
    await team_jam.set_star_pass(datetime.now(), star_pass)
