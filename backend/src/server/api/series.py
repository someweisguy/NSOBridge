from typing import Final
from uuid import uuid4

from fastapi import APIRouter, Response
from model import bouts
from model.bout import Bout

from server import updater
from server.responses import APIResponse, JSONable

router: Final[APIRouter] = APIRouter(prefix='/series')

SERIES_KEY: Final[updater.UpdateKey] = ('series',)


def render_series() -> JSONable:
    view: list[JSONable] = []
    for key, _ in bouts.items():
        view.append({'uuid': str(key), 'description': None})
    return view


@router.get('/')
def get() -> APIResponse:
    return APIResponse(render_series())


@router.post('/add_bout')
def add_bout() -> Response:
    print('adding bout')
    bouts[uuid4()] = Bout('WFTDA 2025')
    updater.post(SERIES_KEY)

    return APIResponse()


__all__ = ('router', 'render_series')
