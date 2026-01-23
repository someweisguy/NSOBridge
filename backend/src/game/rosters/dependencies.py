"""The FastAPI dependencies methods for Rosters."""

from typing import Annotated, TypeAlias

from core import AsyncSessionDepends
from core.exceptions import ModelLookupError
from fastapi import Depends, Query
from sqlalchemy import Result, Select, select
from sqlalchemy.exc import NoResultFound

from .models import Roster


async def _get_roster(
    session: AsyncSessionDepends,
    uuid: Annotated[int, Query(alias='rosterId')],
) -> Roster:
    statement: Select[tuple[Roster]] = select(Roster).where(Roster.uuid == uuid)
    results: Result[tuple[Roster]] = await session.execute(statement)

    try:
        roster: Roster = results.scalar_one()
    except NoResultFound as e:
        raise ModelLookupError(f'Could not find Roster with UUID {uuid}') from e

    # TODO: handle mementos

    return roster


GetRoster: TypeAlias = Annotated[Roster, Depends(_get_roster)]
