"""The FastAPI dependencies methods for Bouts."""

from typing import TYPE_CHECKING, Annotated, TypeAlias
from uuid import UUID

from core.exceptions import ModelLookupError
from db import GetAsyncSession
from fastapi import Depends, Query, Request
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound
from user import GetUser

from .models import AbstractBout

if TYPE_CHECKING:
    from sqlalchemy import Result, Select


async def _get_bout(
    request: Request,
    user: GetUser,
    session: GetAsyncSession,
    bout_uuid: Annotated[UUID, Query(alias='boutUuid')],
) -> AbstractBout:
    statement: Select[tuple[AbstractBout]] = select(AbstractBout).where(
        AbstractBout.uuid == bout_uuid
    )
    results: Result[tuple[AbstractBout]] = await session.execute(statement)

    try:
        bout: AbstractBout = results.scalar_one()
    except NoResultFound as e:
        raise ModelLookupError(f'Could not find Bout ({bout_uuid=})') from e

    # Optionally take a snapshot of the Bout state and return the Bout
    if request.method != 'GET':
        user.stage(bout.get_memento())
    return bout


GetBout: TypeAlias = Annotated[AbstractBout, Depends(_get_bout)]
