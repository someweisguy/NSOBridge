from typing import Final

from fastapi import APIRouter
from sqlalchemy import Result, Select, select

import models
from models import GenericBoutModel
from schemas import BoutSchema

router: Final[APIRouter] = APIRouter()


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


__all__ = ('router',)
