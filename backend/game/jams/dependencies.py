from typing import TYPE_CHECKING, Annotated, TypeAlias

from database import AsyncSessionDepends
from fastapi import Depends, Query
from h11._events import Request
from sqlalchemy import select
from users.dependencies import UserDepends

from .models import JamModel

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


async def get_jam(
    request: Request,
    user: UserDepends,
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
) -> JamModel:
    statement: Select[tuple[JamModel]] = (
        select(JamModel)
        .where(JamModel.bout_id == bout_id)
        .where(JamModel.period == period_num)
        .where(JamModel.num == jam_num)
    )
    results: Result[tuple[JamModel]] = await session.execute(statement)
    jam: JamModel = results.scalar_one()

    # Optionally take a snapshot of the state and return the Jam
    if request.method != 'GET':
        user.stage(jam.get_snapshot())
    return jam


JamDepends: TypeAlias = Annotated[JamModel, Depends(get_jam)]
