from datetime import datetime
from typing import Annotated, Final

from fastapi import APIRouter, Body, Query

from .dependencies import JamDepends, get_jam
from .schemas import JamSchema

router: Final[APIRouter] = APIRouter(prefix='/jam')
router.add_api_route('', get_jam, response_model=JamSchema)


@router.post('/add-trip')
async def add_trip(
    jam: JamDepends, team_id: Annotated[int, Query()], passes: Annotated[int, Body()]
) -> None:
    await jam.add_trip(team_id, datetime.now(), passes)


@router.post('/set-lead')
async def set_lead(
    jam: JamDepends,
    team_id: Annotated[int, Query()],
    lead: Annotated[bool, Body()],
) -> None:
    await jam.set_lead(team_id, datetime.now(), lead)


@router.post('/set-lost')
async def set_lost(
    jam: JamDepends,
    team_id: Annotated[int, Query()],
    lost: Annotated[bool, Body()],
) -> None:
    await jam.set_lost(team_id, datetime.now(), lost)


@router.post('/set-star-pass')
async def set_star_pass(
    jam: JamDepends,
    team_id: Annotated[int, Query()],
    star_pass: Annotated[bool, Body()],
) -> None:
    await jam.set_star_pass(team_id, datetime.now(), star_pass)
