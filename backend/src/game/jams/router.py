"""FastAPI routes associated with Jams."""

from typing import Annotated, Final

from core import APIResponse
from fastapi import APIRouter, Body

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

    return APIResponse(None, cache=await jam.get_updates())
