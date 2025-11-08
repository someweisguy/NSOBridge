from typing import Annotated, Final, TypeAlias

from database import AsyncSessionDepends
from fastapi import APIRouter, Depends, Query
from game import JamModel, TeamJamModel, TeamName
from schemas_old import JamSchema
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
        and JamModel.num == jam_num
    )
    results = await db.execute(statement)
    return results.scalar_one()


JamDepends: TypeAlias = Annotated[JamModel, Depends(get_jam)]


async def get_team_jam(
    jam: JamDepends, team: Annotated[TeamName, Query()]
) -> TeamJamModel:
    return jam[team]


__all__ = ('router',)
