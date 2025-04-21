from typing import Final
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Request, Response
from fastapi.responses import JSONResponse

from model import bouts
from model.bout import Bout
from server.updater import generic_broadcast

router: Final[APIRouter] = APIRouter(prefix='/series')


def broadcast_series() -> None:
    generic_broadcast(('series',), get())


@router.get('/')
def get() -> Response:
    view = {}
    for key, _ in bouts.items():
        view[key] = ''
    return view


@router.post('/add_bout')
def add_bout(request: Request, tasks: BackgroundTasks) -> Response:
    bouts[uuid4()] = Bout('WFTDA 2025')
    tasks.add_task(broadcast_series)
    return JSONResponse()


__all__ = ('router',)
