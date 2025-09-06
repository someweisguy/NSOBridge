from typing import Annotated, AsyncGenerator, Final, Sequence

from fastapi import APIRouter, Depends
from sqlalchemy import Result, Select, select

import models
from models import AsyncSession, GenericBoutModel
from models.bout import GenericDataBoutModel
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
async def get_series(db: DatabaseDepends, series_index: int) -> SeriesModel:
    statement: Select[tuple[SeriesModel]] = (
        select(SeriesModel).limit(1).offset(series_index - 1)
    )
    results: Result[tuple[SeriesModel]] = await db.execute(statement)
    series: SeriesModel | None = (
        results.scalar_one_or_none() if series_index == 0 else results.scalar_one()
    )
    if series is None:
        # No default Series exists so instantiate one
        series = SeriesModel()
        db.add(series)
        await db.flush()
    return series


@router.get('/bout')
async def get_bout(key: int | None = None) -> tuple[BoutSchema, ...] | BoutSchema:
    async with models.get_db() as session:
        statement: Select[tuple[GenericBoutModel]] = select(GenericBoutModel)
        if key is not None:
            statement = statement.where(GenericBoutModel.id == key)
        results: Result[tuple[GenericBoutModel]] = await session.execute(statement)
        bout_models = results.scalars()
        if key is not None:
            model: GenericBoutModel | None = bout_models.first()
            if model is None:
                raise KeyError(f'Bout not found ({key=})')
            return BoutSchema.model_validate(model)
        return tuple(BoutSchema.model_validate(model) for model in bout_models)


async def get_rosters(roster_ids: list[int]) -> Sequence[RosterModel]:
    if len(roster_ids) == 0:
        raise ValueError('At least one Roster ID is required')
    if len(roster_ids) != len(set(roster_ids)):
        raise ValueError('Duplicate Roster IDs are not permitted')
    async with models.get_db() as session:
        results: Result[tuple[RosterModel]] = await session.execute(
            select(RosterModel).where(RosterModel.id.in_(roster_ids))
        )
        rosters: Sequence[RosterModel] = results.scalars().all()
        if len(rosters) != len(roster_ids):
            raise KeyError('Unknown Roster ID provided')
        return rosters


@router.post('/bout')
async def create_bout(
    ruleset: str,
    rosters: Annotated[Sequence[RosterModel], Depends(get_rosters)],
    series: Annotated[SeriesModel, Depends(get_series)],
    order: int | None = 0,
) -> None:
    async with models.get_db() as session:
        bout: GenericDataBoutModel = GenericDataBoutModel(series, ruleset, *rosters)
        session.add(bout)
        await session.commit()


@router.get('/bout-context')
async def get_bout_context(key: int) -> BoutContextSchema:
    async with models.get_db() as session:
        statement: Select[tuple[GenericBoutModel]] = select(GenericBoutModel).where(
            GenericBoutModel.id == key
        )
        results: Result[tuple[GenericBoutModel]] = await session.execute(statement)
        model: GenericBoutModel | None = results.scalars().first()
        if model is None:
            raise KeyError(f'Bout not found ({key=})')
        return BoutContextSchema.model_validate(model.context)


__all__ = ('router',)
