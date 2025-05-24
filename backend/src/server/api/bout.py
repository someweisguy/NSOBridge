from datetime import datetime
from typing import Annotated, Final

from fastapi import APIRouter, Body, Query
from model import bouts
from model.bout import Bout, JamId
from model.timer import Clock, TeamString, Timeout

from server import updater
from server.responses import JSONable

router: Final[APIRouter] = APIRouter(prefix='/bout')


def render_team(bout: Bout, team: TeamString) -> JSONable:
    return {
        'name': None,
        'score': bout.get_total_score(team),
        'timeoutsRemaining': bout[team].timeouts_remaining,
        'officialReviewsRemaining': bout[team].official_reviews_remaining,
    }


def render_clock(clock: Clock) -> JSONable:
    return {
        'startTimestamp': (
            clock.start_timestamp.isoformat() if clock.start_timestamp else None
        ),
        'elapsed': round(clock.elapsed.total_seconds() * 1000),
        'alarm': round(clock.alarm.total_seconds() * 1000) if clock.alarm else None,
    }


def render_timeout(timeout: Timeout) -> JSONable:
    return {
        'type': timeout.type,
        'team': timeout.team,
        'periodNumber': timeout.period_number,
        'jamNumber': timeout.jam_number,
        'periodClockElapsed': round(
            timeout.period_clock_elapsed.total_seconds() * 1000
        ),
        'duration': (
            round(timeout.duration.total_seconds() * 1000) if timeout.duration else None
        ),
        'details': timeout.details,
        'result': timeout.result,
    }


@router.get('')
async def get(bout_id: str) -> JSONable:
    bout: Bout = bouts[bout_id]
    return {
        'gameNumber': None,
        'home': render_team(bout, 'home'),
        'away': render_team(bout, 'away'),
        'timer': {
            'clocks': {
                'intermission': render_clock(bout.timer.intermission_clock),
                'game': render_clock(bout.timer.game_clock),
                'lineup': render_clock(bout.timer.lineup_clock),
                'jam': render_clock(bout.timer.jam_clock),
                'timeout': render_clock(bout.timer.timeout_clock),
            },
            'timeouts': [render_timeout(t) for t in bout.timer.timeouts],
        },
        'numJams': [len(bout.jams[0]), len(bout.jams[1])],
    }


@router.post('/start-jam')
async def start_jam(
    bout_id: Annotated[str, Query()], timestamp: Annotated[datetime, Body()]
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.start_jam(timestamp)
    updater.post(
        [updater.kf.bout(bout_id), updater.kf.jam(bout_id, *bout.get_current_jam_id())]
    )
    return {}


@router.post('/stop-jam')
async def stop_jam(
    bout_id: Annotated[str, Query()], timestamp: Annotated[datetime, Body()]
) -> JSONable:
    bout: Bout = bouts[bout_id]
    stopped_jam_id: JamId = bout.get_current_jam_id()
    bout.stop_jam(timestamp)
    updater.post(
        [
            updater.kf.bout(bout_id),
            updater.kf.jam(bout_id, *stopped_jam_id),
            updater.kf.jam(bout_id, *bout.get_current_jam_id()),
        ]
    )
    return {}


__all__ = ('router',)
