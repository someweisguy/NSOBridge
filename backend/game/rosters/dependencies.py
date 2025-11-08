from collections.abc import Sequence
from typing import Annotated, TypeAlias

from database import AsyncSessionDepends
from fastapi import Depends, Query
from sqlalchemy import Result, select

from .models import RosterModel


async def get_rosters(
    session: AsyncSessionDepends,
    roster_ids: Annotated[list[int], Query(alias='rosterId')],
) -> Sequence[RosterModel]:
    results: Result[tuple[RosterModel]] = await session.execute(
        select(RosterModel).where(RosterModel.id.in_(roster_ids))
    )
    rosters: Sequence[RosterModel] = results.scalars().all()
    return rosters


RosterDepends: TypeAlias = Annotated[Sequence[RosterModel], Depends(get_rosters)]
