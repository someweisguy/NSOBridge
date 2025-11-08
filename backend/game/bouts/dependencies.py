from typing import TYPE_CHECKING, Annotated, TypeAlias

from database import AsyncSessionDepends
from fastapi import Depends, Query, Request
from game.bouts.models import GenericBoutModel
from sqlalchemy import select
from users.dependencies import UserDepends

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


async def get_bout(
    request: Request,
    user: UserDepends,
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
) -> GenericBoutModel:
    # Query the database for the desired Bout
    statement: Select[tuple[GenericBoutModel]] = select(GenericBoutModel).where(
        GenericBoutModel.id == bout_id
    )
    results: Result[tuple[GenericBoutModel]] = await session.execute(statement)
    bout: GenericBoutModel = results.scalar_one()

    # Optionally take a snapshot of the Bout state and return the Bout
    if request.method != 'GET':
        user.stage(bout.get_snapshot())
    return bout


BoutDepends: TypeAlias = Annotated[GenericBoutModel, Depends(get_bout)]
