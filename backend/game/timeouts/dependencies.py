from typing import TYPE_CHECKING, Annotated, Literal, TypeAlias, overload

from database import AsyncSessionDepends
from fastapi import Depends, Query, Request
from sqlalchemy import select
from users.dependencies import UserDepends

from .models import BaseTimeout

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


@overload
async def get_timeout_or_none(
    session: AsyncSessionDepends,
    bout_id: int,
    index: int,
    allow_none: Literal[True],
) -> BaseTimeout | None: ...


@overload
async def get_timeout_or_none(
    session: AsyncSessionDepends,
    bout_id: int,
    index: int,
    allow_none: Literal[False],
) -> BaseTimeout: ...


async def get_timeout_or_none(
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    index: Annotated[int, Query(alias='index')],
    allow_none: Annotated[bool, Query(include_in_schema=False)] = True,
) -> BaseTimeout | None:
    statement: Select[tuple[BaseTimeout]] = (
        select(BaseTimeout)
        .where(BaseTimeout.bout_id == bout_id)
        .offset(index - 1)
        .limit(1)
    )
    results: Result[tuple[BaseTimeout]] = await session.execute(statement)
    return results.scalar_one_or_none() if allow_none else results.scalar_one()


async def get_timeout(
    request: Request,
    user: UserDepends,
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    index: Annotated[int, Query(alias='index')],
) -> BaseTimeout:
    allow_none: bool = False
    timeout: BaseTimeout | None = await get_timeout_or_none(
        session,
        bout_id,
        index,
        allow_none,
    )
    if timeout is None:
        raise IndexError('timeout not found')

    # Optionally take a snapshot of the Timeout state
    if request.method != 'GET':
        user.stage(timeout.get_snapshot())
    return timeout


TimeoutDepends: TypeAlias = Annotated[BaseTimeout, Depends(get_timeout)]
