from typing import TYPE_CHECKING, Annotated, TypeAlias

from database import AsyncSessionDepends
from fastapi import Depends, Query
from sqlalchemy import select

from .models import Series

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


async def get_series(
    session: AsyncSessionDepends, index: Annotated[int, Query(alias='seriesIndex')]
) -> Series:
    statement: Select[tuple[Series]] = select(Series).offset(index - 1).limit(1)
    results: Result[tuple[Series]] = await session.execute(statement)
    series: Series | None = (
        results.scalar_one_or_none() if index == 1 else results.scalar_one()
    )
    if series is None:
        # No default Series exists so instantiate one
        series = Series()
        session.add(series)
        await session.flush()
    return series


SeriesDepends: TypeAlias = Annotated[Series, Depends(get_series)]
