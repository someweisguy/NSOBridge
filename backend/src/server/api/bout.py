from typing import Final
from uuid import UUID

from fastapi import APIRouter
from model import bouts
from model.bout import Bout
from model.timer import Timer

router: Final[APIRouter] = APIRouter(prefix='/bout')


def render_clock(clock: Timer.Clock) -> dict:
    return {
        'startTimestamp': (
            clock.start_timestamp.isoformat() if clock.start_timestamp else None
        ),
        'elapsed': round(clock.elapsed.total_seconds() * 1000),
        'alarm': round(clock.alarm.total_seconds() * 1000) if clock.alarm else None,
    }


@router.get('/')
def get(bout_id: UUID) -> dict:
    bout: Bout = bouts[bout_id]
    return {
        'gameNumber': None,
        'clocks': {
            'game': render_clock(bout.timer.game_clock),
            'jam': render_clock(bout.timer.jam_clock),
            'timeout': None,  # TODO: add timeout clock
            'inIntermission': bout.timer.is_in_intermission,
            'inLineup': bout.timer.is_in_lineup,
        },
        'numJams': [len(bout.jams[0]), len(bout.jams[1])],
        'score': {
            'home': bout.get_score('home'),
            'away': bout.get_score('away'),
        },
    }


__all__ = ('router',)
