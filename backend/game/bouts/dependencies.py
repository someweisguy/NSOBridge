from typing import TYPE_CHECKING, Annotated, TypeAlias

from database import AsyncSessionDepends
from fastapi import Depends, Query, Request
from sqlalchemy import select
from users.dependencies import UserDepends

from .models import BaseBoutModel

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


async def get_bout(
    request: Request,
    user: UserDepends,
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
) -> BaseBoutModel:
    # Query the database for the desired Bout
    statement: Select[tuple[BaseBoutModel]] = select(BaseBoutModel).where(
        BaseBoutModel.id == bout_id
    )
    results: Result[tuple[BaseBoutModel]] = await session.execute(statement)
    bout: BaseBoutModel = results.scalar_one()

    # Optionally take a snapshot of the Bout state and return the Bout
    if request.method != 'GET':
        user.stage(bout.get_snapshot())
    return bout


BoutDepends: TypeAlias = Annotated[BaseBoutModel, Depends(get_bout)]
