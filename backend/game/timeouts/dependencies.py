from typing import TYPE_CHECKING, Annotated, TypeAlias

from database import AsyncSessionDepends
from fastapi import Depends, Query
from game.timeouts.models import TimeoutModel
from sqlalchemy import select

from .models import TimeoutModel

if TYPE_CHECKING:
    from sqlalchemy.sql.selectable import Select


async def get_timeout(
    db: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    timeout_index: Annotated[int, Query(alias='timeoutIndex')],
) -> TimeoutModel:
    statement: Select[tuple[TimeoutModel]] = (
        select(TimeoutModel)
        .where(TimeoutModel.bout_id == bout_id)
        .offset(timeout_index - 1)
        .limit(1)
    )
    results = await db.execute(statement)
    return results.scalar_one()


TimeoutDepends: TypeAlias = Annotated[TimeoutModel, Depends(get_timeout)]
