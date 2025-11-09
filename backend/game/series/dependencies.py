from typing import TYPE_CHECKING, Annotated, TypeAlias

from database import AsyncSessionDepends
from fastapi import Depends, Query
from sqlalchemy import select

from .models import SeriesModel

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


async def get_series(
    session: AsyncSessionDepends, index: Annotated[int, Query(alias='seriesIndex')]
) -> SeriesModel:
    statement: Select[tuple[SeriesModel]] = (
        select(SeriesModel).offset(index - 1).limit(1)
    )
    results: Result[tuple[SeriesModel]] = await session.execute(statement)
    series: SeriesModel | None = (
        results.scalar_one_or_none() if index == 1 else results.scalar_one()
    )
    if series is None:
        # No default Series exists so instantiate one
        series = SeriesModel()
        session.add(series)
        await session.flush()
    return series


SeriesDepends: TypeAlias = Annotated[SeriesModel, Depends(get_series)]
