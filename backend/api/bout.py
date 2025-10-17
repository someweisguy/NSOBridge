from datetime import datetime
from typing import Annotated, Final

from commands import Bout, Command, HistoryDepends
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
    if bout.get_state() != 'stopped':
        raise RuntimeError('The Bout cannot be started now')

    cmd: list[Command] = []

    cmd.append(Bout.Jam.Create(bout, bout.teams[0], bout.teams[1], True))
    cmd.append(Bout.SetIsRunning(bout, True))

    if bout.get_period() < 2:  # TODO: NUM_PERIODS
        cmd.append(Bout.Clock.Reset(bout.clock))

    # Execute the commands
    for command in cmd:
        history.execute(command)


@router.post('/clear-track')
async def clear_track(bout: BoutDepends, history: HistoryDepends) -> None:
    timestamp: datetime = datetime.now()
    cmd: list[Command] = []

    if bout.is_running and bout.get_state() != 'lineup':
        raise RuntimeError('The Bout cannot be stopped now')

    if not bout.is_running and bout.get_period() >= 2:  # TODO: NUM_PERIODS
        # TODO: Figure out a method to forfeit a Bout
        cmd.append(Bout.SetIsFinal(bout, True))
    elif not bout.is_running:
        raise RuntimeError('The Bout cannot be ended yet')

    # End the Period
    if bout.clock.is_running():
        cmd.append(Bout.Clock.Stop(bout.clock, timestamp))
    cmd.append(Bout.SetIsRunning(bout, False))

    # Execute the commands
    for command in cmd:
        history.execute(command)


@router.post('/start-jam')
async def start_jam(bout: BoutDepends, history: HistoryDepends) -> None:
    timestamp: datetime = datetime.now()
    cmd: list[Command] = []
    if not bout.is_running:
        await setup_track(bout, history)  # Handle immediate game start
    if bout.get_state() != 'lineup':
        raise RuntimeError('The Jam cannot be started now')

    cmd.append(Bout.Jam.Start(bout, timestamp))
    if not bout.clock.is_running() and bout.get_period() < 2:  # TODO: NUM_PERIODS
        cmd.append(Bout.Clock.Start(bout.clock, timestamp))

    # Execute the commands
    for command in cmd:
        history.execute(command)


@router.post('/stop-jam')
async def stop_jam(bout: BoutDepends, history: HistoryDepends) -> None:
    timestamp: datetime = datetime.now()
    cmd: list[Command] = []

    if bout.get_state() != 'jam':
        raise RuntimeError('There is no active Jam to stop')

    cmd.append(Bout.Jam.Stop(bout, timestamp))
    cmd.append(Bout.Jam.Create(bout, bout.teams[0], bout.teams[1]))

    # Execute the commands
    for command in cmd:
        history.execute(command)


@router.post('/call-timeout')
async def call_timeout(bout: BoutDepends, history: HistoryDepends) -> None:
    history.execute(Bout.Timeout.Start(bout, datetime.now()))


@router.post('/end-timeout')
async def end_timeout(bout: BoutDepends, history: HistoryDepends) -> None:
    history.execute(Bout.Timeout.Stop(bout, datetime.now()))


@router.post('/expected-start')
async def set_expected_start(
    bout: BoutDepends, timestamp: Annotated[datetime, Body()], history: HistoryDepends
) -> None:
    history.execute(Bout.SetPeriodStartTimestamp(bout, timestamp))


__all__ = ('router',)
