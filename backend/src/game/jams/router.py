"""FastAPI routes associated with Jams."""

from typing import Annotated, Final

from core.db import CacheAPIRoute
from fastapi import APIRouter, Body

from .dependencies import GetJam, GetTripEvent, get_jam
from .models import Jam, TeamJam
from .schemas import JamSchema
from .types import StopReasonStr

JAMS_TAG = 'Jams'

router: Final[APIRouter] = APIRouter(
    prefix='/jam', route_class=CacheAPIRoute, tags=[JAMS_TAG]
)
router.add_api_route('', get_jam, response_model=JamSchema | None)


@router.put('/setStopReason', response_model=JamSchema)
async def set_stop_reason(
    jam: GetJam, stop_reason: Annotated[StopReasonStr, Body()]
) -> Jam:
    """Set the stop reason for the desired Jam."""
    jam.stop_reason = stop_reason

    return jam


@router.put('/trip/passes', response_model=JamSchema)
async def set_trip_passes(
    trip_event: GetTripEvent,
    passes: Annotated[int, Body()],
) -> Jam:
    """Set the value of the Trip Event."""
    trip_event.passes = passes
    return trip_event.team_jam.jam


@router.delete('/trip', response_model=JamSchema)
async def delete_trip_event(
    trip_event: GetTripEvent,
) -> Jam:
    """Delete the desired Trip Event."""
    team_jam: TeamJam = trip_event.team_jam
    team_jam.events.remove(trip_event)
    return team_jam.jam
