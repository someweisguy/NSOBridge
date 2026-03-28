"""FastAPI routes associated with Bouts."""

from datetime import datetime, timedelta
from typing import Annotated, Final, Sequence

from core import APIResponse
from db import GetAsyncSession
from fastapi import APIRouter, Body
from sqlalchemy import Result, Select, select
from sqlalchemy.orm.attributes import flag_dirty

from .dependencies import GetBout, _get_bout
from .models import BaseBout
from .schemas import BoutSchema

BOUTS_TAG = 'Bouts'

router: Final[APIRouter] = APIRouter(prefix='/bout', tags=[BOUTS_TAG])
router.add_api_route('', _get_bout, response_model=BoutSchema)


@router.get('/allBouts', response_model=list[BoutSchema])
async def get_all_bouts(session: GetAsyncSession) -> Sequence[BaseBout]:
    """Get all the Bouts in the database."""
    statement: Select[tuple[BaseBout]] = select(BaseBout)
    results: Result[tuple[BaseBout]] = await session.execute(statement)

    return results.scalars().all()


@router.post(path='/setClockElapsed')
async def set_clock_elapsed(
    bout: GetBout, elapsed: Annotated[int, Body(alias='elapsed')]
) -> APIResponse:
    """Set the amount of time that has elapsed on the Bout clock."""
    if bout.clock.is_running():
        bout.clock.start_timestamp = datetime.now()
    bout.clock.elapsed = timedelta(milliseconds=elapsed)
    flag_dirty(bout)  # Clock has no association with Bout
    return APIResponse(None, cache=await bout.get_updates())


@router.post(path='/setClockAlarm')
async def set_clock_alarm(
    bout: GetBout, alarm: Annotated[int, Body(alias='alarm')]
) -> APIResponse:
    """Set the alarm time on the Bout clock."""
    if bout.clock.alarm.total_seconds() != alarm / 1000:
        bout.clock.alarm = timedelta(milliseconds=alarm)
        flag_dirty(bout)  # Clock has no association with Bout
    return APIResponse(None, cache=await bout.get_updates())


@router.post(path='/setClockIsRunning')
async def set_clock_is_running(
    bout: GetBout, is_running: Annotated[bool, Body(alias='isRunning')]
) -> APIResponse:
    """Pause or unpause the Bout clock."""
    now: datetime = datetime.now()
    if bout.clock.is_running() != is_running:
        if is_running:
            bout.clock.start(now)
        else:
            bout.clock.stop(now)
        flag_dirty(bout)  # Clock has no association with Bout

    return APIResponse(None, cache=await bout.get_updates())


__all__ = ('router',)
