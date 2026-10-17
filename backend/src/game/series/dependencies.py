"""The FastAPI dependencies methods for Series."""

from http import HTTPStatus
from typing import TYPE_CHECKING, Annotated, Sequence, TypeAlias, cast
from uuid import UUID

from core.db import GetAsyncSession
from core.users import GetUser
from fastapi import Depends, HTTPException, Query, Request
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound

from .models import Series

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


async def get_series(
    user: GetUser,
    series_uuid: Annotated[UUID | None, Query(alias='seriesUuid')] = None,
) -> Series | Sequence[Series]:
    """Get one or multiple Series.

    Args:
        user (GetUser): The User performing the operation.
        series_uuid (Annotated[UUID  |  None, Query, optional): The UUID of the desired
        Series. Defaults to 'seriesUuid')]=None.

    Raises:
        HTTPException: If no such Series was found.

    Returns:
        Series | Sequence[Series]: the desired Series or multiple Series.

    """
    statement: Select[Series] = select(Series)
    if series_uuid is not None:
        statement = statement.where(Series.uuid == series_uuid)
    results: Result[Series] = await user.session.execute(statement)

    try:
        if series_uuid is not None:
            return results.scalar_one()

        return results.scalars().all()
    except NoResultFound as e:
        raise HTTPException(
            HTTPStatus.NOT_FOUND, f'Could not find Series ({series_uuid=})'
        ) from e


async def _get_one_series(
    user: GetUser,
    series_uuid: Annotated[UUID, Query(alias='seriesUuid')],
) -> Series:
    return cast('Series', await get_series(user, series_uuid))


async def _get_optional_series(
    request: Request,
    user: GetUser,
    session: GetAsyncSession,
    series_uuid: Annotated[UUID | None, Query(alias='seriesUuid')] = None,
) -> Series | None:
    if series_uuid is None:
        return None

    statement: Select[Series] = select(Series).where(Series.uuid == series_uuid)
    results: Result[Series] = await session.execute(statement)

    try:
        series: Series = results.scalar_one()
    except NoResultFound as e:
        raise HTTPException(
            HTTPStatus.NOT_FOUND, f'Could not find Series ({series_uuid=})'
        ) from e

    return series


GetSeries: TypeAlias = Annotated[Series, Depends(_get_one_series)]
GetOptionalSeries: TypeAlias = Annotated[Series | None, Depends(_get_optional_series)]
