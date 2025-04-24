from typing import Final
from uuid import uuid4

from fastapi import APIRouter, Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from model import bouts
from model.bout import Bout
from server import updater
from server.responses import APIResponse

router: Final[APIRouter] = APIRouter(prefix='/series')


@router.get('/')
def get() -> Response:
    view = {}
    for key, _ in bouts.items():
        view[key] = ''
    return view


@router.post('/add_bout')
def add_bout(request: Request) -> Response:
    print('adding bout')
    bouts[uuid4()] = Bout('WFTDA 2025')
    updater.post(('series',), get())

    return APIResponse()


__all__ = ('router',)
