"""The FastAPI dependencies methods for Timeouts."""

from typing import TYPE_CHECKING, Annotated, TypeAlias

from core import AsyncSessionDepends
from core.exceptions import ModelLookupError
from fastapi import Depends, Query, Request
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound
from user import GetUser

from .models import BaseTimeout

if TYPE_CHECKING:
    from sqlalchemy import Result, Select


async def _get_timeout(
    request: Request,
    user: GetUser,
    session: AsyncSessionDepends,
    timeout_id: Annotated[int, Query(alias='timeoutId')],
) -> BaseTimeout:
    statement: Select[tuple[BaseTimeout]] = select(BaseTimeout).where(
        BaseTimeout.id == timeout_id
    )
    results: Result[tuple[BaseTimeout]] = await session.execute(statement)

    try:
        timeout: BaseTimeout = results.scalar_one()
    except NoResultFound as e:
        raise ModelLookupError(f'Could not find Timeout with ID {timeout_id}') from e

    # Optionally take a snapshot of the Timeout state
    if request.method != 'GET':
        user.stage(timeout.get_memento())
    return timeout


GetTimeoutByID: TypeAlias = Annotated[BaseTimeout, Depends(_get_timeout)]
