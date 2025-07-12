from datetime import datetime
from typing import Annotated, Final

from fastapi import APIRouter, Body

from core import updater
from core.models import Gettable
from core.models.bout import Jam, JamDepend, RefereeDepend, StopReason, TeamJamDepend

router: Final[APIRouter] = APIRouter(prefix='/jam')


@router.get('')
async def get(jam: JamDepend) -> Jam:
    return jam


@router.post('/trip')
async def add_trip(
    referee: RefereeDepend, team_jam: TeamJamDepend, passes: Annotated[int, Body()]
) -> None:
    timestamp: datetime = datetime.now()
    updated_models: tuple[Gettable, ...] = referee.add_trip(team_jam, passes, timestamp)
    updater.post(updated_models)


# @router.delete('/trip')
# async def delete_trip(
#     bout_id: Annotated[str, Query()],
#     period_num: Annotated[int, Query()],
#     jam_num: Annotated[int, Query()],
#     # team: Annotated[TeamString, Query()],
#     trip_num: Annotated[int, Query()],
# ) -> None:
#     bout: Bout = bouts[bout_id]
#     bout.jams.delete_trip((period_num, jam_num), team, trip_num)
#     updater.post(
#         [
#             updater.kf.bout(bout_id),
#             updater.kf.jam(bout_id, period_num, jam_num),
#         ]
#     )


# @router.put('/trip')
# async def edit_trip(
#     bout_id: Annotated[str, Query()],
#     period_num: Annotated[int, Query()],
#     jam_num: Annotated[int, Query()],
#     # team: Annotated[TeamString, Query()],
#     trip_num: Annotated[int, Query()],
#     points: Annotated[int, Body()],
# ) -> None:
#     bout: Bout = bouts[bout_id]
#     bout.jams.set_trip((period_num, jam_num), team, trip_num, points)
#     updater.post(
#         [updater.kf.bout(bout_id), updater.kf.jam(bout_id, period_num, jam_num)]
#     )


@router.post('/lead')
async def set_lead(
    referee: RefereeDepend, team_jam: TeamJamDepend, lead: Annotated[bool, Body()]
) -> None:
    updated_models: tuple[Gettable, ...] = referee.set_lead(team_jam, lead)
    updater.post(updated_models)


@router.post('/lost')
async def set_lost(
    referee: RefereeDepend, team_jam: TeamJamDepend, lost: Annotated[bool, Body()]
) -> None:
    updated_models: tuple[Gettable, ...] = referee.set_lost(team_jam, lost)
    updater.post(updated_models)


@router.post('/star-pass')
async def set_star_pass(
    referee: RefereeDepend, team_jam: TeamJamDepend, star_pass: Annotated[bool, Body()]
) -> None:
    updated_models: tuple[Gettable, ...] = referee.set_star_pass(team_jam, star_pass)
    updater.post(updated_models)


@router.post('/stop-reason')
async def set_stop_reason(
    jam: JamDepend, stop_reason: Annotated[StopReason, Body()]
) -> None:
    pass  # TODO


__all__ = ('router',)
