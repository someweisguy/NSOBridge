"""FastAPI routes associated with Jams."""

from typing import Annotated, Final
from uuid import UUID

from core.responses import APIResponse
from fastapi import APIRouter, Body, Query

from .dependencies import GetJam, _get_jam
from .schemas import JamSchema
from .types import StopReasonStr

JAMS_TAG = 'Jams'

router: Final[APIRouter] = APIRouter(prefix='/jam', tags=[JAMS_TAG])
router.add_api_route('', _get_jam, response_model=JamSchema | None)


@router.put('/setStopReason')
async def set_stop_reason(
    jam: GetJam, stop_reason: Annotated[StopReasonStr, Body()]
) -> APIResponse:
    """Set the stop reason for the desired Jam."""
    jam.stop_reason = stop_reason

    return APIResponse(None, jam.get_session())


@router.put('/setTripEventPasses')
async def set_trip_passes(
    jam: GetJam,
    team_num: Annotated[int, Query(alias='teamNum')],
    event_uuid: Annotated[UUID, Query(alias='eventUuid')],
    passes: Annotated[int, Body()],
) -> APIResponse:
    """Set the number of passes in a desired Trip Event."""
    for team_jam in jam.team_jams:
        if team_jam.team_num == team_num:
            break
    else:
        raise ValueError('TeamJam not found.')

    for event in team_jam.events:
        if event.uuid == event_uuid:
            break
    else:
        raise ValueError('TripEvent not found.')

    event.passes = passes

    return APIResponse(None, jam.get_session())


@router.delete('/tripEvent')
async def delete_trip_event(
    jam: GetJam,
    team_num: Annotated[int, Query(alias='teamNum')],
    event_uuid: Annotated[UUID, Query(alias='eventUuid')],
) -> APIResponse:
    """Delete the desired Trip Event."""
    for team_jam in jam.team_jams:
        if team_jam.team_num == team_num:
            break
    else:
        raise ValueError('TeamJam not found.')

    for event in team_jam.events:
        if event.uuid == event_uuid:
            break
    else:
        raise ValueError('TripEvent not found.')

    team_jam.events.remove(event)

    return APIResponse(None, jam.get_session())
