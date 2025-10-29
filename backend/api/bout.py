from datetime import datetime
from typing import Annotated, Final

from commands import Bout, Command, HistoryDepends
from commands.rulesets import wftda_2025
from fastapi import APIRouter, Body, Depends, Query
from models import AsyncSessionDepends, GenericBoutModel
from models.bout import BoutContext
from models.rulesets.wftda_2025 import BoutModel
from schemas import BoutSchema
from schemas.bout import BoutContextSchema
from sqlalchemy import select

from .roster import RosterDepends
from .series import SeriesDepends

router: Final[APIRouter] = APIRouter(prefix='/bout')


# TODO: Remove this
@router.get('', response_model=BoutSchema)
async def get_bout(
    db: AsyncSessionDepends, bout_id: Annotated[int, Query(alias='boutId')]
) -> GenericBoutModel:
    statement = select(GenericBoutModel).where(GenericBoutModel.id == bout_id)
    results = await db.execute(statement)
    return results.scalar_one()


# TODO: remove this
BoutDepends = Annotated[GenericBoutModel, Depends(get_bout)]


@router.post('/wftda2025')
async def create_bout(
    db: AsyncSessionDepends,
    series: SeriesDepends,
    rosters: RosterDepends,
    order: Annotated[int, Body()] = 0,
) -> None:
    home, away = rosters
    bout = BoutModel(series, home, away)
    db.add(bout)


@router.get('/context', response_model=BoutContextSchema)
async def get_bout_context(
    bout: Annotated[BoutModel, Depends(get_bout)],
) -> BoutContext:
    return bout.context


@router.post('/begin-period')
async def begin_period(
    history: HistoryDepends,
    command: Annotated[Command, Depends(wftda_2025.BeginPeriod)],
) -> None:
    await history.do(command)


@router.post('/end-period')
async def end_period(
    history: HistoryDepends,
    command: Annotated[Command, Depends(wftda_2025.EndPeriod)],
) -> None:
    await history.do(command)


@router.post('/start-jam')
async def start_jam(
    history: HistoryDepends,
    command: Annotated[Command, Depends(wftda_2025.StartJam)],
) -> None:
    await history.do(command)


@router.post('/stop-jam')
async def stop_jam(
    history: HistoryDepends,
    command: Annotated[Command, Depends(wftda_2025.StopJam)],
) -> None:
    await history.do(command)


@router.post('/call-timeout')
async def call_timeout(
    history: HistoryDepends,
    command: Annotated[Command, Depends(wftda_2025.StartTimeout)],
) -> None:
    await history.do(command)


@router.post(path='/end-timeout')
async def end_timeout(
    history: HistoryDepends,
    command: Annotated[Command, Depends(wftda_2025.StopTimeout)],
) -> None:
    await history.do(command)


# TODO: Move this API to a different module
@router.post('/expected-start')
async def set_expected_start(
    bout: BoutDepends, timestamp: Annotated[datetime, Body()], history: HistoryDepends
) -> None:
    await history.do(Bout.SetPeriodCountdown(bout, timestamp))


__all__ = ('router',)
