from typing import Annotated, Final

from fastapi import APIRouter, Body, Query

from model import bouts
from model.bout import Bout
from model.jam import Jam, StopReason, TeamJam, TeamString
from server import updater
from server.responses import JSONable

router: Final[APIRouter] = APIRouter(prefix='/jam')


def render_team_jam(team_jam: TeamJam) -> JSONable:
    return {
        'score': {
            'lead': team_jam.score.lead,
            'lost': team_jam.score.lost,
            'starPass': team_jam.score.star_pass,
            'trips': [
                {'points': trip.points, 'timestamp': trip.timestamp.isoformat()}
                for trip in team_jam.score.trips
            ],
        }
    }


@router.get('')
async def get(bout_id: str, period_num: int, jam_num: int) -> JSONable:
    jam: Jam = bouts[bout_id].jams.get_jam((period_num, jam_num))
    return {
        'startTimestamp': jam.start_timestamp.isoformat()
        if jam.start_timestamp is not None
        else None,
        'elapsed': round(jam.elapsed.total_seconds() * 1000),
        'stopReason': jam.stop_reason,
        'home': render_team_jam(jam.home),
        'away': render_team_jam(jam.away),
    }


@router.post('/trip')
async def add_trip(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    team: Annotated[TeamString, Query()],
    points: Annotated[int, Body()],
    valid_pass: Annotated[bool, Body()] = True,
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.jams.add_trip((period_num, jam_num), team, points, valid_pass)
    updater.post(
        [
            updater.kf.bout(bout_id),
            updater.kf.jam(bout_id, period_num, jam_num),
        ]
    )


@router.delete('/trip')
async def delete_trip(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    team: Annotated[TeamString, Query()],
    trip_num: Annotated[int, Query()],
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.jams.delete_trip((period_num, jam_num), team, trip_num)
    updater.post(
        [
            updater.kf.bout(bout_id),
            updater.kf.jam(bout_id, period_num, jam_num),
        ]
    )


@router.put('/trip')
async def edit_trip(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    team: Annotated[TeamString, Query()],
    trip_num: Annotated[int, Query()],
    points: Annotated[int, Body()],
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.jams.set_trip((period_num, jam_num), team, trip_num, points)
    updater.post(
        [updater.kf.bout(bout_id), updater.kf.jam(bout_id, period_num, jam_num)]
    )


@router.put('/lead')
async def set_lead(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    team: Annotated[TeamString, Query()],
    value: Annotated[bool, Body()],
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.jams.set_lead((period_num, jam_num), team, value)
    updater.post(updater.kf.jam(bout_id, period_num, jam_num))


@router.put('/lost')
async def set_lost(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    team: Annotated[TeamString, Query()],
    value: Annotated[bool, Body()],
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.jams.set_lost((period_num, jam_num), team, value)
    updater.post(updater.kf.jam(bout_id, period_num, jam_num))


@router.put('/star-pass')
async def set_star_pass(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    team: Annotated[TeamString, Query()],
    value: Annotated[int | None, Body()] = None,
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.jams.set_star_pass((period_num, jam_num), team, value)
    updater.post(updater.kf.jam(bout_id, period_num, jam_num))


@router.put('/stop-reason')
async def set_stop_reason(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    stop_reason: Annotated[StopReason, Body()],
) -> None:
    bout: Bout = bouts[bout_id]
    bout.jams.set_stop_reason((period_num, jam_num), stop_reason)
    updater.post(updater.kf.jam(bout_id, period_num, jam_num))


__all__ = ('router',)
