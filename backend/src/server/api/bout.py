from typing import Final
from uuid import UUID

from fastapi import APIRouter
from model import bouts
from model.bout import Bout
from model.timer import Clock, Timeout

from server.responses import APIResponse, JSONable

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


@router.get('/')
def get(bout_id: UUID) -> APIResponse:
    bout: Bout = bouts[bout_id]
    return APIResponse(
        {
            'gameNumber': None,
            'timer': {
                'clocks': {
                    'game': render_clock(bout.timer.game_clock),
                    'jam': render_clock(bout.timer.jam_clock),
                    'timeout': render_clock(bout.timer.timeout_clock),
                    'inIntermission': bout.timer.is_in_intermission,
                    'inLineup': bout.timer.is_in_lineup,
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
    )


__all__ = ('router',)
