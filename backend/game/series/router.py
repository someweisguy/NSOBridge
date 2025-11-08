from typing import Annotated, Final, TypeAlias

from database import AsyncSessionDepends
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select

from .models import SeriesModel
from .schemas import SeriesSchema

router: Final[APIRouter] = APIRouter(prefix='/series')


@router.get('', response_model=SeriesSchema)
async def get_series(
    session: AsyncSessionDepends, index: Annotated[int, Query(alias='seriesIndex')]
) -> SeriesModel:
    statement = select(SeriesModel).limit(1).offset(index - 1)
    results = await session.execute(statement)
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

__all__ = ('router',)
