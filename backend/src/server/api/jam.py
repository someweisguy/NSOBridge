from typing import Final
from uuid import UUID

from fastapi import APIRouter
from model import bouts
from model.jam import Jam, Team

from server.responses import JSONable

router: Final[APIRouter] = APIRouter(prefix='/jam')


def render_team_jam(team: Team) -> dict[str, JSONable]:
    return {
        'score': {
            'lead': team.score.lead,
            'lost': team.score.lost,
            'starPass': team.score.star_pass,
            'trips': [
                {'points': trip.points, 'timestamp': trip.timestamp.isoformat()}
                for trip in team.score.trips
            ],
        }
    }


@router.get('')
async def get(bout_id: UUID, period_num: int, jam_num: int) -> JSONable:
    jam: Jam = bouts[bout_id].get_jam(period_num, jam_num)
    return {
        'start': jam.start_timestamp.isoformat() if jam.start_timestamp else None,
        'stop': jam.stop_timestamp.isoformat() if jam.stop_timestamp else None,
        'stopReason': jam.stop_reason,
        'home': render_team_jam(jam.home),
        'away': render_team_jam(jam.away),
    }


__all__ = ('router',)
