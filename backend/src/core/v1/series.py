from typing import Final

from fastapi import APIRouter

from model import bouts, generate_bout_id
from model.bout import Bout
from core import updater
from core.responses import JSONable

router: Final[APIRouter] = APIRouter(prefix='/series')


@router.get('')
async def get() -> JSONable:
    view: list[JSONable] = []
    for bout in bouts:
        view.append({'id': bout.id, 'description': None})
    return view


@router.post('/bout')
async def add_bout() -> JSONable:
    bouts[generate_bout_id()] = Bout('WFTDA 2025')
    updater.post(updater.kf.series())


__all__ = ('router',)
