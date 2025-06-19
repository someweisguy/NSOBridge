from datetime import datetime
from typing import Annotated, Final

from fastapi import APIRouter, Body

from core import updater
from core.models import ModelKey
from core.models.bout import Bout, BoutDepend, RefereeDepend

router: Final[APIRouter] = APIRouter(prefix='/bout')


@router.get('')
async def get(bout: BoutDepend) -> Bout:
    return bout


@router.post('/start-jam')
async def start_jam(
    referee: RefereeDepend, bout: BoutDepend, timestamp: Annotated[datetime, Body()]
):
    updated_model_keys: ModelKey = referee.start_jam(bout, timestamp)
    updater.post(updated_model_keys)


@router.post('/stop-jam')
async def stop_jam(
    referee: RefereeDepend, bout: BoutDepend, timestamp: Annotated[datetime, Body()]
):
    updated_model_keys: ModelKey = referee.stop_jam(bout, timestamp)
    updater.post(updated_model_keys)


@router.post('/call-timeout')
async def call_timeout(
    referee: RefereeDepend, bout: BoutDepend, timestamp: Annotated[datetime, Body()]
) -> None:
    updated_model_keys: ModelKey = referee.call_timeout(bout, timestamp)
    updater.post(updated_model_keys)


# class TimeoutParameters(BaseModel):
#     is_review: bool
#     team: TeamOfficialString | None
#     details: str
#     result: str
#     retained: bool


# @router.put('/timeout')
# async def edit_timeout(
#     bout_id: Annotated[str, Query()],
#     timeout_id: Annotated[int, Query()],
#     params: Annotated[TimeoutParameters, Body()],
# ):
#     bout: Bout = bouts[bout_id]
#     bout.jam_timer.edit_timeout(  # TODO: make a bout-level method called edit_timeout
#         timeout_id,
#         is_review=params.is_review,
#         team=params.team,
#         details=params.details,
#         result=params.result,
#         retained=params.retained,
#     )

#     updater.post(
#         [
#             updater.kf.bout(bout_id),
#         ]
#     )


@router.post('/end-timeout')
async def end_timeout(
    referee: RefereeDepend, bout: BoutDepend, timestamp: Annotated[datetime, Body()]
) -> None:
    updated_model_keys: ModelKey = referee.end_timeout(bout, timestamp)
    updater.post(updated_model_keys)


__all__ = ('router',)
