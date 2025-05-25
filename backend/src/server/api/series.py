from typing import Final

from fastapi import APIRouter

from model import bouts, generate_bout_id
from model.bout import Bout
from server import updater
from server.responses import JSONable

router: Final[APIRouter] = APIRouter(prefix='/series')


@router.get('')
async def get() -> JSONable:
    view: list[JSONable] = []
    for key, _ in bouts.items():
        view.append({'id': key, 'description': None})
    return view


@router.post('/bout')
async def add_bout() -> JSONable:
    bouts[generate_bout_id()] = Bout('WFTDA 2025')
    updater.post(updater.kf.series())


__all__ = ('router',)
