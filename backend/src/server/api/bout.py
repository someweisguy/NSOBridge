from typing import Final
from uuid import UUID

from fastapi import APIRouter
from model import bouts
from model.bout import Bout

router: Final[APIRouter] = APIRouter(prefix='/bout')


@router.get('/')
def get(bout_id: UUID) -> dict:
    bout: Bout = bouts[bout_id]
    return {
        'gameNumber': None,
        'numJams': [len(bout.jams[0]), len(bout.jams[1])],
        'score': {
            'home': bout.get_score('home'),
            'away': bout.get_score('away'),
        },
    }


__all__ = ('router',)
