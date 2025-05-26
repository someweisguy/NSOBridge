from datetime import datetime
from typing import Annotated, Final

from fastapi import APIRouter, Body, Query
from pydantic import BaseModel

from model import bouts
from model.bout import Bout
from model.jam import JamId
from model.team import TeamString
from model.timer import Clock, TeamOfficialString, Timeout, TimeoutType, TimeReferee
from server import updater
from server.responses import JSONable

router: Final[APIRouter] = APIRouter(prefix='/bout')


def render_timer(alarm: Clock) -> JSONable:
    return {
        'startTimestamp': alarm.start_timestamp.isoformat()
        if alarm.start_timestamp is not None
        else None,
        'elapsed': round(alarm.elapsed.total_seconds() * 1000),
        'alarm': round(alarm.alarm.total_seconds() * 1000),
    }


def render_time_referee(referee: TimeReferee) -> JSONable:
    return {
        'clocks': {
            'intermission': render_timer(referee.clocks.intermission),
            'game': render_timer(referee.clocks.game),
            'jam': render_timer(referee.clocks.jam),
            'lineup': render_timer(referee.clocks.lineup),
        },
        'timeouts': [
            {
                'periodNum': t.period_num,
                'jamNum': t.jam_num,
                'periodClockElapsed': round(
                    t.period_clock_elapsed.total_seconds() * 1000
                ),
                'startTimestamp': t.start_timestamp.isoformat()
                if t.start_timestamp is not None
                else None,
                'duration': round(t.duration.total_seconds() * 1000),
                'type': t.type,
                'team': t.team,
                'details': t.details,
                'result': t.result,
                'retained': t.retained,
            }
            for t in referee.timeouts
        ],
    }


def render_team(bout: Bout, team: TeamString) -> JSONable:
    return {
        'name': bout[team].name,
        'mnemonic': bout[team].mnemonic,
        'score': bout.jams.get_total_score(team),
        'clockStops': {
            'timeout': bout[team].clock_stops.timeout,
            'review': bout[team].clock_stops.review,
        },
    }


@router.get('')
async def get(bout_id: str) -> JSONable:
    bout: Bout = bouts[bout_id]
    return {
        'gameNumber': None,
        'timer': render_time_referee(bout.timer),
        'home': render_team(bout, 'home'),
        'away': render_team(bout, 'away'),
        'numJams': bout.jams.get_lens(),
    }


@router.post('/start-jam')
async def start_jam(
    bout_id: Annotated[str, Query()], timestamp: Annotated[datetime, Body()]
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.start_jam(timestamp)
    updater.post(
        [
            updater.kf.bout(bout_id),
            updater.kf.jam(bout_id, *bout.jams.get_latest_jam_id()),
        ]
    )
    return {}


@router.post('/stop-jam')
async def stop_jam(
    bout_id: Annotated[str, Query()], timestamp: Annotated[datetime, Body()]
) -> JSONable:
    bout: Bout = bouts[bout_id]
    stopped_jam_id: JamId = bout.jams.get_latest_jam_id()
    bout.stop_jam(timestamp)
    updater.post(
        [
            updater.kf.bout(bout_id),
            updater.kf.jam(bout_id, *stopped_jam_id),
            updater.kf.jam(bout_id, *bout.jams.get_latest_jam_id()),
        ]
    )
    return {}


@router.post('/call-timeout')
async def call_timeout(
    bout_id: Annotated[str, Query()], timestamp: Annotated[datetime, Body()]
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.call_timeout(timestamp)
    updater.post(
        [
            updater.kf.bout(bout_id),
        ]
    )
    return {}


class TimeoutParameters(BaseModel):
    type: TimeoutType
    team: TeamOfficialString
    details: str
    result: str
    retained: bool


@router.put('/edit-timeout')
async def edit_timeout(
    bout_id: Annotated[str, Query()],
    timeout_id: Annotated[int, Query()],
    params: Annotated[TimeoutParameters, Body()],
) -> JSONable:
    if params.type == 'review' and params.team == 'official':
        raise RuntimeError('An Official Review must be called by a Team') from None

    bout: Bout = bouts[bout_id]
    timeout: Timeout = bout.timer.timeouts[timeout_id]

    timeout.type = params.type
    timeout.team = params.team
    timeout.details = params.details
    timeout.result = params.details
    timeout.retained = params.retained

    updater.post(
        [
            updater.kf.bout(bout_id),
        ]
    )
    return {}


@router.post('/end-timeout')
async def end_timeout(
    bout_id: Annotated[str, Query()], timestamp: Annotated[datetime, Body()]
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.end_timeout(timestamp)
    updater.post(
        [
            updater.kf.bout(bout_id),
        ]
    )
    return {}


__all__ = ('router',)
