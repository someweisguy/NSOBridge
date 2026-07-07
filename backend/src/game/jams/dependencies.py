"""The FastAPI dependencies methods for Jams."""

from typing import Annotated, TypeAlias
from uuid import UUID

from core.db import GetAsyncSession
from core.users import GetUser
from fastapi import Depends, Query, Request
from sqlalchemy import Result, Select, select

from .models import Jam


async def _get_jam(  # noqa: PLR0913
    request: Request,
    user: GetUser,
    session: GetAsyncSession,
    bout_uuid: Annotated[UUID, Query(alias='boutUuid')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
) -> Jam:
    # TODO: polish this method
    statement: Select[tuple[Jam]] = (
        select(Jam)
        .where(Jam.bout_uuid == bout_uuid)
        .where(Jam.period == period_num)
        .where(Jam.num == jam_num)
    )
    results: Result[tuple[Jam]] = await session.execute(statement)
    jam: Jam = results.scalar_one()

    if request.method != 'GET':
        user.stage(jam.get_memento())

    return jam


GetJam: TypeAlias = Annotated[Jam, Depends(_get_jam)]
