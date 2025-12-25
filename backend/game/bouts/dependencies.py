from typing import TYPE_CHECKING, Annotated, TypeAlias

from core.dependencies import AsyncSessionDepends
from fastapi import Depends, Query, Request
from sqlalchemy import select
from users.dependencies import UserDepends

from .models import BaseBout

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


async def get_bout(
    request: Request,
    user: UserDepends,
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
) -> BaseBout:
    # Query the database for the desired Bout
    statement: Select[tuple[BaseBout]] = select(BaseBout).where(BaseBout.id == bout_id)
    results: Result[tuple[BaseBout]] = await session.execute(statement)
    bout: BaseBout = results.scalar_one()

    # Optionally take a snapshot of the Bout state and return the Bout
    if request.method != 'GET':
        user.stage(bout.get_snapshot(session))
    return bout


BoutDepends: TypeAlias = Annotated[BaseBout, Depends(get_bout)]
