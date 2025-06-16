from typing import Annotated, Final

from fastapi import APIRouter, Body, Query

from core import updater
from core.models.bout import Bout, Jam, StopReason, TeamString, bouts

router: Final[APIRouter] = APIRouter(prefix='/jam')


@router.get('')
async def get(bout_id: str, period_num: int, jam_num: int) -> Jam:
    return bouts[bout_id].get_jam(period_num, jam_num)


@router.post('/trip')
async def add_trip(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    team: Annotated[TeamString, Query()],
    points: Annotated[int, Body()],
    valid_pass: Annotated[bool, Body()] = True,
) -> None:
    bout: Bout = bouts[bout_id]
    bout.scorekeeper.add_trip((period_num, jam_num), team, points, valid_pass)
    updater.post(
        [
            updater.kf.bout(bout_id),
            updater.kf.jam(bout_id, period_num, jam_num),
        ]
    )


@router.delete('/trip')
async def delete_trip(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    team: Annotated[TeamString, Query()],
    trip_num: Annotated[int, Query()],
) -> None:
    bout: Bout = bouts[bout_id]
    bout.jams.delete_trip((period_num, jam_num), team, trip_num)
    updater.post(
        [
            updater.kf.bout(bout_id),
            updater.kf.jam(bout_id, period_num, jam_num),
        ]
    )


@router.put('/trip')
async def edit_trip(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    team: Annotated[TeamString, Query()],
    trip_num: Annotated[int, Query()],
    points: Annotated[int, Body()],
) -> None:
    bout: Bout = bouts[bout_id]
    bout.jams.set_trip((period_num, jam_num), team, trip_num, points)
    updater.post(
        [updater.kf.bout(bout_id), updater.kf.jam(bout_id, period_num, jam_num)]
    )


@router.put('/lead')
async def set_lead(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    team: Annotated[TeamString, Query()],
    value: Annotated[bool, Body()],
) -> None:
    bout: Bout = bouts[bout_id]
    bout.jams.set_lead((period_num, jam_num), team, value)
    updater.post(updater.kf.jam(bout_id, period_num, jam_num))


@router.put('/lost')
async def set_lost(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    team: Annotated[TeamString, Query()],
    value: Annotated[bool, Body()],
) -> None:
    bout: Bout = bouts[bout_id]
    bout.jams.set_lost((period_num, jam_num), team, value)
    updater.post(updater.kf.jam(bout_id, period_num, jam_num))


@router.put('/star-pass')
async def set_star_pass(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    team: Annotated[TeamString, Query()],
    value: Annotated[int | None, Body()] = None,
) -> None:
    bout: Bout = bouts[bout_id]
    bout.jams.set_star_pass((period_num, jam_num), team, value)
    updater.post(updater.kf.jam(bout_id, period_num, jam_num))


@router.put('/stop-reason')
async def set_stop_reason(
    bout_id: Annotated[str, Query()],
    period_num: Annotated[int, Query()],
    jam_num: Annotated[int, Query()],
    stop_reason: Annotated[StopReason, Body()],
) -> None:
    bout: Bout = bouts[bout_id]
    bout.jams.set_stop_reason((period_num, jam_num), stop_reason)
    updater.post(updater.kf.jam(bout_id, period_num, jam_num))


__all__ = ('router',)
