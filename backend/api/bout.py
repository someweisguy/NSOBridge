from datetime import datetime
from typing import Annotated, Final

from commands import Bout, Command, HistoryDepends
from commands.rulesets import wftda_2025
from fastapi import APIRouter, Body, Depends, Query
from models import DatabaseDepends, GenericBoutModel
from models.bout import BoutContext
from models.rulesets.wftda_2025 import BoutModel
from schemas import BoutSchema
from schemas.bout import BoutContextSchema
from sqlalchemy import select

from .roster import RosterDepends
from .series import SeriesDepends

router: Final[APIRouter] = APIRouter(prefix='/bout')


@router.get('', response_model=BoutSchema)
async def get_bout(
    db: DatabaseDepends, bout_id: Annotated[int, Query(alias='boutId')]
) -> GenericBoutModel:
    statement = select(GenericBoutModel).where(GenericBoutModel.id == bout_id)
    results = await db.execute(statement)
    return results.scalar_one()


BoutDepends = Annotated[GenericBoutModel, Depends(get_bout)]


@router.post('/wftda2025')
async def create_bout(
    db: DatabaseDepends,
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


@router.post('/setup-track')
async def setup_track(bout: BoutDepends, history: HistoryDepends) -> None:
    await history.execute(wftda_2025.BeginPeriod(bout))


@router.post('/clear-track')
async def clear_track(bout: BoutDepends, history: HistoryDepends) -> None:
    await history.execute(wftda_2025.EndPeriod(bout, datetime.now()))


@router.post('/start-jam')
async def start_jam(bout: BoutDepends, history: HistoryDepends) -> None:
    await history.execute(wftda_2025.StartJam(bout, datetime.now()))


@router.post('/stop-jam')
async def stop_jam(bout: BoutDepends, history: HistoryDepends) -> None:
    timestamp: datetime = datetime.now()
    cmd: list[Command] = []

    if bout.get_state() != 'jam':
        raise RuntimeError('There is no active Jam to stop')

    cmd.append(Bout.JamStop(bout, timestamp))
    cmd.append(Bout.JamCreate(bout, bout.teams[0], bout.teams[1]))

    # Execute the commands
    for command in cmd:
        await history.execute(command)


@router.post('/call-timeout')
async def call_timeout(bout: BoutDepends, history: HistoryDepends) -> None:
    await history.execute(Bout.TimeoutStart(bout, datetime.now()))


@router.post('/end-timeout')
async def end_timeout(bout: BoutDepends, history: HistoryDepends) -> None:
    await history.execute(Bout.TimeoutStop(bout, datetime.now()))


@router.post('/expected-start')
async def set_expected_start(
    bout: BoutDepends, timestamp: Annotated[datetime, Body()], history: HistoryDepends
) -> None:
    await history.execute(Bout.PeriodStartCountdown(bout, timestamp))


__all__ = ('router',)
