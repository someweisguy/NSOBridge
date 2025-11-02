from datetime import datetime
from typing import Annotated, Final

from commands._jam import AddTrip
from core import UserDepends
from core.database import AsyncSessionDepends
from fastapi import APIRouter, Body, Depends, Query
from models import JamModel, TeamJamModel, TeamName
from models.jam import TripEventModel
from schemas import JamSchema
from sqlalchemy import select

router: Final[APIRouter] = APIRouter(prefix='/jam')


@router.get('', response_model=JamSchema)
async def get_jam(
    db: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
) -> JamModel:
    statement = select(JamModel).where(
        JamModel.bout_id == bout_id
        and JamModel.period == period_num
        and JamModel.jam == jam_num
    )
    results = await db.execute(statement)
    return results.scalar_one()


JamDepends = Annotated[JamModel, Depends(get_jam)]


async def get_team_jam(
    jam: JamDepends, team: Annotated[TeamName, Query()]
) -> TeamJamModel:
    return jam[team]


@router.post('/add-trip')
async def add_trip(jam: JamDepends, history: UserDepends) -> None:
    # TODO: make commands dataclasses
    # FIXME: remove this test endpoint
    trip: TripEventModel = TripEventModel(timestamp=datetime.now(), passes=4)
    team_jam: TeamJamModel = await jam.awaitable_attrs.home
    await history.do(AddTrip(team_jam, trip))


__all__ = ('router',)
