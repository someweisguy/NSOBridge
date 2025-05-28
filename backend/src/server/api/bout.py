from datetime import datetime
from typing import Annotated, Final

from fastapi import APIRouter, Body, Query
from pydantic import BaseModel

from model import bouts
from model.bout import Bout
from model.jam import JamId
from model.timer import TeamOfficialString
from server import updater
from server.responses import JSONable

router: Final[APIRouter] = APIRouter(prefix='/bout')


@router.get('')
async def get(bout_id: str) -> Bout:
    return bouts[bout_id]


@router.post('/start-jam')
async def start_jam(
    bout_id: Annotated[str, Query()], timestamp: Annotated[datetime, Body()]
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.start_jam(timestamp)
    updater.post(
        [
            updater.kf.bout(bout_id),
            updater.kf.jam(bout_id, *bout.jams.get_latest_jam_id()),
        ]
    )
    return {}


@router.post('/stop-jam')
async def stop_jam(
    bout_id: Annotated[str, Query()], timestamp: Annotated[datetime, Body()]
) -> JSONable:
    bout: Bout = bouts[bout_id]
    stopped_jam_id: JamId = bout.jams.get_latest_jam_id()
    bout.stop_jam(timestamp)
    updater.post(
        [
            updater.kf.bout(bout_id),
            updater.kf.jam(bout_id, *stopped_jam_id),
            updater.kf.jam(bout_id, *bout.jams.get_latest_jam_id()),
        ]
    )
    return {}


@router.post('/call-timeout')
async def call_timeout(
    bout_id: Annotated[str, Query()], timestamp: Annotated[datetime, Body()]
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.call_timeout(timestamp)
    updater.post(
        [
            updater.kf.bout(bout_id),
        ]
    )
    return {}


class TimeoutParameters(BaseModel):
    is_review: bool
    team: TeamOfficialString | None
    details: str
    result: str
    retained: bool


@router.put('/timeout')
async def edit_timeout(
    bout_id: Annotated[str, Query()],
    timeout_id: Annotated[int, Query()],
    params: Annotated[TimeoutParameters, Body()],
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.timer.edit_timeout(  # TODO: make a bout-level method called edit_timeout
        timeout_id,
        is_review=params.is_review,
        team=params.team,
        details=params.details,
        result=params.result,
        retained=params.retained,
    )

    updater.post(
        [
            updater.kf.bout(bout_id),
        ]
    )
    return {}


@router.post('/end-timeout')
async def end_timeout(
    bout_id: Annotated[str, Query()], timestamp: Annotated[datetime, Body()]
) -> JSONable:
    bout: Bout = bouts[bout_id]
    bout.end_timeout(timestamp)
    updater.post(
        [
            updater.kf.bout(bout_id),
        ]
    )
    return {}


__all__ = ('router',)
