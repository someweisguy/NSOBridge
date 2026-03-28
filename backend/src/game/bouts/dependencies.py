"""The FastAPI dependencies methods for Bouts."""

from typing import TYPE_CHECKING, Annotated, TypeAlias
from uuid import UUID

from core.exceptions import ModelLookupError
from db import GetAsyncSession
from fastapi import Depends, Query, Request
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound
from user import GetUser

from .models import Bout

if TYPE_CHECKING:
    from sqlalchemy import Result, Select


async def _get_bout(
    request: Request,
    user: GetUser,
    session: GetAsyncSession,
    bout_uuid: Annotated[UUID, Query(alias='boutUuid')],
) -> Bout:
    statement: Select[tuple[Bout]] = select(Bout).where(Bout.uuid == bout_uuid)
    results: Result[tuple[Bout]] = await session.execute(statement)

    try:
        bout: Bout = results.scalar_one()
    except NoResultFound as e:
        raise ModelLookupError(f'Could not find Bout ({bout_uuid=})') from e

    # Optionally take a snapshot of the Bout state and return the Bout
    if request.method != 'GET':
        user.stage(bout.get_memento())
    return bout


GetBout: TypeAlias = Annotated[Bout, Depends(_get_bout)]
