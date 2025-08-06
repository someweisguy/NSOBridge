from typing import Final

from fastapi import APIRouter
from sqlalchemy import Result, Select, select

import models
from models import GenericBoutModel
from schemas import BoutSchema

router: Final[APIRouter] = APIRouter()


@router.get('/bout')
async def get_bout(bout_id: int | None = None) -> tuple[BoutSchema, ...] | BoutSchema:
    async with models.get_db() as session:
        statement: Select[tuple[GenericBoutModel]] = select(GenericBoutModel)
        if bout_id is not None:
            statement = statement.where(GenericBoutModel.id == bout_id)
        results: Result[tuple[GenericBoutModel]] = await session.execute(statement)
        bout_models = results.scalars()
        if bout_id is not None:
            if len(bout_models.all()) == 0:
                raise KeyError(f'Bout not found ({bout_id=})')
            return BoutSchema.model_validate(bout_models.one())
        return tuple(BoutSchema.model_validate(model) for model in bout_models)


__all__ = ('router',)
