from typing import Final
from uuid import uuid4

from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse

from model import bouts
from model.bout import Bout
from server import updater

from .getters import get_series_view

router: Final[APIRouter] = APIRouter()

@router.get('/series')
def get_series(request: Request) -> Response:
    view = get_series_view()
    
    return view

@router.post('/add_bout')
def add_bout(request: Request) -> Response:    
    bouts[uuid4()] = Bout('WFTDA 2025')
    updater.push('series')
    return JSONResponse()
    