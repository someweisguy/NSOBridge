from datetime import datetime
from typing import Annotated, Final

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from core import updater
from core.models import Gettable
from core.models.bout import Bout, BoutDepend, RefereeDepend
from core.models.game import get_bout, get_db
from core.models.game.bout import SQLBout
from sqlalchemy.orm import Query
from sqlalchemy.orm import Session

router: Final[APIRouter] = APIRouter(prefix='/bout')


DatabaseDepends = Annotated[Session, Depends(get_db)]
BoutDepends = Annotated[SQLBout, Depends(get_bout)]


@router.get('')
async def get(bout: BoutDepend) -> Bout:
    return bout


@router.post('/post/{event}')
async def post_event(
    event: str, db: DatabaseDepends, bout: BoutDepends
) -> JSONResponse:
    ruleset: str = bout.ruleset
    return {}


@router.post('/start-jam')
async def start_jam(referee: RefereeDepend, bout: BoutDepend):
    timestamp: datetime = datetime.now()
    updated_models: tuple[Gettable, ...] = referee.start_jam(bout, timestamp)
    updater.post(updated_models)


@router.post('/stop-jam')
async def stop_jam(referee: RefereeDepend, bout: BoutDepend):
    timestamp: datetime = datetime.now()
    updated_models: tuple[Gettable, ...] = referee.stop_jam(bout, timestamp)
    updater.post(updated_models)


@router.post('/call-timeout')
async def call_timeout(referee: RefereeDepend, bout: BoutDepend) -> None:
    timestamp: datetime = datetime.now()
    updated_models: tuple[Gettable, ...] = referee.call_timeout(bout, timestamp)
    updater.post(updated_models)


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
async def end_timeout(referee: RefereeDepend, bout: BoutDepend) -> None:
    timestamp: datetime = datetime.now()
    updated_models: tuple[Gettable, ...] = referee.end_timeout(bout, timestamp)
    updater.post(updated_models)


@router.post('/end-period')
async def end_period(referee: RefereeDepend, bout: BoutDepend) -> None:
    timestamp: datetime = datetime.now()
    updated_models: tuple[Gettable, ...] = referee.end_period(bout, timestamp)
    updater.post(updated_models)


__all__ = ('router',)
