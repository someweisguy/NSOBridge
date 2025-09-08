from typing import Annotated, Final

from fastapi import APIRouter, Depends, Query
from models.series import SeriesModel
from schemas.series import SeriesSchema
from sqlalchemy import select

from .api import DatabaseDepends

router: Final[APIRouter] = APIRouter(prefix='/series')


@router.get('', response_model=SeriesSchema)
async def get_series(
    db: DatabaseDepends, index: int = Query(alias='seriesIndex')
) -> SeriesModel:
    statement = select(SeriesModel).limit(1).offset(index - 1)
    results = await db.execute(statement)
    series: SeriesModel | None = (
        results.scalar_one_or_none() if index == 0 else results.scalar_one()
    )
    if series is None:
        # No default Series exists so instantiate one
        series = SeriesModel()
        db.add(series)
        await db.flush()
    return series


SeriesDepends = Annotated[SeriesModel, Depends(get_series)]

__all__ = ('router',)
