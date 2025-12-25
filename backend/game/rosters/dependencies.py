from typing import Annotated, TypeAlias

from core.dependencies import AsyncSessionDepends
from fastapi import Depends, Query
from sqlalchemy import Result, select

from .models import Roster


async def get_roster(
    session: AsyncSessionDepends,
    roster_id: Annotated[int, Query(alias='rosterId')],
) -> Roster:
    results: Result[tuple[Roster]] = await session.execute(
        select(Roster).where(Roster.id == roster_id)
    )
    roster: Roster = results.scalar_one()
    return roster


GetRoster: TypeAlias = Annotated[Roster, Depends(get_roster)]
