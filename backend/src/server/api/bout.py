from datetime import datetime
from typing import Final

from fastapi import APIRouter
from model import bouts
from model.bout import Bout, JamId
from model.timer import Clock, Timeout

from server import updater
from server.responses import JSONable

router: Final[APIRouter] = APIRouter(prefix='/bout')


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
        'timeoutsRemaining': timeout.timeouts_remaining,
        'officialReviewsRemaining': timeout.official_reviews_remaining,
    }


@router.get('')
async def get(bout_id: str) -> JSONable:
    bout: Bout = bouts[bout_id]
    return {
        'gameNumber': None,
        'timer': {
            'clocks': {
                'intermission': render_clock(bout.timer.intermission_clock),
                'game': render_clock(bout.timer.game_clock),
                'lineup': render_clock(bout.timer.lineup_clock),
                'jam': render_clock(bout.timer.jam_clock),
                'timeout': render_clock(bout.timer.timeout_clock),
            },
            'timeouts': {
                'home': render_timeout(bout.timer.home),
                'away': render_timeout(bout.timer.away),
            },
        },
        'numJams': [len(bout.jams[0]), len(bout.jams[1])],
        'score': {
            'home': bout.get_total_score('home'),
            'away': bout.get_total_score('away'),
        },
    }


@router.post('/start-jam')
async def start_jam(bout_id: str, timestamp: datetime) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.start_jam(timestamp)
    updater.post(
        [updater.kf.bout(bout_id), updater.kf.jam(bout_id, *bout.get_current_jam_id())]
    )
    return {}


@router.post('/stop-jam')
async def stop_jam(bout_id: str, timestamp: datetime) -> JSONable:
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
