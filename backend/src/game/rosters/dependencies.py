"""The FastAPI dependencies methods for Rosters."""

from typing import Annotated, TypeAlias

from core import AsyncSessionDepends
from core.exceptions import ModelLookupError
from fastapi import Depends, Query
from sqlalchemy import Result, select
from sqlalchemy.exc import NoResultFound

from .models import Roster


async def _get_roster(
    session: AsyncSessionDepends,
    roster_id: Annotated[int, Query(alias='rosterId')],
) -> Roster:
    results: Result[tuple[Roster]] = await session.execute(
        select(Roster).where(Roster._id == roster_id)
    )

    try:
        roster: Roster = results.scalar_one()
    except NoResultFound as e:
        raise ModelLookupError(f'Could not find Roster with ID {roster_id}') from e

    # TODO: handle mementos

    return roster


GetRoster: TypeAlias = Annotated[Roster, Depends(_get_roster)]
