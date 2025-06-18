from datetime import datetime
from typing import Annotated, Final

from fastapi import APIRouter, Body, Query
from pydantic import BaseModel

from core import updater
from core.models.bout import Bout, BoutDepend
from core.models.rules import RulesetDepend
from core.models.rules.protocol import Rule

router: Final[APIRouter] = APIRouter(prefix='/bout')


@router.get('')
async def get(bout: BoutDepend) -> Bout:
    return bout


@router.post('/start-jam')
async def start_jam(
    ruleset: RulesetDepend, bout: BoutDepend, timestamp: Annotated[datetime, Body()]
):
    rule: Rule = ruleset.bout_timer.start_jam(bout, timestamp)
    rule.execute()
    updater.post(rule.get_update_keys())


# @router.post('/stop-jam')
# async def stop_jam(stop_jam: StopJamDepend, timestamp: Annotated[datetime, Body()]):
#     stop_jam(timestamp)
#     updater.post(stop_jam.update_keys)


# @router.post('/call-timeout')
# async def call_timeout(
#     call_timeout: CallTimeoutDepend, timestamp: Annotated[datetime, Body()]
# ):
#     call_timeout(timestamp)
#     updater.post(call_timeout.update_keys)


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


# @router.post('/end-timeout')
# async def end_timeout(
#     end_timeout: EndTimeoutDepend, timestamp: Annotated[datetime, Body()]
# ):
#     end_timeout(timestamp)
#     updater.post(end_timeout.update_keys)


__all__ = ('router',)
