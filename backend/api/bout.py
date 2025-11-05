from datetime import datetime
from typing import TYPE_CHECKING, Annotated, Final

from core import UserDepends
from core.database import AsyncSessionDepends
from fastapi import APIRouter, Depends, Query
from models import GenericBoutModel
from models.bout import BoutContext
from models.rulesets.wftda_2025 import BoutModel
from schemas import BoutSchema
from schemas.bout import BoutContextSchema
from sqlalchemy import select

if TYPE_CHECKING:
    from core.history import Memento

router: Final[APIRouter] = APIRouter(prefix='/bout')


@router.get('', response_model=BoutSchema)
async def get_bout(
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
) -> GenericBoutModel:
    statement = select(GenericBoutModel).where(GenericBoutModel.id == bout_id)
    results = await session.execute(statement)
    bout: GenericBoutModel = results.scalar_one()
    return bout


BoutDepends = Annotated[GenericBoutModel, Depends(get_bout)]


@router.get('/context', response_model=BoutContextSchema)
async def get_bout_context(
    bout: Annotated[BoutModel, Depends(get_bout)],
) -> BoutContext:
    return bout.context


@router.post('/setup-track')  # TODO: rename endpoint to begin-period
async def begin_period(
    history: UserDepends,
    bout: BoutDepends,
) -> None:
    memento: Memento = bout.get_snapshot()
    bout.begin_period(datetime.now())
    history.push(memento)


@router.post('/clear-track')  # TODO: rename endpoint to end-period
async def end_period(
    history: UserDepends,
    bout: BoutDepends,
) -> None:
    memento: Memento = bout.get_snapshot()
    bout.end_period(datetime.now())
    history.push(memento)


@router.post('/start-jam')
async def start_jam(
    history: UserDepends,
    bout: BoutDepends,
) -> None:
    memento: Memento = bout.get_snapshot()
    bout.start_jam(datetime.now())
    history.push(memento)


@router.post('/stop-jam')
async def stop_jam(
    history: UserDepends,
    bout: BoutDepends,
) -> None:
    memento: Memento = bout.get_snapshot()
    bout.stop_jam(datetime.now())
    history.push(memento)


@router.post('/call-timeout')  # TODO: rename endpoint to start-timeout
async def call_timeout(
    history: UserDepends,
    bout: BoutDepends,
) -> None:
    memento: Memento = bout.get_snapshot()
    bout.start_timeout(datetime.now())
    history.push(memento)


@router.post(path='/end-timeout')  # TODO: rename endpoint to stop-timeout
async def end_timeout(
    history: UserDepends,
    bout: BoutDepends,
) -> None:
    memento: Memento = bout.get_snapshot()
    bout.stop_timeout(datetime.now())
    history.push(memento)


__all__ = ('router',)
