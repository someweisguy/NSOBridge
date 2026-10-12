"""FastAPI routes associated with Jams."""

from typing import Annotated, Final

from core.app import update_model
from core.db import CacheAPIRoute
from fastapi import APIRouter, Body

from .dependencies import GetJam, GetTripEvent, get_jam
from .models import Jam, TeamJam
from .schemas import JamSchema, UpdateJamSchema, UpdateTripEventSchema

JAMS_TAG = 'Jams'

router: Final[APIRouter] = APIRouter(
    prefix='/jam', route_class=CacheAPIRoute, tags=[JAMS_TAG]
)
router.add_api_route('', get_jam, response_model=JamSchema | None)


@router.put('', response_model=JamSchema)
async def update_jam(jam: GetJam, updates: Annotated[UpdateJamSchema, Body()]) -> Jam:
    """Update a Jam."""
    update_model(jam, updates)
    return jam


@router.put('/tripEvent', response_model=JamSchema)
async def update_trip(
    trip_event: GetTripEvent, updates: Annotated[UpdateTripEventSchema, Body()]
) -> Jam:
    """Update a Trip Event."""
    update_model(trip_event, updates)
    return trip_event.team_jam.jam


@router.delete('/tripEvent', response_model=JamSchema)
async def delete_trip_event(
    trip_event: GetTripEvent,
) -> Jam:
    """Delete a Trip Event."""
    team_jam: TeamJam = trip_event.team_jam
    team_jam.events.remove(trip_event)
    return team_jam.jam
