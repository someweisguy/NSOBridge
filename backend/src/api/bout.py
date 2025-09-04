from typing import Final

from fastapi import APIRouter
from sqlalchemy import Result, Select, select

import models
from models import GenericBoutModel
from models.bout import GenericDataBoutModel
from models.series import SeriesModel
from models.team import RosterModel, TeamModel
from schemas import BoutSchema
from schemas.bout import BoutContextSchema
from schemas.series import SeriesSchema

router: Final[APIRouter] = APIRouter()

# TODO: bout dependency injection


@router.get('/series')
async def get_series(index: int) -> SeriesSchema:
    async with models.get_db() as session:
        statement: Select[tuple[SeriesModel]] = (
            select(SeriesModel).limit(1).offset(index - 1)
        )
        results: Result[tuple[SeriesModel]] = await session.execute(statement)
        series: SeriesModel | None = (
            results.scalar_one_or_none() if index == 0 else results.scalar_one()
        )
        if series is None:
            # TODO: Warn that a default Series had to be instantiated
            series = SeriesModel()
            session.add(series)
            await session.flush()
        return SeriesSchema.model_validate(series)


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


@router.post('/bout')
async def create_bout(
    ruleset: str, roster_ids: list[int], series_index: int = 0, order: int | None = 0
) -> None:
    async with models.get_db() as session:
        # FIXME: should team name be tied to rosters?
        series: SeriesModel = SeriesModel()  # FIXME: lookup Series by index
        rosters: list[RosterModel] = []  # FIXME: lookup Rosters by ID or get defaults
        bout: GenericDataBoutModel = GenericDataBoutModel(
            series,
            ruleset,
            *[
                TeamModel(name, roster)
                for name, roster in zip(['Home', 'away'], rosters)
            ],
        )
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
