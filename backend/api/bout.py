from datetime import datetime
from typing import Annotated, Final, TypeAlias

from core import UserDepends
from core.database import AsyncSessionDepends
from fastapi import APIRouter, Depends, Query, Request
from models.bout import BoutContext, GenericBoutModel
from schemas import BoutSchema
from schemas.bout import BoutContextSchema
from sqlalchemy import select

router: Final[APIRouter] = APIRouter(prefix='/bout')


@router.get('', response_model=BoutSchema)
async def get_bout(
    request: Request,
    history: UserDepends,
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
) -> GenericBoutModel:
    # Query the database for the desired Bout
    statement = select(GenericBoutModel).where(GenericBoutModel.id == bout_id)
    results = await session.execute(statement)
    bout: GenericBoutModel = results.scalar_one()

    # FIXME: stage mementos before committing to the history
    # Optionally take a snapshot of the Bout state and return the Bout
    if request.method != 'GET':
        history.push(bout.get_snapshot())
    return bout


BoutDepends: TypeAlias = Annotated[GenericBoutModel, Depends(get_bout)]


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
