from typing import TYPE_CHECKING, Annotated, TypeAlias

from core import AsyncSessionDepends
from fastapi import Depends, Query, Request
from sqlalchemy import select
from user import GetUser

from .models import BaseJam

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


async def _get_jam(
    request: Request,
    user: GetUser,
    session: AsyncSessionDepends,
    jam_id: Annotated[int, Query(alias='jamId')],
) -> BaseJam:
    statement: Select[tuple[BaseJam]] = select(BaseJam).where(BaseJam.id == jam_id)
    results: Result[tuple[BaseJam]] = await session.execute(statement)
    jam: BaseJam = results.scalar_one()

    # Optionally take a snapshot of the state
    if request.method != 'GET':
        user.stage(jam.get_memento())

    return jam


GetJamByID: TypeAlias = Annotated[BaseJam, Depends(_get_jam)]
