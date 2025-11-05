from typing import Annotated

from core.database import AsyncSessionDepends
from fastapi import Depends, Query
from models import GenericBoutModel
from sqlalchemy import inspect, select


async def get_bout(
    session: AsyncSessionDepends, bout_id: Annotated[int, Query(alias='boutId')]
) -> GenericBoutModel:
    statement = select(GenericBoutModel).where(GenericBoutModel.id == bout_id)
    results = await session.execute(statement)
    bout: GenericBoutModel = results.scalar_one()
    session.expunge(bout)
    return bout


BoutDepends = Annotated[GenericBoutModel, Depends(get_bout)]
