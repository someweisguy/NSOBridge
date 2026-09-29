"""The FastAPI dependencies methods for Timeouts."""

from http import HTTPStatus
from typing import Annotated, TypeAlias
from uuid import UUID

from core.users import GetUser
from fastapi import Depends, HTTPException, Query
from sqlalchemy import Result, Select, select
from sqlalchemy.exc import NoResultFound

from .models import Timeout


async def _get_timeout(
    user: GetUser,
    uuid: Annotated[UUID, Query()],
) -> Timeout:
    statement: Select[tuple[Timeout]] = select(Timeout).where(Timeout.uuid == uuid)
    results: Result[tuple[Timeout]] = await user.session.execute(statement)

    try:
        timeout: Timeout = results.scalar_one()
    except NoResultFound as e:
        raise HTTPException(HTTPStatus.NOT_FOUND, 'Could not find Timeout') from e

    return timeout


GetTimeout: TypeAlias = Annotated[Timeout, Depends(_get_timeout)]
