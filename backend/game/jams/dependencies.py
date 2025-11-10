from typing import TYPE_CHECKING, Annotated, Literal, TypeAlias, overload

from database import AsyncSessionDepends
from fastapi import Depends, Query
from fastapi.requests import Request
from sqlalchemy import select
from users.dependencies import UserDepends

from .models import BaseJamModel

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
) -> BaseJamModel | None: ...


@overload
async def get_jam_or_none(
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
    allow_none: Literal[False],
) -> BaseJamModel: ...


async def get_jam_or_none(
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
    allow_none: Annotated[bool, Query(include_in_schema=False)] = True,
) -> BaseJamModel | None:
    statement: Select[tuple[BaseJamModel]] = (
        select(BaseJamModel)
        .where(BaseJamModel.bout_id == bout_id)
        .where(BaseJamModel.period == period_num)
        .where(BaseJamModel.num == jam_num)
    )
    results: Result[tuple[BaseJamModel]] = await session.execute(statement)
    return results.scalar_one_or_none() if allow_none else results.scalar_one()


async def get_jam(
    request: Request,
    user: UserDepends,
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
) -> BaseJamModel:
    allow_none: bool = False
    jam: BaseJamModel = await get_jam_or_none(
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


JamDepends: TypeAlias = Annotated[BaseJamModel, Depends(get_jam)]
