from typing import Final

from fastapi import APIRouter
from model import bouts, generate_bout_id
from model.bout import Bout

from server import updater
from server.responses import JSONable

router: Final[APIRouter] = APIRouter(prefix='/series')

SERIES_KEY: Final[updater.UpdateKey] = ('series',)


def render_series() -> JSONable:
    view: list[JSONable] = []
    for key, _ in bouts.items():
        view.append({'uuid': str(key), 'description': None})
    return view


@router.get('')
async def get() -> JSONable:
    return render_series()


@router.post('/add-bout')
async def add_bout() -> JSONable:
    bouts[generate_bout_id()] = Bout('WFTDA 2025')
    updater.post(SERIES_KEY)

    return {}


__all__ = ('router', 'render_series')
