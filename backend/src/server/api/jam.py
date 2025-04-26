from typing import Final
from uuid import UUID

from fastapi import APIRouter
from model import bouts
from model.jam import Jam, JamId

router: Final[APIRouter] = APIRouter(prefix='/jam')


@router.get('/')
def get(bout_id: UUID, jam_id: JamId) -> dict:
    jam: Jam = bouts[bout_id].get_jam(jam_id)
    return {
        'start': jam.start_timestamp.isoformat() if jam.start_timestamp else None,
        'stop': jam.stop_timestamp.isoformat() if jam.stop_timestamp else None,
        'stopReason': jam.stop_reason,
    }


__all__ = ('router',)
