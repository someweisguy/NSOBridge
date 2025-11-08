from datetime import datetime
from typing import Final

from fastapi import APIRouter
from game.bouts.dependencies import BoutDepends, get_bout

from .models import BoutContext
from .schemas import BoutContextSchema, BoutSchema

router: Final[APIRouter] = APIRouter(prefix='/bout')
router.add_api_route('', get_bout, response_model=BoutSchema)


@router.get('/context', response_model=BoutContextSchema)
async def get_bout_context(bout: BoutDepends) -> BoutContext:
    return bout.context


@router.post('/setup-track')  # TODO: rename endpoint to begin-period
async def begin_period(bout: BoutDepends) -> None:
    bout.begin_period(datetime.now())


@router.post('/clear-track')  # TODO: rename endpoint to end-period
async def end_period(bout: BoutDepends) -> None:
    bout.end_period(datetime.now())


@router.post('/start-jam')
async def start_jam(bout: BoutDepends) -> None:
    bout.start_jam(datetime.now())


@router.post('/stop-jam')
async def stop_jam(bout: BoutDepends) -> None:
    bout.stop_jam(datetime.now())


@router.post('/call-timeout')  # TODO: rename endpoint to start-timeout
async def call_timeout(bout: BoutDepends) -> None:
    bout.start_timeout(datetime.now())


@router.post(path='/end-timeout')  # TODO: rename endpoint to stop-timeout
async def end_timeout(bout: BoutDepends) -> None:
    bout.stop_timeout(datetime.now())


__all__ = ('router',)
