from datetime import datetime
from typing import Annotated, Final

from fastapi import APIRouter, Body, Query

from .dependencies import GetJamByID, get_jam_by_id
from .schemas import JamSchema

JAMS_TAG = 'Jams'

router: Final[APIRouter] = APIRouter(prefix='/jam')
router.add_api_route(
    '', get_jam_by_id, response_model=JamSchema | None, tags=[JAMS_TAG]
)


@router.post('/add-trip', tags=[JAMS_TAG])
async def add_trip(
    jam: GetJamByID,
    team_id: Annotated[int, Query(alias='teamId')],
    passes: Annotated[int, Body()],
) -> None:
    """Add a Trip for the specified Team of the specified Jam."""
    await jam.add_trip(team_id, datetime.now(), passes)


@router.post('/set-lead', tags=[JAMS_TAG])
async def set_lead(
    jam: GetJamByID,
    team_id: Annotated[int, Query(alias='teamId')],
    lead: Annotated[bool, Body()],
) -> None:
    """Set Lead for the specified Team of the specified Jam."""
    await jam.set_lead(team_id, datetime.now(), lead)


@router.post('/set-lost', tags=[JAMS_TAG])
async def set_lost(
    jam: GetJamByID,
    team_id: Annotated[int, Query(alias='teamId')],
    lost: Annotated[bool, Body()],
) -> None:
    """Set Lost for the specified Team of the specified Jam."""
    await jam.set_lost(team_id, datetime.now(), lost)


@router.post('/set-star-pass', tags=[JAMS_TAG])
async def set_star_pass(
    jam: GetJamByID,
    team_id: Annotated[int, Query(alias='teamId')],
    star_pass: Annotated[bool, Body()],
) -> None:
    """Set a Star Pass for the specified Team of the specified Jam."""
    await jam.set_star_pass(team_id, datetime.now(), star_pass)
