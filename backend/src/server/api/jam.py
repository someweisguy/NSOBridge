from datetime import datetime
from typing import Final

import updater
from fastapi import APIRouter
from model import bouts
from model.jam import Jam, Team, TeamType

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
async def get(bout_id: str, period_num: int, jam_num: int) -> JSONable:
    jam: Jam = bouts[bout_id].get_jam(period_num, jam_num)
    return {
        'start': jam.start_timestamp.isoformat() if jam.start_timestamp else None,
        'stop': jam.stop_timestamp.isoformat() if jam.stop_timestamp else None,
        'stopReason': jam.stop_reason,
        'home': render_team_jam(jam.home),
        'away': render_team_jam(jam.away),
    }


@router.post('/add-trip')
async def add_trip(
    bout_id: str,
    period_num: int,
    jam_num: int,
    team: TeamType,
    points: int,
    valid_pass: bool,
) -> JSONable:
    now = datetime.now()
    jam: Jam = bouts[bout_id].get_jam(period_num, jam_num)
    jam.add_trip(team, points, now, valid_pass)
    updater.post(
        [updater.kf.bout(bout_id), updater.kf.jam(bout_id, period_num, jam_num)]
    )


@router.delete('/delete-trip')
async def del_trip(
    bout_id: str, period_num: int, jam_num: int, team: TeamType, trip_num: int
) -> JSONable:
    jam: Jam = bouts[bout_id].get_jam(period_num, jam_num)
    jam.del_trip(team, trip_num)
    updater.post(
        [updater.kf.bout(bout_id), updater.kf.jam(bout_id, period_num, jam_num)]
    )


@router.put('/edit-trip')
async def edit_trip(
    bout_id: str,
    period_num: int,
    jam_num: int,
    team: TeamType,
    trip_num: int,
    points: int | None,
    timestamp: datetime | None,
) -> JSONable:
    jam: Jam = bouts[bout_id].get_jam(period_num, jam_num)
    points_are_updated: bool = jam[team].score.trips[trip_num].points != points
    jam.edit_trip(team, trip_num, points, timestamp)
    if points_are_updated:
        updater.post(updater.kf.bout(bout_id))
    updater.post(updater.kf.jam(bout_id, period_num, jam_num))


__all__ = ('router',)
