from collections.abc import Sequence
from typing import Annotated, TypeAlias

from database import AsyncSessionDepends
from fastapi import Depends, Query
from sqlalchemy import Result, select

from .models import Roster


async def get_rosters(
    session: AsyncSessionDepends,
    roster_ids: Annotated[list[int], Query(alias='rosterId')],
) -> Sequence[Roster]:
    results: Result[tuple[Roster]] = await session.execute(
        select(Roster).where(Roster.id.in_(roster_ids))
    )
    rosters: Sequence[Roster] = results.scalars().all()
    return rosters


async def get_roster(
    session: AsyncSessionDepends,
    roster_id: Annotated[list[int], Query(alias='id')],
) -> Roster:
    results: Result[tuple[Roster]] = await session.execute(
        select(Roster).where(Roster.id == roster_id)
    )
    roster: Roster = results.scalar_one()
    return roster


RosterDepends: TypeAlias = Annotated[Sequence[Roster], Depends(get_rosters)]

GetRoster: TypeAlias = Annotated[Roster, Depends(get_roster)]
