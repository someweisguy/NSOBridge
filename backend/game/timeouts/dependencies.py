from typing import TYPE_CHECKING, Annotated, TypeAlias

from database import AsyncSessionDepends
from fastapi import Depends, Query
from sqlalchemy import select

from .models import TimeoutModel

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


async def get_timeout(
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    index: Annotated[int, Query(alias='index')],
) -> TimeoutModel:
    statement: Select[tuple[TimeoutModel]] = (
        select(TimeoutModel)
        .where(TimeoutModel.bout_id == bout_id)
        .offset(index - 1)
        .limit(1)
    )
    results: Result[tuple[TimeoutModel]] = await session.execute(statement)
    return results.scalar_one()


TimeoutDepends: TypeAlias = Annotated[TimeoutModel, Depends(get_timeout)]
