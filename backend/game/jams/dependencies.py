from typing import TYPE_CHECKING, Annotated, Literal, TypeAlias, overload

from database import AsyncSessionDepends
from fastapi import Depends, Query
from fastapi.requests import Request
from sqlalchemy import select
from users.dependencies import UserDepends

from .models import JamModel

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


@overload
async def get_jam_or_none(
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
    allow_none: Literal[True],
) -> JamModel | None: ...


@overload
async def get_jam_or_none(
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
    allow_none: Literal[False],
) -> JamModel: ...


async def get_jam_or_none(
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
    allow_none: Annotated[bool, Query(include_in_schema=False)] = True,
) -> JamModel | None:
    statement: Select[tuple[JamModel]] = (
        select(JamModel)
        .where(JamModel.bout_id == bout_id)
        .where(JamModel.period == period_num)
        .where(JamModel.num == jam_num)
    )
    results: Result[tuple[JamModel]] = await session.execute(statement)
    return results.scalar_one_or_none() if allow_none else results.scalar_one()


async def get_jam(
    request: Request,
    user: UserDepends,
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
) -> JamModel:
    allow_none: bool = False
    jam: JamModel = await get_jam_or_none(
        session,
        bout_id,
        period_num,
        jam_num,
        allow_none,
    )

    # Optionally take a snapshot of the state
    if request.method != 'GET':
        user.stage(jam.get_snapshot())

    return jam


JamDepends: TypeAlias = Annotated[JamModel, Depends(get_jam)]
