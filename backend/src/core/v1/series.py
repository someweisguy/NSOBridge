from typing import Final

from fastapi import APIRouter

from core import updater
from core.models.bout import Bout, bouts

router: Final[APIRouter] = APIRouter(prefix='/series')


@router.get('')
async def get() -> list:
    view: list = []
    for bout in bouts.values():
        view.append({'id': bout.id, 'description': None})
    return view


@router.post('/bout')
async def add_bout() -> None:
    Bout('WFTDA 2025')
    updater.post(updater.kf.series())


__all__ = ('router',)
