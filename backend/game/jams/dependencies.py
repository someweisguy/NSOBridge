from typing import Annotated, TypeAlias

from database import AsyncSessionDepends
from fastapi import Depends, Query
from sqlalchemy import select

from .models import JamModel


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
