"""The FastAPI dependencies methods for Jams."""

from http import HTTPStatus
from typing import TYPE_CHECKING, Annotated, TypeAlias

from core import AsyncSessionDepends, ChainedClientError
from fastapi import Depends, Query, Request
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound
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

    try:
        jam: BaseJam = results.scalar_one()
    except NoResultFound as e:
        raise ChainedClientError(
            f'Could not find Jam with ID {jam_id}', status_code=HTTPStatus.NOT_FOUND
        ) from e

    if request.method != 'GET':
        user.stage(jam.get_memento())

    return jam


GetJamByID: TypeAlias = Annotated[BaseJam, Depends(_get_jam)]
