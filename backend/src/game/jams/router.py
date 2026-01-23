"""FastAPI routes associated with Jams."""

from datetime import datetime
from typing import Annotated, Final

from fastapi import APIRouter, Body
from game.teams.dependencies import GetTeam

from .dependencies import GetJam, _get_jam
from .schemas import JamSchema

JAMS_TAG = 'Jams'

router: Final[APIRouter] = APIRouter(prefix='/jam')
router.add_api_route('', _get_jam, response_model=JamSchema | None, tags=[JAMS_TAG])


@router.post('/addTrip', tags=[JAMS_TAG])
async def add_trip(
    jam: GetJam,
    team: GetTeam,
    passes: Annotated[int, Body()],
) -> None:
    """Add a Trip for the specified Team of the specified Jam."""
    await jam.add_trip(team, datetime.now(), passes)


@router.post('/setLead', tags=[JAMS_TAG])
async def set_lead(
    jam: GetJam,
    team: GetTeam,
    lead: Annotated[bool, Body()],
) -> None:
    """Set Lead for the specified Team of the specified Jam."""
    await jam.set_lead(team, datetime.now(), lead)


@router.post('/setLost', tags=[JAMS_TAG])
async def set_lost(
    jam: GetJam,
    team: GetTeam,
    lost: Annotated[bool, Body()],
) -> None:
    """Set Lost for the specified Team of the specified Jam."""
    await jam.set_lost(team, datetime.now(), lost)


@router.post('/setStarPass', tags=[JAMS_TAG])
async def set_star_pass(
    jam: GetJam,
    team: GetTeam,
    star_pass: Annotated[bool, Body()],
) -> None:
    """Set a Star Pass for the specified Team of the specified Jam."""
    await jam.set_star_pass(team, datetime.now(), star_pass)
