from datetime import datetime
from typing import Annotated, Final

from fastapi import APIRouter, Query
from model import bouts
from model.jam import Jam, StopReason, Team, TeamString
from pydantic import BaseModel

from server import updater
from server.responses import JSONable

router: Final[APIRouter] = APIRouter(prefix='/jam')


class JamIdentifier(BaseModel):
    bout_id: str
    period_num: int
    jam_num: int


type JamIdQuery = Annotated[JamIdentifier, Query()]


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
    jam_id: JamIdQuery,
    team: TeamString,
    points: int,
    valid_pass: bool,
) -> JSONable:
    now = datetime.now()
    jam: Jam = bouts[jam_id.bout_id].get_jam(jam_id.period_num, jam_id.jam_num)
    jam.add_trip(team, points, now, valid_pass)
    if valid_pass and not jam.lead_is_declared():
        jam.set_lead(team, True)
    updater.post(
        [
            updater.kf.bout(jam_id.bout_id),
            updater.kf.jam(jam_id.bout_id, jam_id.period_num, jam_id.jam_num),
        ]
    )


@router.delete('/delete-trip')
async def del_trip(jam_id: JamIdQuery, team: TeamString, trip_num: int) -> JSONable:
    jam: Jam = bouts[jam_id.bout_id].get_jam(jam_id.period_num, jam_id.jam_num)
    jam.del_trip(team, trip_num)
    updater.post(
        [
            updater.kf.bout(jam_id.bout_id),
            updater.kf.jam(jam_id.bout_id, jam_id.period_num, jam_id.jam_num),
        ]
    )


@router.put('/edit-trip')
async def edit_trip(
    jam_id: JamIdQuery,
    team: TeamString,
    trip_num: int,
    points: int | None,
    timestamp: datetime | None,
) -> JSONable:
    jam: Jam = bouts[jam_id.bout_id].get_jam(jam_id.period_num, jam_id.jam_num)
    points_are_updated: bool = jam[team].score.trips[trip_num].points != points
    jam.edit_trip(team, trip_num, points, timestamp)
    if points_are_updated:
        updater.post(updater.kf.bout(jam_id.bout_id))
    updater.post(updater.kf.jam(jam_id.bout_id, jam_id.period_num, jam_id.jam_num))


@router.put('/set-lead')
async def set_lead(jam_id: JamIdQuery, team: TeamString, value: bool) -> JSONable:
    jam: Jam = bouts[jam_id.bout_id].get_jam(jam_id.period_num, jam_id.jam_num)
    jam.set_lead(team, value)
    updater.post(updater.kf.jam(jam_id.bout_id, jam_id.period_num, jam_id.jam_num))


@router.put('/set-lost')
async def set_lost(jam_id: JamIdQuery, team: TeamString, value: bool) -> JSONable:
    jam: Jam = bouts[jam_id.bout_id].get_jam(jam_id.period_num, jam_id.jam_num)
    jam.set_lost(team, value)
    updater.post(updater.kf.jam(jam_id.bout_id, jam_id.period_num, jam_id.jam_num))


@router.put('/set-star-pass')
async def set_star_pass(
    jam_id: JamIdQuery, team: TeamString, value: int | None
) -> JSONable:
    jam: Jam = bouts[jam_id.bout_id].get_jam(jam_id.period_num, jam_id.jam_num)
    jam.set_star_pass(team, value)
    if value is not None:
        jam.set_lost(team, True)
    updater.post(updater.kf.jam(jam_id.bout_id, jam_id.period_num, jam_id.jam_num))


@router.put('/set-stop-reason')
async def set_stop_reason(jam_id: JamIdQuery, stop_reason: StopReason) -> None:
    jam: Jam = bouts[jam_id.bout_id].get_jam(jam_id.period_num, jam_id.jam_num)
    jam.set_stop_reason(stop_reason)
    updater.post(updater.kf.jam(jam_id.bout_id, jam_id.period_num, jam_id.jam_num))


__all__ = ('router',)
