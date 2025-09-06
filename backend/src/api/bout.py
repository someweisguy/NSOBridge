from typing import Annotated, AsyncGenerator, Final, Sequence

from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy import Result, Select, select

import models
from models import AsyncSession, GenericBoutModel
from models.bout import BoutContext, GenericDataBoutModel
from models.rulesets.wftda_2025 import BoutModel
from models.series import SeriesModel
from models.team import RosterModel
from schemas import BoutSchema
from schemas.bout import BoutContextSchema
from schemas.series import SeriesSchema

router: Final[APIRouter] = APIRouter()

# TODO: bout dependency injection


async def inject_db() -> AsyncGenerator[AsyncSession]:
    async with models.get_db() as session:
        yield session
        await session.commit()


DatabaseDepends = Annotated[AsyncSession, Depends(inject_db)]


@router.get('/series', response_model=SeriesSchema)
async def get_series(
    db: DatabaseDepends, index: int = Query(default=0, alias='seriesIndex')
) -> SeriesModel:
    statement: Select[tuple[SeriesModel]] = (
        select(SeriesModel).limit(1).offset(index - 1)
    )
    results: Result[tuple[SeriesModel]] = await db.execute(statement)
    series: SeriesModel | None = (
        results.scalar_one_or_none() if index == 0 else results.scalar_one()
    )
    if series is None:
        # No default Series exists so instantiate one
        series = SeriesModel()
        db.add(series)
        await db.flush()
    return series


@router.get('/bout', response_model=BoutSchema)
async def get_bout(
    db: DatabaseDepends, bout_id: int = Query(alias='boutId')
) -> GenericBoutModel:
    statement = select(GenericBoutModel).where(GenericBoutModel.id == bout_id)
    results = await db.execute(statement)
    return results.scalar_one()


async def get_rosters(
    db: DatabaseDepends, roster_ids: list[int] = Body(alias='rosterIds')
) -> Sequence[RosterModel]:
    if len(roster_ids) == 0:
        raise ValueError('At least one Roster ID is required')
    if len(roster_ids) != len(set(roster_ids)):
        raise ValueError('Duplicate Roster IDs are not permitted')
    results: Result[tuple[RosterModel]] = await db.execute(
        select(RosterModel).where(RosterModel.id.in_(roster_ids))
    )
    rosters: Sequence[RosterModel] = results.scalars().all()
    if len(rosters) != len(roster_ids):
        raise KeyError('Unknown Roster ID provided')
    return rosters


@router.post('/bout')
async def create_bout(
    db: DatabaseDepends,
    series: Annotated[SeriesModel, Depends(get_series)],
    rosters: Annotated[Sequence[RosterModel], Depends(get_rosters)],
    ruleset: str = Body(),
    order: int = Body(default=0),
) -> None:
    bout = GenericDataBoutModel(series, ruleset, *rosters)
    db.add(bout)


@router.get('/bout-context', response_model=BoutContextSchema)
async def get_bout_context(
    bout: Annotated[BoutModel, Depends(get_bout)],
) -> BoutContext:
    return bout.context


__all__ = ('router',)
