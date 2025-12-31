"""The FastAPI dependencies methods for Bouts."""

from typing import TYPE_CHECKING, Annotated, TypeAlias

from core import AsyncSessionDepends
from fastapi import Depends, Query, Request
from sqlalchemy import select
from user import GetUser

from .models import BaseBout

if TYPE_CHECKING:
    from sqlalchemy import Result, Select


async def _get_bout(
    request: Request,
    user: GetUser,
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
) -> BaseBout:
    # Query the database for the desired Bout
    statement: Select[tuple[BaseBout]] = select(BaseBout).where(BaseBout.id == bout_id)
    results: Result[tuple[BaseBout]] = await session.execute(statement)
    bout: BaseBout = results.scalar_one()

    # Optionally take a snapshot of the Bout state and return the Bout
    if request.method != 'GET':
        user.stage(bout.get_memento())
    return bout


BoutDepends: TypeAlias = Annotated[BaseBout, Depends(_get_bout)]
