"""The FastAPI dependencies methods for Jams."""

from http import HTTPStatus
from typing import Annotated, TypeAlias
from uuid import UUID

from core.db import GetAsyncSession
from fastapi import Depends, HTTPException, Query
from game.bouts.models import BaseBout
from sqlalchemy import Result, Select, select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import selectinload

from .models import Jam


async def _get_jam(
    session: GetAsyncSession,
    bout_uuid: Annotated[UUID, Query(alias='boutUuid')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
) -> Jam:
    statement: Select[tuple[Jam]] = (
        select(Jam)
        # Use `selectinload` to allow cache updates of Bout models when Jam is mutated
        .options(selectinload(Jam.bout).selectinload(BaseBout.jams))
        .where(Jam._bout_uuid == bout_uuid)
        .where(Jam.period == period_num)
        .where(Jam.num == jam_num)
    )
    results: Result[tuple[Jam]] = await session.execute(statement)

    try:
        jam: Jam = results.scalar_one()
    except NoResultFound as e:
        raise HTTPException(HTTPStatus.NOT_FOUND, 'Could not find Jam') from e

    return jam


GetJam: TypeAlias = Annotated[Jam, Depends(_get_jam)]
