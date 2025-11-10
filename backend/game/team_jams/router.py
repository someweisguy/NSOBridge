from datetime import datetime
from typing import Final

from fastapi import APIRouter
from game.trip_events.models import TripEvent

from .dependencies import TeamJamDepends, get_team_jam
from .schemas import TeamJamSchema

router: Final[APIRouter] = APIRouter(prefix='/team-jam')
router.add_api_route('', get_team_jam, response_model=TeamJamSchema)


@router.post('add-trip')
async def add_trip(team_jam: TeamJamDepends) -> None:
    event: TripEvent = TripEvent(datetime.now(), passes=4)  # FIXME
    team_jam.add_trip(event)
