from typing import Final

from fastapi import APIRouter
from sqlalchemy import Result, Select, select

import models
from models import GenericBoutModel
from models.series import SeriesModel
from schemas import BoutSchema
from schemas.bout import BoutContextSchema
from schemas.series import SeriesSchema

router: Final[APIRouter] = APIRouter()

# TODO: bout dependency injection


@router.get('/series')
async def get_series(key: int) -> SeriesSchema:
    async with models.get_db() as session:
        statement: Select[tuple[SeriesModel]] = select(SeriesModel).where(
            SeriesModel.id == key
        )
        results: Result[tuple[SeriesModel]] = await session.execute(statement)
        return SeriesSchema.model_validate(results.scalar_one())


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
