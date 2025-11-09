from typing import TYPE_CHECKING, Annotated, Literal, TypeAlias, overload

from database import AsyncSessionDepends
from fastapi import Depends, Query
from sqlalchemy import select

from .models import TimeoutModel

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


@overload
async def get_timeout_or_none(
    session: AsyncSessionDepends,
    bout_id: int,
    index: int,
    allow_none: Literal[True],
) -> TimeoutModel | None: ...


@overload
async def get_timeout_or_none(
    session: AsyncSessionDepends,
    bout_id: int,
    index: int,
    allow_none: Literal[False],
) -> TimeoutModel: ...


async def get_timeout_or_none(
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    index: Annotated[int, Query(alias='index')],
    allow_none: Annotated[
        bool, Query(alias='allowNone', include_in_schema=False)
    ] = True,
) -> TimeoutModel | None:
    statement: Select[tuple[TimeoutModel]] = (
        select(TimeoutModel)
        .where(TimeoutModel.bout_id == bout_id)
        .offset(index - 1)
        .limit(1)
    )
    results: Result[tuple[TimeoutModel]] = await session.execute(statement)
    return results.scalar_one_or_none() if allow_none else results.scalar_one()


async def get_timeout(
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    index: Annotated[int, Query(alias='index')],
) -> TimeoutModel:
    allow_none: bool = False
    return await get_timeout_or_none(
        session,
        bout_id,
        index,
        allow_none,
    )


TimeoutDepends: TypeAlias = Annotated[TimeoutModel, Depends(get_timeout)]
