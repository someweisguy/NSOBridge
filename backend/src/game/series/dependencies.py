"""The FastAPI dependencies methods for Series."""

from typing import TYPE_CHECKING, Annotated, TypeAlias
from uuid import UUID

from core.exceptions import ModelLookupError
from core.users import GetUser
from db import GetAsyncSession
from fastapi import Depends, Query, Request
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound

from .models import Series

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


async def _get_series(
    request: Request,
    user: GetUser,
    session: GetAsyncSession,
    series_uuid: Annotated[UUID, Query(alias='seriesUuid')],
) -> Series:
    statement: Select[tuple[Series]] = select(Series).where(Series.uuid == series_uuid)
    results: Result[tuple[Series]] = await session.execute(statement)

    try:
        series: Series = results.scalar_one()
    except NoResultFound as e:
        raise ModelLookupError(f'Could not find Series ({series_uuid=})') from e

    # Optionally take a snapshot of the Bout state and return the Bout
    if request.method != 'GET':
        user.stage(series.get_memento())
    return series


async def _get_optional_series(
    request: Request,
    user: GetUser,
    session: GetAsyncSession,
    series_uuid: Annotated[UUID | None, Query(alias='seriesUuid')] = None,
) -> Series | None:
    if series_uuid is None:
        return None

    statement: Select[tuple[Series]] = select(Series).where(Series.uuid == series_uuid)
    results: Result[tuple[Series]] = await session.execute(statement)

    try:
        series: Series = results.scalar_one()
    except NoResultFound as e:
        raise ModelLookupError(f'Could not find Series ({series_uuid=})') from e

    # Optionally take a snapshot of the Bout state and return the Bout
    if request.method != 'GET':
        user.stage(series.get_memento())
    return series


GetSeries: TypeAlias = Annotated[Series, Depends(_get_series)]
GetOptionalSeries: TypeAlias = Annotated[Series | None, Depends(_get_optional_series)]
