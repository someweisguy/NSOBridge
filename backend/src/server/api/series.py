from typing import Final
from uuid import uuid4

from fastapi import APIRouter, Response
from model import bouts
from model.bout import Bout

from server import updater
from server.responses import APIResponse, JSONable

router: Final[APIRouter] = APIRouter(prefix='/series')


@router.get('/')
def get() -> JSONable:
    view: list[JSONable] = []
    for key, _ in bouts.items():
        view.append({'uuid': str(key), 'description': None})
    return view


@router.post('/add_bout')
def add_bout() -> Response:
    print('adding bout')
    bouts[uuid4()] = Bout('WFTDA 2025')
    updater.post(('series',), get())

    return APIResponse()


__all__ = ('router',)
